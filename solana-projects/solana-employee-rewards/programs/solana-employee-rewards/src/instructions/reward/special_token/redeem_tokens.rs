use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::{GLOBAL_SEED, SPECIAL_MINT_SEED, SPECIAL_PAYOUT_MULTIPLIER, TREASURY_SEED},
    errors::ErrorCode,
    events::SpecialTokensRedeemed,
    state::GlobalConfig,
};

#[derive(Accounts)]
pub struct RedeemSpecialTokens<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Recipient special token account (burn source).
    #[account(
        mut,
        associated_token::mint = special_token_mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program
    )]
    pub recipient_special_ata: Account<'info, TokenAccount>,

    /// Admin wallet
    pub admin: SystemAccount<'info>,

    /// Special token mint for the given year.
    #[account(
        mut,
        seeds = [SPECIAL_MINT_SEED, admin.key().as_ref()],
        bump
    )]
    pub special_token_mint: Account<'info, Mint>,

    /// CHECK: Program-owned treasury PDA.
    #[account(
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: SystemAccount<'info>,

    /// Mint used for special redemptions.
    pub payout_mint: Account<'info, Mint>,

    /// Treasury payout token account.
    #[account(
        mut,
        associated_token::mint = payout_mint,
        associated_token::authority = treasury,
        associated_token::token_program = token_program
    )]
    pub treasury_payout_ata: Account<'info, TokenAccount>,

    /// Recipient payout token account.
    #[account(
        init_if_needed,
        payer = recipient,
        associated_token::mint = payout_mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program
    )]
    pub recipient_payout_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/// Redeems special tokens for payout tokens from the treasury.
pub fn redeem_special_tokens(ctx: Context<RedeemSpecialTokens>, amount: u64) -> Result<()> {
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
                mint: ctx.accounts.special_token_mint.to_account_info(),
                from: ctx.accounts.recipient_special_ata.to_account_info(),
                authority: ctx.accounts.recipient.to_account_info(),
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
                to: ctx.accounts.recipient_payout_ata.to_account_info(),
                authority: ctx.accounts.treasury.to_account_info(),
            },
            treasury_seeds,
        ),
        SPECIAL_PAYOUT_MULTIPLIER * amount * 10u64.pow(ctx.accounts.payout_mint.decimals as u32),
    )?;

    emit!(SpecialTokensRedeemed {
        recipient: ctx.accounts.recipient.key(),
        amount,
    });

    Ok(())
}
