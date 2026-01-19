use anchor_lang::prelude::*;

use crate::{
    constants::{GLOBAL_SEED, TASK_SEED},
    errors::ErrorCode,
    state::{GlobalConfig, TaskDefinition},
};

#[derive(Accounts)]
#[instruction(task_id: u32)]
pub struct DeactivateTask<'info> {
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
        seeds = [TASK_SEED, task_id.to_le_bytes().as_ref()],
        bump = task.bump
    )]
    pub task: Account<'info, TaskDefinition>,
}

/// Permanently disables a task to prevent new assignments.
pub fn deactivate_task(ctx: Context<DeactivateTask>, _task_id: u32) -> Result<()> {
    let task = &mut ctx.accounts.task;

    require!(!ctx.accounts.global_config.paused, ErrorCode::SystemPaused);
    require!(task.active, ErrorCode::TaskNotActive);

    task.active = false;
    Ok(())
}
