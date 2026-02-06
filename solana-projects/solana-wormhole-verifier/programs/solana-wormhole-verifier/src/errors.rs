use anchor_lang::prelude::*;

#[error_code]
pub enum VerifierError {
    #[msg("Invalid verified_message PDA")]
    InvalidVerifiedMessagePda,

    #[msg("Invalid VAA body format")]
    InvalidVaaBody,

    #[msg("VAA payload exceeds maximum allowed size")]
    PayloadTooLarge,

    #[msg("Verified message already exists")]
    VerifiedMessageAlreadyExists,

    #[msg("Instruction is disabled outside of test builds")]
    InstructionDisabled,
}
