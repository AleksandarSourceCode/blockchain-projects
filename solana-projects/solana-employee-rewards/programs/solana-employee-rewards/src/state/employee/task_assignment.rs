use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum AssignmentStatus {
    Assigned,
    Submitted,
    Completed,
}

#[account]
#[derive(InitSpace)]
/// Task assignment state.
pub struct TaskAssignment {
    pub employee: Pubkey,
    pub task_id: u32,
    pub year: u16,
    pub status: AssignmentStatus,
    pub bump: u8,
}
