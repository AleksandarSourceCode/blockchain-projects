use anchor_lang::prelude::*;

use crate::{
    constants::{
        ACCOUNT_DISCRIMINATOR_LEN, ASSIGNMENT_SEED, EMPLOYEE_SEED, GLOBAL_SEED, TASK_SEED,
        YEAR_SEED,
    },
    errors::ErrorCode,
    state::{
        AssignmentStatus, Employee, EmployeeStatus, GlobalConfig, TaskAssignment, TaskDefinition,
        YearConfig,
    },
};

#[derive(Accounts)]
#[instruction(task_id: u32, year: u16)]
pub struct StartTask<'info> {
    #[account(mut)]
    pub employee: Signer<'info>,

    /// Admin wallet
    pub admin: SystemAccount<'info>,

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

    #[account(
        seeds = [TASK_SEED, task_id.to_le_bytes().as_ref()],
        bump = task.bump
    )]
    pub task: Account<'info, TaskDefinition>,

    /// Employee state account used for authorization checks.
    #[account(
        seeds = [EMPLOYEE_SEED, employee.key().as_ref(), year.to_le_bytes().as_ref()],
        bump = employee_account.bump
    )]
    pub employee_account: Account<'info, Employee>,

    /// Task assignment state linking an employee to a task for a specific year.
    #[account(
        init,
        payer = employee,
        space = ACCOUNT_DISCRIMINATOR_LEN + TaskAssignment::INIT_SPACE,
        seeds = [
            ASSIGNMENT_SEED,
            task_id.to_le_bytes().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub assignment: Account<'info, TaskAssignment>,

    pub system_program: Program<'info, System>,
}

/// Employee starts working on a task.
pub fn start_task(ctx: Context<StartTask>, task_id: u32, year: u16) -> Result<()> {
    let year_cfg = &ctx.accounts.year_config;
    let task = &ctx.accounts.task;
    require!(!ctx.accounts.global_config.paused, ErrorCode::SystemPaused);
    require!(
        ctx.accounts.employee_account.status == EmployeeStatus::Active,
        ErrorCode::Unauthorized
    );
    require!(year_cfg.is_open, ErrorCode::YearNotOpen);
    require!(task.active, ErrorCode::TaskNotActive);

    let assignment = &mut ctx.accounts.assignment;

    assignment.employee = ctx.accounts.employee.key();
    assignment.task_id = task_id;
    assignment.year = year;
    assignment.status = AssignmentStatus::Assigned;
    assignment.bump = ctx.bumps.assignment;

    Ok(())
}
