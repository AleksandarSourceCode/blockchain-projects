use anchor_lang::prelude::*;

use crate::{
    constants::{COMPLETION_SEED, EMPLOYEE_SEED, GLOBAL_SEED, TASK_SEED, YEAR_SEED},
    errors::ErrorCode,
    state::{Employee, GlobalConfig, TaskCompletion, TaskDefinition, YearConfig},
};

#[derive(Accounts)]
#[instruction(task_id: u32, year: u16)]
pub struct ClaimPoints<'info> {
    #[account(mut)]
    pub employee: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump
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

    /// Task completion record used to ensure points are claimed only once.
    #[account(
        mut,
        seeds = [
            COMPLETION_SEED,
            employee.key().as_ref(),
            task_id.to_le_bytes().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump = completion.bump
    )]
    pub completion: Account<'info, TaskCompletion>,

    #[account(
        mut,
        seeds = [EMPLOYEE_SEED, employee.key().as_ref(), year.to_le_bytes().as_ref()],
        bump = employee_account.bump
    )]
    pub employee_account: Account<'info, Employee>,
}

/// Claims points for a completed task.
pub fn claim_points(ctx: Context<ClaimPoints>, _task_id: u32, _year: u16) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &ctx.accounts.year_config;
    let task = &ctx.accounts.task;
    let completion = &mut ctx.accounts.completion;
    let employee_account = &mut ctx.accounts.employee_account;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(year_cfg.is_open, ErrorCode::YearNotOpen);
    require!(!completion.claimed, ErrorCode::TaskAlreadyClaimed);

    employee_account.total_points = employee_account
        .total_points
        .checked_add(task.points)
        .ok_or(ErrorCode::MathOverflow)?;

    completion.claimed = true;

    Ok(())
}
