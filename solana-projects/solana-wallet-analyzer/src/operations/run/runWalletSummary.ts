import { Connection, PublicKey } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { TokenPrice } from "../../types/tokenPrice.js";
import { WalletSummary } from "../../types/walletSummary.js";
import { walletSummary } from "../summary/walletSummary.js";
import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Builds and persists a wallet summary to a JSON file
 */
export async function runWalletSummary(
  connection: Connection,
  walletPublicKey: PublicKey,
  tokens: TokenInfo[],
  outputFilePath: string,
  pricedTokens?: TokenPrice[]
): Promise<WalletSummary>
{
  const summary = await walletSummary(
    connection,
    walletPublicKey,
    tokens,
    pricedTokens
  );

  writeJson(outputFilePath, summary);

  debugLog("[SUMMARY] wallet summary saved");

  return summary;
}
