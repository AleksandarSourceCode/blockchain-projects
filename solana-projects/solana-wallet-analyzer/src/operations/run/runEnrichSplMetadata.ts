import { Connection } from "@solana/web3.js";

import { enrichSplMetadata } from "../enrich/enrichSplMetadata.js";
import { writeJson } from "../../utils/writeJson.js";
import { TokenInfo } from "../../types/tokenInfo.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Runs SPL metadata enrichment and writes the result to a JSON file
 */
export async function runEnrichSplMetadata(
  connection: Connection,
  tokens: TokenInfo[],
  outputFilePath: string,
  maxTokens?: number
) {
  const enrichedTokens = await enrichSplMetadata(
    connection,
    tokens,
    maxTokens
  );

  writeJson(outputFilePath, enrichedTokens);

  debugLog(
    "[SPL] enrichment completed",
    `${enrichedTokens.length} tokens saved`
  );

  return enrichedTokens;
}