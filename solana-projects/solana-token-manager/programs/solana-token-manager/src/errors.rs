use anchor_lang::prelude::*;

/// Errors related to Token-2022 metadata handling
#[error_code]
pub enum ErrorCode {
    #[msg("Failed to calculate packed length of token metadata.")]
    FailedToGetPackedLen,
}

/// Errors related to authority updates
#[error_code]
pub enum SetAuthorityError {
    #[msg("Mint account is required for the selected authority type.")]
    MissingMintAccount,

    #[msg("Token account is required for the selected authority type.")]
    MissingTokenAccount,
}
