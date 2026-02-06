use anchor_lang::prelude::*;

declare_program!(wormhole_verify_vaa_shim);

use solana_program::keccak;
use wormhole_verify_vaa_shim::cpi::accounts::VerifyHash;
use wormhole_verify_vaa_shim::program::WormholeVerifyVaaShim;

use crate::constants::{
    ANCHOR_DISCRIMINATOR_LEN, MAX_PAYLOAD_SIZE, VAA_BODY_MIN_LEN, VERIFIED_MESSAGE_SEED,
};
use crate::errors::VerifierError;
use crate::state::verified_message::VerifiedMessage;

#[derive(Accounts)]
pub struct VerifyVaa<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Guardian set used for signature verification by shim.
    /// Derivation is checked by the shim.
    guardian_set: UncheckedAccount<'info>,

    /// CHECK: Stored guardian signatures to be verified by shim.
    /// Ownership ownership and discriminator is checked by the shim.
    guardian_signatures: UncheckedAccount<'info>,

    /// CHECK: PDA created and initialized manually as part of verification flow.
    #[account(mut)]
    pub verified_message: UncheckedAccount<'info>,

    wormhole_verify_vaa_shim: Program<'info, WormholeVerifyVaaShim>,
    pub system_program: Program<'info, System>,
}

pub fn verify_vaa(ctx: Context<VerifyVaa>, guardian_set_bump: u8, vaa_body: Vec<u8>) -> Result<()> {
    // Ensure the verified message PDA does not already exist
    require!(
        ctx.accounts.verified_message.lamports() == 0,
        VerifierError::VerifiedMessageAlreadyExists
    );

    // Enforce an upper bound on payload size
    require!(
        vaa_body.len() <= MAX_PAYLOAD_SIZE,
        VerifierError::PayloadTooLarge
    );

    // Hash the VAA body and verify signatures via Wormhole shim
    let message_hash = &solana_program::keccak::hashv(&[&vaa_body]).to_bytes();
    let digest = keccak::hash(message_hash.as_slice()).to_bytes();

    wormhole_verify_vaa_shim::cpi::verify_hash(
        CpiContext::new(
            ctx.accounts.wormhole_verify_vaa_shim.to_account_info(),
            VerifyHash {
                guardian_set: ctx.accounts.guardian_set.to_account_info(),
                guardian_signatures: ctx.accounts.guardian_signatures.to_account_info(),
            },
        ),
        guardian_set_bump,
        digest,
    )?;

    // Parse VAA body fields required for PDA derivation
    let parsed_body = parse_vaa_body(&vaa_body)?;

    let emitter_chain_bytes = parsed_body.emitter_chain.to_le_bytes();
    let sequence_bytes = parsed_body.sequence.to_le_bytes();

    // Derive the expected verified message PDA
    let (expected_pda, bump) = Pubkey::find_program_address(
        &[
            VERIFIED_MESSAGE_SEED,
            emitter_chain_bytes.as_ref(),
            parsed_body.emitter_address.as_ref(),
            sequence_bytes.as_ref(),
        ],
        ctx.program_id,
    );

    require!(
        expected_pda == ctx.accounts.verified_message.key(),
        VerifierError::InvalidVerifiedMessagePda
    );

    // Create the verified message account at the derived PDA
    let rent = Rent::get()?;
    let space = ANCHOR_DISCRIMINATOR_LEN + VerifiedMessage::INIT_SPACE;
    let lamports = rent.minimum_balance(space);

    let seeds = &[
        VERIFIED_MESSAGE_SEED,
        emitter_chain_bytes.as_ref(),
        parsed_body.emitter_address.as_ref(),
        sequence_bytes.as_ref(),
        &[bump],
    ];

    solana_program::program::invoke_signed(
        &solana_program::system_instruction::create_account(
            &ctx.accounts.payer.key(),
            &expected_pda,
            lamports,
            space as u64,
            ctx.program_id,
        ),
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.verified_message.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
    )?;

    // Write discriminator and verified message state
    let clock = Clock::get()?;
    let mut data = ctx.accounts.verified_message.try_borrow_mut_data()?;
    data[..ANCHOR_DISCRIMINATOR_LEN].copy_from_slice(&VerifiedMessage::DISCRIMINATOR);

    let verified_message = VerifiedMessage {
        emitter_chain: parsed_body.emitter_chain,
        emitter_address: parsed_body.emitter_address,
        sequence: parsed_body.sequence,

        payload: vaa_body.clone(),
        payload_hash: keccak::hash(&vaa_body).to_bytes(),

        verified_at_slot: clock.slot,
        verified_at_unix_ts: clock.unix_timestamp,
    };

    let mut writer = &mut data[ANCHOR_DISCRIMINATOR_LEN..];
    verified_message.serialize(&mut writer)?;

    Ok(())
}

fn parse_vaa_body(vaa_body: &[u8]) -> Result<MessageHeader> {
    // Ensure the VAA body is large enough to contain required body fields
    require!(
        vaa_body.len() >= VAA_BODY_MIN_LEN,
        VerifierError::InvalidVaaBody
    );

    let mut offset = 0;

    offset += 4; // timestamp (ignored)
    offset += 4; // nonce (ignored)

    let emitter_chain = u16::from_be_bytes(
        vaa_body[offset..offset + 2]
            .try_into()
            .map_err(|_| VerifierError::InvalidVaaBody)?,
    );
    offset += 2;

    let emitter_address: [u8; 32] = vaa_body[offset..offset + 32]
        .try_into()
        .map_err(|_| VerifierError::InvalidVaaBody)?;
    offset += 32;

    let sequence = u64::from_be_bytes(
        vaa_body[offset..offset + 8]
            .try_into()
            .map_err(|_| VerifierError::InvalidVaaBody)?,
    );

    Ok(MessageHeader {
        emitter_chain,
        emitter_address,
        sequence,
    })
}

pub struct MessageHeader {
    pub emitter_chain: u16,
    pub emitter_address: [u8; 32],
    pub sequence: u64,
}
