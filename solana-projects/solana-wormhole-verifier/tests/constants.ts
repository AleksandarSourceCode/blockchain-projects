/// Wormhole Core Bridge program ID (devnet)
export const WORMHOLE_CORE_PROGRAM_ID_DEVNET =
  "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5";

/// Enables verbose logging for local development and scripts
export const DEBUG = true;

/// PDA seed for verified message accounts
export const VERIFIED_MESSAGE_SEED = Buffer.from("verified_message");

/// PDA seed used by Wormhole for guardian set accounts
export const GUARDIAN_SET_SEED = Buffer.from("GuardianSet");
