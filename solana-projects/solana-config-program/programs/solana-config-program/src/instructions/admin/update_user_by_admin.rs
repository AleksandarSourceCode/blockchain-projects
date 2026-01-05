use anchor_lang::prelude::*;

use crate::{
    constants::{GLOBAL_CONFIG_SEED, USER_CONFIG_SEED},
    errors::ConfigError,
    state::{global_config::*, user_config::UserConfig},
};

#[derive(Accounts)]
pub struct UpdateUserByAdmin<'info> {
    pub admin: Signer<'info>,
    #[account(
        has_one = admin,
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [USER_CONFIG_SEED, user_config.owner.as_ref()],
        bump = user_config.bump
    )]
    pub user_config: Account<'info, UserConfig>,
}

pub fn update_user_by_admin(
    ctx: Context<UpdateUserByAdmin>,
    new_daily_limit: u64,
    enabled: bool,
) -> Result<()> {
    msg!(
        "update_user_by_admin called by admin {}",
        ctx.accounts.admin.key()
    );

    let user = &mut ctx.accounts.user_config;

    require!(
        ctx.accounts.global_config.status == Status::Active,
        ConfigError::ProgramFrozen
    );

    user.daily_limit = new_daily_limit;
    user.enabled = enabled;

    msg!(
        "User {} updated successfully: daily_limit={}, enabled={}",
        ctx.accounts.user_config.owner,
        ctx.accounts.user_config.daily_limit,
        ctx.accounts.user_config.enabled
    );

    Ok(())
}
