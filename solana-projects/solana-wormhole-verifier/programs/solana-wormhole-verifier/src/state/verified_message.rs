use anchor_lang::prelude::*;

use crate::constants::MAX_PAYLOAD_SIZE;

#[account]
#[derive(InitSpace)]
pub struct VerifiedMessage {
    /// Wormhole emitter chain ID
    pub emitter_chain: u16,

    /// Wormhole emitter address
    pub emitter_address: [u8; 32],

    /// Emitter sequence number
    pub sequence: u64,

    /// Raw VAA payload (bounded)
    #[max_len(MAX_PAYLOAD_SIZE)]
    pub payload: Vec<u8>,

    /// Keccak256 hash of the payload
    pub payload_hash: [u8; 32],

    /// Slot at which the VAA was verified
    pub verified_at_slot: u64,

    /// Unix timestamp at which the VAA was verified
    pub verified_at_unix_ts: i64,
}
