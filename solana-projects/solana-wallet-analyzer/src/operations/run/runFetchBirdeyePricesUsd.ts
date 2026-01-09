import { TokenInfo } from "../../types/tokenInfo.js";

import { fetchBirdeyePricesUsd } from "../value/fetchBirdeyePricesUsd.js";
import { sortTokenPricesDesc } from "../value/sortTokenPricesDesc.js";
import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Fetches Birdeye USD prices, sorts them, and writes the result to a JSON file
 */
export async function runFetchBirdeyePricesUsd(
  tokens: TokenInfo[],
  outputFilePath: string,
  maxTokens?: number
) {
  const prices = await fetchBirdeyePricesUsd(tokens, maxTokens);
  const sortedPrices = sortTokenPricesDesc(prices);

  writeJson(outputFilePath, sortedPrices);

  debugLog(
    "[BIRDEYE] price fetch completed",
    `${sortedPrices.length} token prices saved`
  );

  return sortedPrices;
}
