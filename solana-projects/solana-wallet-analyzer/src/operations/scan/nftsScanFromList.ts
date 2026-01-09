import { Connection, PublicKey } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { NftInfo } from "../../types/nftInfo.js";
import { ENCODING } from "../../constants.js";
import { getMetadataPda } from "../../utils/getMetaplexPda.js";
import { debugLog } from "../../utils/debug.js";
import { readBorshString } from "../../utils/readBorshString.js";
import { withRetry } from "../../utils/withRetry.js";
import { rateLimit } from "../../utils/rateLimit.js";

const rateLimiter = rateLimit(350); // public RPC safe

/**
 * Scans a token list and extracts NFT metadata using SPL heuristics
 */
export async function nftsScanFromList(
  connection: Connection,
  tokens: TokenInfo[]
): Promise<NftInfo[]>
{
  const nfts: NftInfo[] = [];

  for (const token of tokens)
  {
    // NFT heuristic: supply = 1, decimals = 0
    if (token.amount !== 1 || token.decimals !== 0) continue;

    try
    {
      debugLog("[NFT] processing mint", token.mint);

      const mintPublicKey = new PublicKey(token.mint);
      const metadataPda = getMetadataPda(mintPublicKey);

      const accountInfo = await rateLimiter(() =>
        withRetry(() => connection.getAccountInfo(metadataPda))
      );
      if (!accountInfo)
      {
        debugLog("[NFT] metadata account not found", token.mint);
        continue;
      }

      const data = accountInfo.data;
      let offset = 1 + 32 + 32;
      const offsetRef = { value: offset };

      const name = readBorshString(data, offsetRef, ENCODING);
      const symbol = readBorshString(data, offsetRef, ENCODING);
      const uri = readBorshString(data, offsetRef, ENCODING);

      nfts.push({
        mint: token.mint,
        name,
        symbol,
        uri,
      });

      debugLog("[NFT] metadata loaded", { mint: token.mint, name, symbol });
    }
    catch (error)
    {
      debugLog("[NFT] metadata parse failed", { mint: token.mint, error });
    }
  }

  return nfts;
}

