use anchor_lang::prelude::*;

/// Custom errors used to demonstrate error-based logging via `require!`.
#[error_code]
pub enum DemoError {
    /// Forced error used for testing error propagation and runtime logs.
    #[msg("ERROR_LOG: forced error for demo")]
    ForcedError,
}
