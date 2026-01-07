use anchor_lang::prelude::*;

#[error_code]
pub enum OracleError {
    #[msg("Number of price update accounts does not match number of feed IDs")]
    LengthMismatch,
}
