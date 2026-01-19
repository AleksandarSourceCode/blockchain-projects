use anchor_lang::prelude::*;

use crate::{errors::ErrorCode, state::YearConfig, types::RankDefinition};

/// Resolves the rank definition for a given point total within a year.
pub fn resolve_rank<'a>(points: u64, year: &'a YearConfig) -> Result<&'a RankDefinition> {
    year.ranks
        .iter()
        .find(|r| points >= r.min_points && points <= r.max_points)
        .ok_or(ErrorCode::RankNotFound.into())
}
