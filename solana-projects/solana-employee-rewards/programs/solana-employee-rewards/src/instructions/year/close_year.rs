use anchor_lang::prelude::*;

use crate::{
    constants::{GLOBAL_SEED, YEAR_SEED},
    errors::ErrorCode,
    events::YearClosed,
    state::{GlobalConfig, YearConfig},
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct CloseYear<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Year configuration for the specified reward cycle
    #[account(
        mut,
        seeds = [YEAR_SEED, year.to_le_bytes().as_ref()],
        bump = year_config.bump
    )]
    pub year_config: Account<'info, YearConfig>,
}

/// Closes a year for task completion and point claiming.
pub fn close_year(ctx: Context<CloseYear>, year: u16) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &mut ctx.accounts.year_config;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(year_cfg.is_open, ErrorCode::YearNotOpen);
    require!(!year_cfg.is_settled, ErrorCode::YearAlreadySettled);

    year_cfg.is_open = false;

    emit!(YearClosed { year });

    Ok(())
}
