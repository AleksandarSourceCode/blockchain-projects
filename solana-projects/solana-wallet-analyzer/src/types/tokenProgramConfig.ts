import { PublicKey } from "@solana/web3.js";
import { TokenProgramType } from "./tokenProgramType.js";

/**
 * Token program configuration descriptor
 */
export interface TokenProgramConfig
{
  id: PublicKey;
  type: TokenProgramType;
}
