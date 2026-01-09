import { Connection, PublicKey } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { NftInfo } from "../../types/nftInfo.js";
import { ENCODING } from "../../constants.js";
import { getMetadataPda } from "../../utils/getMetaplexPda.js";
import { debugLog } from "../../utils/debug.js";

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

      const accountInfo = await connection.getAccountInfo(metadataPda);
      if (!accountInfo)
      {
        debugLog("[NFT] metadata account not found", token.mint);
        continue;
      }

      // Minimal Borsh string reader
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

      const name = readBorshString();
      const symbol = readBorshString();
      const uri = readBorshString();

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
