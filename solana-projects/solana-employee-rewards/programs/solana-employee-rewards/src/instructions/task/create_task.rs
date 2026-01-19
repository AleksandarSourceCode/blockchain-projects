use anchor_lang::prelude::*;

use crate::{
    constants::{
        ACCOUNT_DISCRIMINATOR_LEN, GLOBAL_SEED, MAX_TASK_DESCRIPTION_LEN, MAX_TASK_SPEC_URL_LEN,
        TASK_SEED,
    },
    errors::ErrorCode,
    state::{GlobalConfig, TaskDefinition},
    types::CreateTaskArgs,
};

#[derive(Accounts)]
#[instruction(args: CreateTaskArgs)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    /// Task definition account describing a unit of work and its reward points.
    #[account(
        init,
        payer = admin,
        space = ACCOUNT_DISCRIMINATOR_LEN + TaskDefinition::INIT_SPACE,
        seeds = [TASK_SEED, args.task_id.to_le_bytes().as_ref()],
        bump
    )]
    pub task: Account<'info, TaskDefinition>,

    pub system_program: Program<'info, System>,
}

/// Creates a new task definition.
pub fn create_task(ctx: Context<CreateTask>, args: CreateTaskArgs) -> Result<()> {
    require!(!ctx.accounts.global_config.paused, ErrorCode::SystemPaused);
    require!(
        args.description.len() <= MAX_TASK_DESCRIPTION_LEN,
        ErrorCode::TaskDescriptionTooLong
    );
    require!(
        args.spec_url.len() <= MAX_TASK_SPEC_URL_LEN,
        ErrorCode::TaskSpecUrlTooLong
    );
    require!(args.points > 0, ErrorCode::InvalidTaskPoints);

    let task = &mut ctx.accounts.task;

    task.task_id = args.task_id;
    task.description = args.description;
    task.spec_url = args.spec_url;
    task.points = args.points;
    task.active = true;
    task.bump = ctx.bumps.task;

    Ok(())
}
