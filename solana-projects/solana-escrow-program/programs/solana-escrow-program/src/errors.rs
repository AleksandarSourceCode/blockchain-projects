use anchor_lang::prelude::*;

#[error_code]
/// Custom error codes for the Solana Escrow program.
pub enum ErrorCode {
    #[msg("Token A amount must be greater than zero.")]
    InvalidAmountA,

    #[msg("Token B amount must be greater than zero.")]
    InvalidAmountB,
}
