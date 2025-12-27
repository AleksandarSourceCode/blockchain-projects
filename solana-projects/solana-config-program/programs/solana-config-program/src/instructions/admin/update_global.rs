use crate::{constants::GLOBAL_CONFIG_SEED, errors::ConfigError, state::global_config::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateGlobal<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin,
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

pub fn update_global(ctx: Context<UpdateGlobal>, new_fee_bps: u16) -> Result<()> {
    msg!(
        "update_global instruction invoked by admin {}",
        ctx.accounts.admin.key()
    );

    let global_config = &mut ctx.accounts.global_config;

    require!(
        global_config.status == Status::Active,
        ConfigError::ProgramFrozen
    );

    global_config.fee_bps = new_fee_bps;

    msg!(
        "GlobalConfig updated successfully: fee_bps={}",
        ctx.accounts.global_config.fee_bps
    );

    Ok(())
}
