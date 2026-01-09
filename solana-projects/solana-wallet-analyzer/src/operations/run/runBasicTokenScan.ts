import { Connection, PublicKey } from "@solana/web3.js";

import { basicTokenScan } from "../scan/basicTokenScan.js";
import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Runs a basic token scan and persists the result to a JSON file
 */
export async function runBasicTokenScan(
  connection: Connection,
  walletPublicKey: PublicKey,
  outputFilePath: string
) {
  const tokens = await basicTokenScan(connection, walletPublicKey);

  writeJson(outputFilePath, tokens);
  
  debugLog(
      "[TOKEN] basic scan completed",
      `${tokens.length} tokens saved`
  );

  return tokens;
}