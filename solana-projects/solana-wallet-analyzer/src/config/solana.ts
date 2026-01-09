import { Connection } from "@solana/web3.js";

/**
 * Default Solana RPC endpoint
 */
export const RPC_URL = "https://api.mainnet-beta.solana.com";

/**
 * Shared Solana connection instance
 */
export const connection = new Connection(RPC_URL);