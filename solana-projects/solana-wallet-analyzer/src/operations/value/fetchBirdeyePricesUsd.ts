import { TokenInfo } from "../../types/tokenInfo.js";
import { TokenPrice } from "../../types/tokenPrice.js";
import { BirdeyePriceResponse } from "../../types/birdeyePriceResponse.js";

import { withRetry } from "../../utils/withRetry.js";
import { rateLimit } from "../../utils/rateLimit.js";
import { debugLog } from "../../utils/debug.js";
import { BIRDEYE_API_KEY } from "../../keys.js";

const rateLimiter = rateLimit(1100); // ~60 RPM

/**
 * Fetches USD prices for tokens using Birdeye API
 */
export async function fetchBirdeyePricesUsd(
  tokens: TokenInfo[],
  maxTokens?: number
): Promise<TokenPrice[]>
{
  const prices: TokenPrice[] = [];
  const targetTokens = maxTokens ? tokens.slice(0, maxTokens) : tokens;
  let processedCount = 0;

  for (const token of targetTokens)
  {
    try
    {
      debugLog("[BIRDEYE] processing", {
        mint: token.mint,
        index: processedCount + 1,
        max: targetTokens.length,
      });

      const url =
        "https://public-api.birdeye.so/defi/price" +
        `?address=${token.mint}&ui_amount_mode=raw`;

      const response = await rateLimiter(() =>
        withRetry(async () =>
        {
          const res = await fetch(url, {
            headers: {
              "X-API-KEY": BIRDEYE_API_KEY,
              accept: "application/json",
              "x-chain": "solana",
            },
          });

          if (!res.ok)
          {
            throw new Error(`Birdeye HTTP ${res.status}`);
          }

          return (await res.json()) as BirdeyePriceResponse;
        })
      );

      if (response.success && typeof response.data?.value === "number")
      {
        prices.push({
          mint: token.mint,
          name: token.name ?? "",
          amount: token.amount,
          priceUsd: response.data.value,
        });

        processedCount++;

        debugLog("[BIRDEYE] price loaded", {
          mint: token.mint,
          priceUsd: response.data.value,
        });
      }
    }
    catch (error)
    {
      processedCount++;
      
      debugLog("[BIRDEYE] price fetch failed", {
        mint: token.mint,
        error,
      });
    }
  }

  return prices;
}
