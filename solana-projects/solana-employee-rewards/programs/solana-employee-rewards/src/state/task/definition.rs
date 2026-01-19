use anchor_lang::prelude::*;

use crate::constants::{MAX_TASK_DESCRIPTION_LEN, MAX_TASK_SPEC_URL_LEN};

#[account]
#[derive(InitSpace)]
/// Task definition.
pub struct TaskDefinition {
    pub task_id: u32,

    #[max_len(MAX_TASK_DESCRIPTION_LEN)]
    pub description: String,

    #[max_len(MAX_TASK_SPEC_URL_LEN)]
    pub spec_url: String,

    pub points: u64,
    pub active: bool,
    pub bump: u8,
}
