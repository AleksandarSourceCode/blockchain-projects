use anchor_lang::prelude::*;

use crate::{
    constants::{ASSIGNMENT_SEED, GLOBAL_SEED},
    errors::ErrorCode,
    state::{AssignmentStatus, GlobalConfig, TaskAssignment},
};

#[derive(Accounts)]
#[instruction(task_id: u32, year: u16)]
pub struct SubmitTask<'info> {
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

    /// Task assignment being submitted for review.
    #[account(
        mut,
        seeds = [
            ASSIGNMENT_SEED,
            task_id.to_le_bytes().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump = assignment.bump,
        has_one = employee
    )]
    pub assignment: Account<'info, TaskAssignment>,
}

/// Employee submits a completed task for validation.
pub fn submit_task(ctx: Context<SubmitTask>, _task_id: u32, _year: u16) -> Result<()> {
    let assignment = &mut ctx.accounts.assignment;

    require!(!ctx.accounts.global_config.paused, ErrorCode::SystemPaused);
    require!(
        assignment.status == AssignmentStatus::Assigned,
        ErrorCode::InvalidTaskState
    );

    assignment.status = AssignmentStatus::Submitted;

    Ok(())
}
