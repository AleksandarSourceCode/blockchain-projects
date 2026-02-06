use anchor_lang::prelude::*;

declare_id!("SWVewpprU58fddgzx54Zp4o8ESdcGFmT5WeTusixyB1");

// Wormhole shim program used for VAA signature verification
declare_program!(wormhole_verify_vaa_shim);

mod constants;
mod errors;
mod instructions;
mod state;

use instructions::*;

#[program]
pub mod solana_wormhole_verifier {

    use super::*;

    /// Verifies a Wormhole VAA and creates a corresponding verified message PDA.
    pub fn verify_vaa(
        ctx: Context<VerifyVaa>,
        guardian_set_bump: u8,
        vaa_body: Vec<u8>,
    ) -> Result<()> {
        instructions::verify_vaa(ctx, guardian_set_bump, vaa_body)
    }

    /// TEST-ONLY (DEVNET).
    /// Clears verified message state and refunds lamports.
    pub fn close_verified_message(ctx: Context<CloseVerifiedMessage>) -> Result<()> {
        instructions::close_verified_message(ctx)
    }

    /// IDL-only helper to expose the VerifiedMessage account type.
    pub fn include_verified_message_idl(ctx: Context<IncludeVerifiedMessageIdl>) -> Result<()> {
        instructions::include_verified_message_idl(ctx)
    }
}
