use anchor_lang::prelude::*;

use crate::errors::DemoError;

#[derive(Accounts)]
pub struct LogError {}

pub fn log_error(_ctx: Context<LogError>) -> Result<()> {
    // Intentionally fails to demonstrate error-based logging via `require!`
    require!(false, DemoError::ForcedError);

    Ok(())
}
