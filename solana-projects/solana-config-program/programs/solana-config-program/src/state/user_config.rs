use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    /// Owner of this user configuration
    pub owner: Pubkey,
    /// Daily transaction limit for the user
    pub daily_limit: u64,
    /// Whether the user is enabled to perform operations
    pub enabled: bool,
    pub bump: u8,
}
