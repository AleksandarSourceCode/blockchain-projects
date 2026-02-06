// WormholeScan API endpoint (testnet)
export const WORMHOLESCAN_BASE_URL =
  "https://api.testnet.wormholescan.io/api/v1";

// Wormhole chain ID for Ethereum Sepolia (Wormhole-specific, not EVM chain ID)
export const WORMHOLE_CHAIN_ID_ETHEREUM_SEPOLIA = 10002;

// Ethereum emitter address (20 bytes, lowercase, hex, left-padded, without 0x)
export const EMITTER_ADDRESS =
  "00000000000000000000000042d5fd5a9640a60cb8af961fa42d51ffc43ff451";

// Initial sequence number (from LogMessagePublished events)
export const INITIAL_SEQUENCE = 0;

// Polling interval (milliseconds)
export const SLEEP_MS = 5_000;
