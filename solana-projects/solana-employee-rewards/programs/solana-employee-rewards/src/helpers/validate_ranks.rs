use anchor_lang::prelude::*;

use crate::{errors::ErrorCode, types::RankDefinition};

/// Validates descending rank ranges with no gaps or overlaps between ranks.
pub fn validate_ranks(ranks: &Vec<RankDefinition>) -> Result<()> {
    let mut prev_min: Option<u64> = None;

    for r in ranks {
        require!(r.min_points <= r.max_points, ErrorCode::InvalidRankRange);

        if let Some(prev_min_points) = prev_min {
            require!(
                r.max_points + 1 == prev_min_points,
                ErrorCode::RankGapOrOverlap
            );
        }

        prev_min = Some(r.min_points);
    }

    Ok(())
}
