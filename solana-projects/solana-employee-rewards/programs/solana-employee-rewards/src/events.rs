use anchor_lang::prelude::*;

/// Emitted when a submitted task is approved and finalized.
#[event]
pub struct TaskApproved {
    pub employee: Pubkey,
    pub task_id: u32,
    pub year: u16,
    pub points: u64,
}

/// Emitted when a reward year is closed for further task approvals.
#[event]
pub struct YearClosed {
    pub year: u16,
}

/// Emitted after an employee’s annual settlement is computed.
#[event]
pub struct EmployeeSettled {
    pub employee: Pubkey,
    pub year: u16,
    pub total_points: u64,
    pub rank_id: u8,
}

/// Emitted when reward tokens are minted for an employee.
#[event]
pub struct RewardTokensMinted {
    pub employee: Pubkey,
    pub year: u16,
    pub amount: u64,
}

/// Emitted when a member status NFT is minted for an employee.
#[event]
pub struct MemberStatusNftMinted {
    pub employee: Pubkey,
    pub year: u16,
    pub rank_id: u8,
    pub mint: Pubkey,
}

/// Emitted when special tokens are minted for a recipient.
#[event]
pub struct SpecialTokensMinted {
    pub recipient: Pubkey,
    pub amount: u64,
}

/// Emitted when reward tokens are redeemed by an employee.
#[event]
pub struct RewardTokensRedeemed {
    pub employee: Pubkey,
    pub year: u16,
    pub amount: u64,
}

/// Emitted when special tokens are redeemed by a recipient.
#[event]
pub struct SpecialTokensRedeemed {
    pub recipient: Pubkey,
    pub amount: u64,
}
