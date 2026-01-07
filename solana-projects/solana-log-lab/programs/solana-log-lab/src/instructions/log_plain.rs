use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct LogPlain {}

pub fn log_plain(_ctx: Context<LogPlain>) -> Result<()> {
    msg!("PLAIN_LOG: start");

    msg!("PLAIN_LOG: simple message");
    msg!("PLAIN_LOG: number = {}", 42);
    msg!("PLAIN_LOG: bool = {}", true);

    msg!("PLAIN_LOG: end");
    Ok(())
}
