use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

use crate::constants::SPECIAL_TOKEN_AUTHORITY_SEED;
use crate::events::SpecialTokensMinted;
use crate::{
    constants::{GLOBAL_SEED, SPECIAL_MINT_SEED},
    errors::ErrorCode,
    state::GlobalConfig,
};

#[derive(Accounts)]
pub struct MintSpecialTokens<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Recipient wallet
    pub recipient: SystemAccount<'info>,

    /// CHECK: PDA used as mint authority.
    #[account(
        seeds = [SPECIAL_TOKEN_AUTHORITY_SEED, admin.key().as_ref()],
        bump
    )]
    pub special_mint_authority: UncheckedAccount<'info>,

    /// Global special token mint (exception-based rewards).
    #[account(
        mut,
        seeds = [SPECIAL_MINT_SEED, admin.key().as_ref()],
        bump
    )]
    pub special_token_mint: Account<'info, Mint>,

    /// Recipient special token account.
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = special_token_mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program
    )]
    pub recipient_special_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

/// Mints special reward tokens to a recipient wallet.
pub fn mint_special_tokens(ctx: Context<MintSpecialTokens>, amount: u64) -> Result<()> {
    let global = &ctx.accounts.global_config;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(amount > 0, ErrorCode::NothingToMint);

    // Signer seeds for the special token mint authority PDA.
    let seeds: &[&[&[u8]]] = &[&[
        SPECIAL_TOKEN_AUTHORITY_SEED,
        ctx.accounts.admin.key.as_ref(),
        &[ctx.bumps.special_mint_authority],
    ]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.special_token_mint.to_account_info(),
                to: ctx.accounts.recipient_special_ata.to_account_info(),
                authority: ctx.accounts.special_mint_authority.to_account_info(),
            },
            seeds,
        ),
        amount,
    )?;

    emit!(SpecialTokensMinted {
        recipient: ctx.accounts.recipient.key(),
        amount,
    });

    Ok(())
}
