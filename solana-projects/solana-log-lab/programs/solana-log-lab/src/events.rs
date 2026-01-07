use anchor_lang::prelude::*;

/// Structured log event emitted via `emit!`.
/// Serialized into `Program data` logs and decoded off-chain using the IDL.
#[event]
pub struct DemoEvent {
    /// Application-defined severity or category
    pub level: u8,

    /// Application-specific event code
    pub code: u16,

    /// Human-readable event message
    pub message: String,
}
