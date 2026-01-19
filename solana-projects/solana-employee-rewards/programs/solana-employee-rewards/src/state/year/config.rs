use anchor_lang::prelude::*;

use crate::{constants::MAX_RANKS, types::RankDefinition};

#[account]
#[derive(InitSpace)]
/// Year-specific configuration and lifecycle state.
pub struct YearConfig {
    pub year: u16,
    pub is_open: bool,
    pub is_settled: bool,
    pub admin: Pubkey,
    #[max_len(MAX_RANKS)]
    pub ranks: Vec<RankDefinition>,
    pub bump: u8,
}
