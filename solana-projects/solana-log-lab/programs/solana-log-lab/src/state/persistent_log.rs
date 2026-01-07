use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PersistentLog {
    /// Application-defined log type / category
    pub kind: u8,

    /// Authority that created the log entry
    pub user: Pubkey,

    /// Human-readable log payload (bounded for rent safety)
    #[max_len(100)]
    pub message: String,

    /// Unix timestamp when the log was recorded
    pub timestamp: i64,
}
