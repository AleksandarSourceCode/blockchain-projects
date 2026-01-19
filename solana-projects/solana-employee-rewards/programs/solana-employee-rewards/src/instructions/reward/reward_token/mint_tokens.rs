use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

use crate::constants::REWARD_TOKEN_AUTHORITY_SEED;
use crate::events::RewardTokensMinted;
use crate::{
    constants::{GLOBAL_SEED, REWARD_MINT_SEED, SETTLEMENT_SEED, YEAR_SEED},
    errors::ErrorCode,
    state::{AnnualSettlement, GlobalConfig, YearConfig},
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct MintRewardTokens<'info> {
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

    /// Annual settlement record determining reward token amount.
    #[account(
        mut,
        seeds = [
            SETTLEMENT_SEED,
            employee.key().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump = settlement.bump
    )]
    pub settlement: Account<'info, AnnualSettlement>,

    /// Employee wallet
    pub employee: SystemAccount<'info>,

    /// CHECK: PDA used as mint authority.
    #[account(
        seeds = [REWARD_TOKEN_AUTHORITY_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub reward_mint_authority: UncheckedAccount<'info>,

    /// Year-specific reward token mint.
    #[account(
        mut,
        seeds = [REWARD_MINT_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub reward_token_mint: Account<'info, Mint>,

    /// Employee reward token account.
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = reward_token_mint,
        associated_token::authority = employee,
        associated_token::token_program = token_program
    )]
    pub employee_reward_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/// Mints reward tokens based on annual settlement.
pub fn mint_reward_tokens(ctx: Context<MintRewardTokens>, year: u16) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &ctx.accounts.year_config;
    let settlement = &mut ctx.accounts.settlement;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(!year_cfg.is_open, ErrorCode::YearNotOpen);
    require!(!settlement.reward_tokens_minted, ErrorCode::AlreadyMinted);

    let amount = settlement.total_points;
    require!(amount > 0, ErrorCode::NothingToMint);

    // Signer seeds for the reward token mint authority PDA.
    let seeds: &[&[&[u8]]] = &[&[
        REWARD_TOKEN_AUTHORITY_SEED,
        &year.to_le_bytes(),
        &[ctx.bumps.reward_mint_authority],
    ]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.reward_token_mint.to_account_info(),
                to: ctx.accounts.employee_reward_ata.to_account_info(),
                authority: ctx.accounts.reward_mint_authority.to_account_info(),
            },
            seeds,
        ),
        amount,
    )?;

    settlement.reward_tokens_minted = true;

    emit!(RewardTokensMinted {
        employee: settlement.employee,
        year,
        amount,
    });

    Ok(())
}
