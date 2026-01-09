import { Connection, PublicKey } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { withRetry } from "../../utils/withRetry.js";
import { rateLimit } from "../../utils/rateLimit.js";
import { ENCODING } from "../../constants.js";
import { getMetadataPda } from "../../utils/getMetaplexPda.js";
import { debugLog } from "../../utils/debug.js";

const rateLimiter = rateLimit(330);

/**
 * Enriches SPL tokens with Metaplex metadata (name, symbol, uri)
 */
export async function enrichSplMetadata(
  connection: Connection,
  tokens: TokenInfo[],
  maxTokens?: number
): Promise<TokenInfo[]>
{
  const enrichedTokens: TokenInfo[] = [];
  let processedCount = 0;

  for (const token of tokens)
  {
    if (token.program !== "spl") continue;

    if (maxTokens !== undefined && processedCount >= maxTokens) break;

    try
    {
      debugLog("[SPL] processing token", {
        mint: token.mint,
        index: processedCount + 1,
        max: maxTokens ?? "∞",
      });

      const mintPublicKey = new PublicKey(token.mint);
      const metadataPda = getMetadataPda(mintPublicKey);

      const accountInfo = await rateLimiter(() =>
        withRetry(() => connection.getAccountInfo(metadataPda))
      );

      if (!accountInfo)
      {
        debugLog("[SPL] metadata account not found", token.mint);
        continue;
      }

      const data = accountInfo.data;
      let offset = 1 + 32 + 32;

      const readBorshString = (): string =>
      {
        const length = data.readUInt32LE(offset);
        offset += 4;

        const value = data
          .subarray(offset, offset + length)
          .toString(ENCODING)
          .replace(/\0/g, "")
          .trim();

        offset += length;
        return value;
      };

      token.name = readBorshString();
      token.symbol = readBorshString();
      token.uri = readBorshString();

      enrichedTokens.push(token);
      processedCount++;

      debugLog("[SPL] metadata loaded", {
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
      });
    }
    catch (error)
    {
      debugLog("[SPL] metadata fetch failed", {
        mint: token.mint,
        error,
      });
    }
  }

  return enrichedTokens;
}
