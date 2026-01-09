import { Connection, PublicKey } from "@solana/web3.js";
import {
  getMint,
  getMetadataPointerState,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

import { TokenInfo } from "../../types/tokenInfo.js";
import { withRetry } from "../../utils/withRetry.js";
import { rateLimit } from "../../utils/rateLimit.js";
import { debugLog } from "../../utils/debug.js";

const rateLimiter = rateLimit(350);

/**
 * Enriches Token-2022 tokens with on-chain metadata (name, symbol, uri)
 */
export async function enrichToken2022Metadata(
  connection: Connection,
  tokens: TokenInfo[],
  maxTokens?: number
): Promise<TokenInfo[]>
{
  const enrichedTokens: TokenInfo[] = [];
  let processedCount = 0;

  for (const token of tokens)
  {
    if (token.program !== "token-2022") continue;
    if (maxTokens !== undefined && processedCount >= maxTokens) break;

    try
    {
      debugLog("[T22] processing token", {
        mint: token.mint,
        index: processedCount + 1,
        max: maxTokens ?? "∞",
      });

      const mintPublicKey = new PublicKey(token.mint);

      // Fetch mint account (rate limited)
      const mint = await rateLimiter(() =>
        withRetry(() =>
          getMint(connection, mintPublicKey, undefined, TOKEN_2022_PROGRAM_ID)
        )
      );

      // Resolve metadata pointer
      const pointerState = getMetadataPointerState(mint);
      if (!pointerState?.metadataAddress)
      {
        debugLog("[T22] metadata pointer missing", token.mint);
        continue;
      }

      // Fetch metadata account (rate limited)
      const metadata = await rateLimiter(() =>
        withRetry(() =>
          getTokenMetadata(connection, pointerState.metadataAddress!)
        )
      );

      if (!metadata)
      {
        debugLog("[T22] metadata account not found", token.mint);
        continue;
      }

      token.name = metadata.name ?? null;
      token.symbol = metadata.symbol ?? null;
      token.uri = metadata.uri ?? null;

      enrichedTokens.push(token);
      processedCount++;

      debugLog("[T22] metadata loaded", {
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
      });
    }
    catch (error)
    {
      debugLog("[T22] metadata fetch failed", {
        mint: token.mint,
        error,
      });
    }
  }

  return enrichedTokens;
}
