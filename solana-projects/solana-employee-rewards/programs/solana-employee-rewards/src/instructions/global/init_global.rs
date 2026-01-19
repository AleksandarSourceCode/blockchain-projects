use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{
    constants::{ACCOUNT_DISCRIMINATOR_LEN, GLOBAL_SEED, INITIAL_VERSION},
    state::GlobalConfig,
};

#[derive(Accounts)]
pub struct InitGlobal<'info> {
    /// Program admin authority.
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Mint used for reward redemptions
    pub payout_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = ACCOUNT_DISCRIMINATOR_LEN + GlobalConfig::INIT_SPACE,
        seeds = [GLOBAL_SEED],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    pub system_program: Program<'info, System>,
}

/// Initializes the global configuration.
pub fn init_global(ctx: Context<InitGlobal>) -> Result<()> {
    let global = &mut ctx.accounts.global_config;

    global.admin = ctx.accounts.admin.key();
    global.version = INITIAL_VERSION;
    global.paused = false;
    global.payout_mint = ctx.accounts.payout_mint.key();
    global.bump = ctx.bumps.global_config;

    Ok(())
}
