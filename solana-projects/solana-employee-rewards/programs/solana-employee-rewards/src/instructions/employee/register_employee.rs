use anchor_lang::prelude::*;

use crate::{
    constants::{ACCOUNT_DISCRIMINATOR_LEN, EMPLOYEE_SEED, GLOBAL_SEED, YEAR_SEED},
    errors::ErrorCode,
    state::{Employee, EmployeeStatus, GlobalConfig, YearConfig},
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct RegisterEmployee<'info> {
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
        bump = year_config.bump,
    )]
    pub year_config: Account<'info, YearConfig>,

    /// Employee wallet (not required to sign).
    pub employee: SystemAccount<'info>,

    /// Employee state account for tracking yearly participation and points.
    #[account(
        init,
        payer = admin,
        space = ACCOUNT_DISCRIMINATOR_LEN + Employee::INIT_SPACE,
        seeds = [EMPLOYEE_SEED, employee.key().as_ref(), year.to_le_bytes().as_ref()],
        bump
    )]
    pub employee_account: Account<'info, Employee>,

    pub system_program: Program<'info, System>,
}

/// Registers an employee for a given year.
pub fn register_employee(ctx: Context<RegisterEmployee>, year: u16) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &ctx.accounts.year_config;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(year_cfg.is_open, ErrorCode::YearNotOpen);
    require!(!year_cfg.is_settled, ErrorCode::YearAlreadySettled);

    let employee_account = &mut ctx.accounts.employee_account;

    employee_account.employee = ctx.accounts.employee.key();
    employee_account.status = EmployeeStatus::Active;
    employee_account.registered_at_year = year;
    employee_account.total_points = 0;
    employee_account.bump = ctx.bumps.employee_account;

    Ok(())
}
