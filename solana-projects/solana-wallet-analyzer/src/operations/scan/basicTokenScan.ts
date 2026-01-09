import { Connection, PublicKey } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { TOKEN_PROGRAMS } from "../../constants.js";
import { withRetry } from "../../utils/withRetry.js";
import { rateLimit } from "../../utils/rateLimit.js";

const rateLimiter = rateLimit(350); // public RPC safe

/**
 * Scans SPL and Token-2022 token accounts for a wallet
 */
export async function basicTokenScan(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<TokenInfo[]>
{
  const tokens: TokenInfo[] = [];
  let index = 0;

  for (const program of TOKEN_PROGRAMS)
  {
    // Fetch parsed token accounts for the given token program
    const accounts = await rateLimiter(() =>
      withRetry(() =>
        connection.getParsedTokenAccountsByOwner(walletPublicKey, {
          programId: program.id,
        })
      )
    );

    for (const account of accounts.value)
    {
      const info = account.account.data.parsed.info;
      const amount = Number(info.tokenAmount.amount);

      // Skip empty balances
      if (amount === 0) continue;

      tokens.push({
        index: index++,
        mint: info.mint,
        amount,
        decimals: info.tokenAmount.decimals,
        program: program.type,
        name: null,
        symbol: null,
      });
    }
  }

  return tokens;
}
