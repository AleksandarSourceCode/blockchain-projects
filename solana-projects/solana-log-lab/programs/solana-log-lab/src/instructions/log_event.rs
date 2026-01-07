use anchor_lang::prelude::*;

use crate::events::DemoEvent;

#[derive(Accounts)]
pub struct LogEvent {}

pub fn log_event(_ctx: Context<LogEvent>) -> Result<()> {
    emit!(DemoEvent {
        level: 1,
        code: 100,
        message: "This is a structured event log".to_string(),
    });

    Ok(())
}
