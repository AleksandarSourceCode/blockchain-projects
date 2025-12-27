use anchor_lang::prelude::*;

#[error_code]
pub enum ConfigError {
    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Program is frozen")]
    ProgramFrozen,
}
