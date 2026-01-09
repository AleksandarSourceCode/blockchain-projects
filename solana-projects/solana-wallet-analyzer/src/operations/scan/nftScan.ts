import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { NftInfo } from "../../types/nftInfo.js";
import { withRetry } from "../../utils/withRetry.js";
import { rateLimit } from "../../utils/rateLimit.js";
import { getMetadataPda } from "../../utils/getMetaplexPda.js";
import { ENCODING } from "../../constants.js";
import { debugLog } from "../../utils/debug.js";
import { readBorshString } from "../../utils/readBorshString.js";

const rateLimiter = rateLimit(350); // public RPC safe

/**
 * Scans wallet token accounts and extracts SPL NFT metadata
 */
export async function nftScan(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<NftInfo[]>
{
  const nfts: NftInfo[] = [];

  // Fetch parsed SPL token accounts for the wallet
  const accounts = await rateLimiter(() =>
    withRetry(() =>
      connection.getParsedTokenAccountsByOwner(walletPublicKey, {
        programId: TOKEN_PROGRAM_ID,
      })
    )
  );

  for (const account of accounts.value)
  {
    try
    {
      const info = account.account.data.parsed.info;
      const amount = Number(info.tokenAmount.amount);
      const decimals = info.tokenAmount.decimals;

      // NFT heuristic: supply = 1, decimals = 0
      if (amount !== 1 || decimals !== 0) continue;

      debugLog("[NFT] processing mint", info.mint);

      const mintPublicKey = new PublicKey(info.mint);
      const metadataPda = getMetadataPda(mintPublicKey);

      const metadataAccount = await rateLimiter(() =>
        withRetry(() => connection.getAccountInfo(metadataPda))
      );

      if (!metadataAccount)
      {
        debugLog("[NFT] metadata account not found", info.mint);
        continue;
      }

      const data = metadataAccount.data;
      let offset = 1 + 32 + 32;
      const offsetRef = { value: offset };
      

      nfts.push({
        mint: info.mint,
        name: readBorshString(data, offsetRef, ENCODING),
        symbol: readBorshString(data, offsetRef, ENCODING),
        uri: readBorshString(data, offsetRef, ENCODING),
      });

      debugLog("[NFT] metadata loaded", info.mint);
    }
    catch (error)
    {
      debugLog("[NFT] scan failed", { mint: "unknown", error });
    }
  }

  return nfts;
}
