use anchor_lang::prelude::*;

use crate::{
    constants::{ASSIGNMENT_SEED, GLOBAL_SEED},
    errors::ErrorCode,
    state::{AssignmentStatus, GlobalConfig, TaskAssignment},
};

#[derive(Accounts)]
#[instruction(task_id: u32, year: u16)]
pub struct RejectTask<'info> {
    /// Program admin authority.
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Task assignment to be rejected.
    #[account(
        mut,
        seeds = [
            ASSIGNMENT_SEED,
            task_id.to_le_bytes().as_ref(),
            year.to_le_bytes().as_ref()
        ],
        bump = assignment.bump,
        close = admin
    )]
    pub assignment: Account<'info, TaskAssignment>,
}

/// Rejects an assigned or submitted task and frees the assignment.
pub fn reject_task(ctx: Context<RejectTask>, _task_id: u32, _year: u16) -> Result<()> {
    require!(!ctx.accounts.global_config.paused, ErrorCode::SystemPaused);
    require!(
        matches!(
            ctx.accounts.assignment.status,
            AssignmentStatus::Assigned | AssignmentStatus::Submitted
        ),
        ErrorCode::InvalidTaskState
    );

    Ok(())
}
