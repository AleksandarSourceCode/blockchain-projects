use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::{
        GLOBAL_SEED, REWARD_MINT_SEED, REWARD_PAYOUT_MULTIPLIER, TREASURY_SEED, YEAR_SEED,
    },
    errors::ErrorCode,
    events::RewardTokensRedeemed,
    state::{GlobalConfig, YearConfig},
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct RedeemRewardTokens<'info> {
    #[account(mut)]
    pub employee: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [YEAR_SEED, year.to_le_bytes().as_ref()],
        bump = year_config.bump
    )]
    pub year_config: Account<'info, YearConfig>,

    /// Employee reward token account (burn source).
    #[account(
        mut,
        associated_token::mint = reward_token_mint,
        associated_token::authority = employee,
        associated_token::token_program = token_program
    )]
    pub employee_reward_ata: Account<'info, TokenAccount>,

    /// Reward token mint for the given year.
    #[account(
        mut,
        seeds = [REWARD_MINT_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub reward_token_mint: Account<'info, Mint>,

    /// CHECK: Program-owned treasury PDA.
    #[account(
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// Mint used for reward redemptions.
    pub payout_mint: Account<'info, Mint>,

    /// Treasury payout token account.
    #[account(
        mut,
        associated_token::mint = payout_mint,
        associated_token::authority = treasury,
        associated_token::token_program = token_program
    )]
    pub treasury_payout_ata: Account<'info, TokenAccount>,

    /// Employee payout token account.
    #[account(
        init_if_needed,
        payer = employee,
        associated_token::mint = payout_mint,
        associated_token::authority = employee,
        associated_token::token_program = token_program
    )]
    pub employee_payout_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/// Redeems reward tokens for payout tokens from the treasury.
pub fn redeem_reward_tokens(
    ctx: Context<RedeemRewardTokens>,
    year: u16,
    amount: u64,
) -> Result<()> {
    let global = &ctx.accounts.global_config;

    require!(!global.paused, ErrorCode::SystemPaused);

    require_keys_eq!(
        ctx.accounts.payout_mint.key(),
        global.payout_mint,
        ErrorCode::InvalidPayoutMint
    );

    anchor_spl::token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Burn {
                mint: ctx.accounts.reward_token_mint.to_account_info(),
                from: ctx.accounts.employee_reward_ata.to_account_info(),
                authority: ctx.accounts.employee.to_account_info(),
            },
        ),
        amount,
    )?;

    // Transfer payout tokens from treasury.
    let treasury_seeds: &[&[&[u8]]] = &[&[TREASURY_SEED, &[ctx.bumps.treasury]]];

    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.treasury_payout_ata.to_account_info(),
                to: ctx.accounts.employee_payout_ata.to_account_info(),
                authority: ctx.accounts.treasury.to_account_info(),
            },
            treasury_seeds,
        ),
        REWARD_PAYOUT_MULTIPLIER * amount * 10u64.pow(ctx.accounts.payout_mint.decimals as u32),
    )?;

    emit!(RewardTokensRedeemed {
        employee: ctx.accounts.employee.key(),
        year,
        amount,
    });

    Ok(())
}
