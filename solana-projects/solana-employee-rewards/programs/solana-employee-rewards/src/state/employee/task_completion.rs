use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
/// Completed task record.
pub struct TaskCompletion {
    pub employee: Pubkey,
    pub task_id: u32,
    pub year: u16,
    pub claimed: bool,
    pub bump: u8,
}
