use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{verify_sized_collection_item, Metadata, VerifySizedCollectionItem},
    token::Mint,
};

use crate::{
    constants::{
        GLOBAL_SEED, MEMBER_STATUS_AUTHORITY_SEED, MEMBER_STATUS_COLLECTION_MINT_SEED,
        MEMBER_STATUS_NFT_SEED, METADATA_EDITION_SEED, METADATA_SEED,
    },
    errors::ErrorCode,
    state::GlobalConfig,
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct VerifyMemberStatusNft<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Employee wallet.
    pub employee: SystemAccount<'info>,

    /// CHECK: PDA used as collection authority.
    #[account(
        seeds = [MEMBER_STATUS_AUTHORITY_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub member_status_authority: UncheckedAccount<'info>,

    /// Yearly member status NFT collection mint.
    #[account(
        seeds = [MEMBER_STATUS_COLLECTION_MINT_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub collection_mint: Account<'info, Mint>,

    /// CHECK: Metaplex collection metadata PDA.
    #[account(
        mut,
        seeds = [
            METADATA_SEED,
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex collection master edition PDA.
    #[account(
        mut,
        seeds = [
            METADATA_SEED,
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            METADATA_EDITION_SEED
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub collection_edition_account: UncheckedAccount<'info>,

    /// Member status NFT mint.
    #[account(
        mut,
        seeds = [
            MEMBER_STATUS_NFT_SEED,
            employee.key().as_ref(),
            &year.to_le_bytes()
        ],
        bump,
    )]
    pub member_status_mint: Account<'info, Mint>,

    /// CHECK: Metaplex member status metadata PDA.
    #[account(
        mut,
        seeds = [
            METADATA_SEED,
            token_metadata_program.key().as_ref(),
            member_status_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub member_status_metadata: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
}

/// Verifies the member status NFT as a member of the yearly collection.
pub fn verify_member_status_nft(ctx: Context<VerifyMemberStatusNft>, year: u16) -> Result<()> {
    let global = &ctx.accounts.global_config;

    require!(!global.paused, ErrorCode::SystemPaused);

    // Signer seeds for the member status NFT authority PDA.
    let seeds: &[&[&[u8]]] = &[&[
        MEMBER_STATUS_AUTHORITY_SEED,
        &year.to_le_bytes(),
        &[ctx.bumps.member_status_authority],
    ]];

    verify_sized_collection_item(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            VerifySizedCollectionItem {
                payer: ctx.accounts.admin.to_account_info(),
                metadata: ctx.accounts.member_status_metadata.to_account_info(),
                collection_authority: ctx.accounts.member_status_authority.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx
                    .accounts
                    .collection_edition_account
                    .to_account_info(),
            },
            seeds,
        ),
        None,
    )?;

    Ok(())
}
