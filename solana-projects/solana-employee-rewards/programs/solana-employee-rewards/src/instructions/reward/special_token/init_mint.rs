use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{Mint, Token},
};

use crate::{
    constants::{GLOBAL_SEED, METADATA_SEED, SPECIAL_MINT_SEED, SPECIAL_TOKEN_AUTHORITY_SEED},
    errors::ErrorCode,
    state::GlobalConfig,
    types::AssetMetadata,
};

#[derive(Accounts)]
pub struct InitSpecialTokenMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// CHECK: PDA used only as a CPI signing authority.
    #[account(
        seeds = [SPECIAL_TOKEN_AUTHORITY_SEED, admin.key().as_ref()],
        bump
    )]
    pub special_mint_authority: UncheckedAccount<'info>,

    /// Global special token mint (exception-based rewards).
    #[account(
        init,
        payer = admin,
        seeds = [SPECIAL_MINT_SEED, admin.key().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = special_mint_authority
    )]
    pub special_token_mint: Account<'info, Mint>,

    /// CHECK: PDA validated via seeds
    /// Metaplex metadata account for the special token.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), special_token_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub special_token_metadata: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

/// Initializes the special token mint and its metadata.
pub fn init_special_token_mint(
    ctx: Context<InitSpecialTokenMint>,
    args: AssetMetadata,
) -> Result<()> {
    let global = &ctx.accounts.global_config;

    require!(!global.paused, ErrorCode::SystemPaused);

    // Signer seeds for the special token mint authority PDA.
    let seeds: &[&[&[u8]]] = &[&[
        SPECIAL_TOKEN_AUTHORITY_SEED,
        ctx.accounts.admin.key.as_ref(),
        &[ctx.bumps.special_mint_authority],
    ]];

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.special_token_metadata.to_account_info(),
                mint: ctx.accounts.special_token_mint.to_account_info(),
                mint_authority: ctx.accounts.special_mint_authority.to_account_info(),
                update_authority: ctx.accounts.admin.to_account_info(),
                payer: ctx.accounts.admin.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            seeds,
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
        true,
        true,
        None,
    )?;

    Ok(())
}
