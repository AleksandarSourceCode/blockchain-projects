import { TokenProgramType } from "./tokenProgramType.js";

/**
 * Token filtering criteria
 */
export type TokenFilter = {
  program?: TokenProgramType;
  minAmount?: number;
  hasMetadata?: boolean;
  symbolEquals?: string;
};
