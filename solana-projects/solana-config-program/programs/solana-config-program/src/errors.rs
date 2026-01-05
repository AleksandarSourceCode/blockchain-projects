use anchor_lang::prelude::*;

#[error_code]
pub enum ConfigError {
    /// Program is currently frozen
    #[msg("Program is frozen")]
    ProgramFrozen,
}
