use anchor_lang::prelude::*;

use crate::{constants::GLOBAL_CONFIG_SEED, errors::ConfigError, state::global_config::*};

#[derive(Accounts)]
pub struct FreezeGlobal<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin,
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

pub fn freeze_global(ctx: Context<FreezeGlobal>) -> Result<()> {
    msg!(
        "freeze_global instruction invoked by admin {}",
        ctx.accounts.admin.key()
    );

    let global = &mut ctx.accounts.global_config;

    require!(global.status == Status::Active, ConfigError::ProgramFrozen);

    global.status = Status::Frozen;

    msg!(
        "GlobalConfig status successfully changed to {:?}",
        global.status
    );

    Ok(())
}
