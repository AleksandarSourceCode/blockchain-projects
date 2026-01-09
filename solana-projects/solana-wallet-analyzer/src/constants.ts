import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { TokenProgramConfig } from "./types/tokenProgramConfig.js";

/**
 * Default wallet address used for analysis
 */
export const WALLET_ADDRESS =
  "FwAbxSiCd2Wc8j7BeFfwSrnpHWDGmR4xqv6B6bgbwYKs";

/**
 * Supported token programs
 */
export const TOKEN_PROGRAMS: TokenProgramConfig[] = [
  { id: TOKEN_PROGRAM_ID, type: "spl" },
  { id: TOKEN_2022_PROGRAM_ID, type: "token-2022" },
];

/**
 * Metaplex metadata program
 */
export const METAPLEX_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const METADATA_SEED = "metadata";

/**
 * Default string encoding for on-chain metadata
 */
export const ENCODING = "utf8";

/**
 * Global debug flag
 */
export const DEBUG = true;
