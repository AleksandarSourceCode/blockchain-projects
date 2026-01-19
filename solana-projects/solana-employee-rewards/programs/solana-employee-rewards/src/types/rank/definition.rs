use anchor_lang::prelude::*;

use crate::types::AssetMetadata;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
/// Definition of a performance rank and its associated NFT metadata.
pub struct RankDefinition {
    pub id: u8,
    pub min_points: u64,
    pub max_points: u64,
    pub metadata: AssetMetadata,
}
