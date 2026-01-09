import { Connection } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { enrichToken2022Metadata } from "../enrich/enrichToken2022Metadata.js";
import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Runs Token-2022 metadata enrichment and writes the result to a JSON file
 */
export async function runEnrichToken2022Metadata(
  connection: Connection,
  tokens: TokenInfo[],
  outputFilePath: string,
  maxTokens?: number
) {
  const enrichedTokens = await enrichToken2022Metadata(
    connection,
    tokens,
    maxTokens
  );

  writeJson(outputFilePath, enrichedTokens);

  debugLog(
    "[T22] enrichment completed",
    `${enrichedTokens.length} tokens saved`
  );
  
  return enrichedTokens;
}
