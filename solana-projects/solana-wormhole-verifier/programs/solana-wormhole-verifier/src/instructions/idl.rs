use crate::state::verified_message::VerifiedMessage;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct IncludeVerifiedMessageIdl<'info> {
    pub verified_message: Account<'info, VerifiedMessage>,
}

/// IDL-only instruction.
/// Exists solely to include `VerifiedMessage` account type in the generated IDL.
pub fn include_verified_message_idl(_ctx: Context<IncludeVerifiedMessageIdl>) -> Result<()> {
    Ok(())
}
