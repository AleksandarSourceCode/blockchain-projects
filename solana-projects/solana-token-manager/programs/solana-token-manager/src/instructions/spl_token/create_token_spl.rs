use {
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
            CreateMetadataAccountsV3, Metadata,
        },
        token::{Mint, Token},
    },
};

use crate::constants::SEED_METADATA;
use crate::types::metadata_args::*;

#[derive(Accounts)]
#[instruction(_token_decimals: u8)]
pub struct CreateTokenSpl<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [SEED_METADATA, token_metadata_program.key().as_ref(), token_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub token_metadata: UncheckedAccount<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = _token_decimals,
        mint::authority = creator.key(),
        mint::freeze_authority = creator.key()
    )]
    pub token_mint: Account<'info, Mint>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Create a new SPL token mint with Metaplex metadata
pub fn create_token_spl(
    ctx: Context<CreateTokenSpl>,
    _token_decimals: u8,
    args: MetadataArgs,
) -> Result<()> {
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.token_metadata.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        DataV2 {
            name: args.name,
            symbol: args.symbol,
            uri: args.uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true, // metadata is mutable
        true, // update authority is signer
        None, // Collection details
    )?;

    Ok(())
}
