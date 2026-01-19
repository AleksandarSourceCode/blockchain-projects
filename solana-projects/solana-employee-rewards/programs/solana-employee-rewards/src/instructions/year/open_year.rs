use anchor_lang::prelude::*;

use crate::{
    constants::{ACCOUNT_DISCRIMINATOR_LEN, GLOBAL_SEED, MAX_RANKS, YEAR_SEED},
    errors::ErrorCode,
    helpers::validate_ranks,
    state::{GlobalConfig, YearConfig},
    types::RankDefinition,
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct OpenYear<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = admin,
        space = ACCOUNT_DISCRIMINATOR_LEN + YearConfig::INIT_SPACE,
        seeds = [YEAR_SEED, year.to_le_bytes().as_ref()],
        bump
    )]
    pub year_config: Account<'info, YearConfig>,

    pub system_program: Program<'info, System>,
}

/// Opens a new year for task tracking and point accumulation.
pub fn open_year(ctx: Context<OpenYear>, year: u16, ranks: Vec<RankDefinition>) -> Result<()> {
    let global = &ctx.accounts.global_config;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(!ranks.is_empty(), ErrorCode::NoRanksProvided);
    require!(ranks.len() <= MAX_RANKS, ErrorCode::TooManyRanks);

    // Validates rank ordering and constraints.
    validate_ranks(&ranks)?;

    let year_config = &mut ctx.accounts.year_config;

    year_config.year = year;
    year_config.is_open = true;
    year_config.is_settled = false;
    year_config.admin = ctx.accounts.admin.key();
    year_config.ranks = ranks;
    year_config.bump = ctx.bumps.year_config;

    Ok(())
}
