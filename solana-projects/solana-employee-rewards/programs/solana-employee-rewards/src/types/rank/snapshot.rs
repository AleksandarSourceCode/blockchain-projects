use anchor_lang::prelude::*;

use crate::types::{AssetMetadata, RankDefinition};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
/// Snapshot of a rank captured at settlement time.
pub struct RankSnapshot {
    pub id: u8,
    pub metadata: AssetMetadata,
}

/// Creates a snapshot from a rank definition.
impl From<&RankDefinition> for RankSnapshot {
    fn from(rank: &RankDefinition) -> Self {
        Self {
            id: rank.id,
            metadata: rank.metadata.clone(),
        }
    }
}
