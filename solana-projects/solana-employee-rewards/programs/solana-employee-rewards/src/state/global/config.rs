use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
/// Global program configuration.
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub version: u16,
    pub paused: bool,
    /// Mint used for reward redemptions (e.g. USDC).
    pub payout_mint: Pubkey,
    pub bump: u8,
}
