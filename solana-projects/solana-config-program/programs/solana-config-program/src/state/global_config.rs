use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    /// Admin account that can modify global settings
    pub admin: Pubkey,
    /// Current status of the program (Active/Frozen)
    pub status: Status,
    /// Fee in basis points (100 = 1%)
    pub fee_bps: u16,
    /// PDA bump seed
    pub bump: u8,
}

/// Status of the program: Active allows operations, Frozen blocks them
#[derive(InitSpace, Debug, AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Active,
    Frozen,
}
