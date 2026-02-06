/// Maximum allowed size of a verified VAA payload (bytes)
pub const MAX_PAYLOAD_SIZE: usize = 512;

/// PDA seed for verified message accounts
pub const VERIFIED_MESSAGE_SEED: &[u8] = b"verified_message";

/// Length of the Anchor account discriminator (bytes)
pub const ANCHOR_DISCRIMINATOR_LEN: usize = 8;

/// Minimum byte length required to parse a Wormhole VAA body.
/// Layout: timestamp(4) + nonce(4) + emitter_chain(2) + emitter_address(32) + sequence(8)
pub const VAA_BODY_MIN_LEN: usize = 50;
