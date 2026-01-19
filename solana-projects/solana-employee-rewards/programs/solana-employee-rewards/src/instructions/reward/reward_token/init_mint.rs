use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{Mint, Token},
};

use crate::{
    constants::{
        GLOBAL_SEED, METADATA_SEED, REWARD_MINT_SEED, REWARD_TOKEN_AUTHORITY_SEED, YEAR_SEED,
    },
    errors::ErrorCode,
    state::{GlobalConfig, YearConfig},
    types::AssetMetadata,
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct InitRewardTokenMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [YEAR_SEED, year.to_le_bytes().as_ref()],
        bump = year_config.bump
    )]
    pub year_config: Account<'info, YearConfig>,

    /// CHECK: PDA used only as a CPI signing authority.
    #[account(
        seeds = [REWARD_TOKEN_AUTHORITY_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub reward_mint_authority: UncheckedAccount<'info>,

    /// Reward token mint for the given year.
    #[account(
        init,
        payer = admin,
        seeds = [REWARD_MINT_SEED, year.to_le_bytes().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = reward_mint_authority
    )]
    pub reward_token_mint: Account<'info, Mint>,

    /// CHECK: PDA validated via seeds
    /// Metaplex metadata account for the yearly reward token.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), reward_token_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub reward_token_metadata: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

/// Initializes the yearly reward token mint and its metadata.
pub fn init_reward_token_mint(
    ctx: Context<InitRewardTokenMint>,
    year: u16,
    args: AssetMetadata,
) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &ctx.accounts.year_config;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(!year_cfg.is_open, ErrorCode::YearNotClosed);

    // Signer seeds for the reward token mint authority PDA.
    let seeds: &[&[&[u8]]] = &[&[
        REWARD_TOKEN_AUTHORITY_SEED,
        &year.to_le_bytes(),
        &[ctx.bumps.reward_mint_authority],
    ]];

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.reward_token_metadata.to_account_info(),
                mint: ctx.accounts.reward_token_mint.to_account_info(),
                mint_authority: ctx.accounts.reward_mint_authority.to_account_info(),
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
