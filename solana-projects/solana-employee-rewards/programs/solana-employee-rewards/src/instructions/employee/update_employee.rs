use anchor_lang::prelude::*;

use crate::{
    constants::{EMPLOYEE_SEED, GLOBAL_SEED},
    errors::ErrorCode,
    state::{Employee, EmployeeStatus, GlobalConfig},
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct UpdateEmployee<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [EMPLOYEE_SEED, employee_account.employee.as_ref(), year.to_le_bytes().as_ref()],
        bump = employee_account.bump
    )]
    pub employee_account: Account<'info, Employee>,
}

/// Updates employee administrative status.
pub fn update_employee(
    ctx: Context<UpdateEmployee>,
    _year: u16,
    new_status: EmployeeStatus,
) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let employee = &mut ctx.accounts.employee_account;

    require!(!global.paused, ErrorCode::SystemPaused);

    employee.status = new_status;

    Ok(())
}
