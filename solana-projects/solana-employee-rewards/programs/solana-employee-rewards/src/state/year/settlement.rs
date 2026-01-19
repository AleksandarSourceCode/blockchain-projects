use anchor_lang::prelude::*;

use crate::types::RankSnapshot;

#[account]
#[derive(InitSpace)]
/// Annual reward settlement record.
pub struct AnnualSettlement {
    pub employee: Pubkey,
    pub year: u16,
    pub total_points: u64,
    pub rank: RankSnapshot,
    pub reward_tokens_minted: bool,
    pub member_status_nft_minted: bool,
    pub bump: u8,
}
