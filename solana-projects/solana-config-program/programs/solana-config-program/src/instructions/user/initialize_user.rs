use anchor_lang::prelude::*;

use crate::{
    constants::{DEFAULT_DAILY_LIMIT, USER_CONFIG_SEED},
    state::user_config::UserConfig,
};

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + UserConfig::INIT_SPACE,
        seeds = [USER_CONFIG_SEED, payer.key().as_ref()],
        bump
    )]
    pub user_config: Account<'info, UserConfig>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
    msg!(
        "initialize_user instruction invoked by {}",
        ctx.accounts.payer.key()
    );

    *ctx.accounts.user_config = UserConfig {
        owner: ctx.accounts.payer.key(),
        daily_limit: DEFAULT_DAILY_LIMIT,
        enabled: true,
        bump: ctx.bumps.user_config,
    };

    msg!(
        "User account successfully initialized: owner={}, daily_limit={}, enabled={}",
        ctx.accounts.user_config.owner,
        ctx.accounts.user_config.daily_limit,
        ctx.accounts.user_config.enabled
    );

    Ok(())
}
