use anchor_lang::prelude::*;

use crate::{
    constants::{
        ACCOUNT_DISCRIMINATOR_LEN, ASSIGNMENT_SEED, COMPLETION_SEED, GLOBAL_SEED, TASK_SEED,
        YEAR_SEED,
    },
    errors::ErrorCode,
    events::TaskApproved,
    state::{
        AssignmentStatus, GlobalConfig, TaskAssignment, TaskCompletion, TaskDefinition, YearConfig,
    },
};

#[derive(Accounts)]
#[instruction(task_id: u32, year: u16)]
pub struct ApproveTask<'info> {
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

    #[account(
        mut,
        seeds = [TASK_SEED, task_id.to_le_bytes().as_ref()],
        bump = task.bump
    )]
    pub task: Account<'info, TaskDefinition>,

    /// Task assignment being approved by an administrator.
    #[account(
        mut,
        seeds = [
            ASSIGNMENT_SEED,
            task_id.to_le_bytes().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump = assignment.bump
    )]
    pub assignment: Account<'info, TaskAssignment>,

    /// Task completion record created after successful approval.
    #[account(
        init,
        payer = admin,
        space = ACCOUNT_DISCRIMINATOR_LEN + TaskCompletion::INIT_SPACE,
        seeds = [
            COMPLETION_SEED,
            assignment.employee.as_ref(),
            task_id.to_le_bytes().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub completion: Account<'info, TaskCompletion>,

    pub system_program: Program<'info, System>,
}

/// Approves a submitted task and records its completion.
pub fn approve_task(ctx: Context<ApproveTask>, task_id: u32, year: u16) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let assignment = &mut ctx.accounts.assignment;

    require!(!ctx.accounts.global_config.paused, ErrorCode::SystemPaused);
    require!(ctx.accounts.year_config.is_open, ErrorCode::YearNotOpen);
    require!(
        assignment.status == AssignmentStatus::Submitted,
        ErrorCode::InvalidTaskState
    );
    require!(task.active, ErrorCode::TaskNotActive);

    task.active = false; // Task is globally finished

    assignment.status = AssignmentStatus::Completed;

    let completion = &mut ctx.accounts.completion;

    completion.employee = assignment.employee;
    completion.task_id = task_id;
    completion.year = year;
    completion.claimed = false;
    completion.bump = ctx.bumps.completion;

    emit!(TaskApproved {
        employee: assignment.employee,
        task_id,
        year,
        points: task.points,
    });

    Ok(())
}
