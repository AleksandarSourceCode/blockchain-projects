use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum EmployeeStatus {
    Active = 0,
    Suspended = 1,
    Left = 2,
}

#[account]
#[derive(InitSpace)]
/// Employee account.
pub struct Employee {
    pub employee: Pubkey,
    pub status: EmployeeStatus,
    pub registered_at_year: u16,
    pub total_points: u64,
    pub bump: u8,
}
