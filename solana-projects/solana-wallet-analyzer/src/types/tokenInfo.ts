import { TokenProgramType } from "./tokenProgramType.js";

/**
 * Normalized token account representation
 */
export type TokenInfo = {
  index: number;
  mint: string;
  amount: number;
  decimals: number;
  program: TokenProgramType;
  name?: string | null;
  symbol?: string | null;
  uri?: string | null;
};
