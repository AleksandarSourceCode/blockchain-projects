use crate::{constants::ANCHOR_DISCRIMINATOR_SIZE, state::persistent_log::PersistentLog};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct LogState<'info> {
    /// Authority creating the log entry and paying rent
    #[account(mut)]
    pub user: Signer<'info>,

    /// Persistent on-chain log account initialized for this entry
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + PersistentLog::INIT_SPACE
    )]
    pub log: Account<'info, PersistentLog>,

    /// System Program required for account initialization
    pub system_program: Program<'info, System>,
}

pub fn log_state(ctx: Context<LogState>, kind: u8, message: String) -> Result<()> {
    let log = &mut ctx.accounts.log;

    // Populate persistent log fields
    log.kind = kind;
    log.user = ctx.accounts.user.key();
    log.message = message;
    log.timestamp = Clock::get()?.unix_timestamp;

    Ok(())
}
