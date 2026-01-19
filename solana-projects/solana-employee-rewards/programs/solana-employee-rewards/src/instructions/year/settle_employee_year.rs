use anchor_lang::prelude::*;

use crate::{
    constants::{
        ACCOUNT_DISCRIMINATOR_LEN, EMPLOYEE_SEED, GLOBAL_SEED, SETTLEMENT_SEED, YEAR_SEED,
    },
    errors::ErrorCode,
    events::EmployeeSettled,
    helpers::resolve_rank,
    state::{AnnualSettlement, Employee, GlobalConfig, YearConfig},
    types::RankSnapshot,
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct SettleEmployeeYear<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [YEAR_SEED, year.to_le_bytes().as_ref()],
        bump = year_config.bump
    )]
    pub year_config: Account<'info, YearConfig>,

    /// Employee wallet used for PDA derivation.
    pub employee: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [EMPLOYEE_SEED, employee.key().as_ref(), year.to_le_bytes().as_ref()],
        bump = employee_account.bump
    )]
    pub employee_account: Account<'info, Employee>,

    /// Annual settlement record for an employee and year.
    #[account(
        init,
        payer = admin,
        space = ACCOUNT_DISCRIMINATOR_LEN + AnnualSettlement::INIT_SPACE,
        seeds = [
            SETTLEMENT_SEED,
            employee.key().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub settlement: Account<'info, AnnualSettlement>,

    pub system_program: Program<'info, System>,
}

/// Finalizes the annual settlement for an employee.
pub fn settle_employee_year(ctx: Context<SettleEmployeeYear>, year: u16) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &ctx.accounts.year_config;
    let employee_account = &ctx.accounts.employee_account;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(!year_cfg.is_open, ErrorCode::YearNotClosed);
    require!(!year_cfg.is_settled, ErrorCode::YearAlreadySettled);

    let rank = resolve_rank(employee_account.total_points, year_cfg)?;

    let settlement = &mut ctx.accounts.settlement;

    settlement.employee = employee_account.employee;
    settlement.year = year;
    settlement.total_points = employee_account.total_points;
    settlement.rank = RankSnapshot::from(rank);
    settlement.reward_tokens_minted = false;
    settlement.member_status_nft_minted = false;
    settlement.bump = ctx.bumps.settlement;

    emit!(EmployeeSettled {
        employee: settlement.employee,
        year,
        total_points: settlement.total_points,
        rank_id: settlement.rank.id,
    });

    Ok(())
}
