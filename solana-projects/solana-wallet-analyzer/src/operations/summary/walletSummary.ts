import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { TokenInfo } from "../../types/tokenInfo.js";
import { TokenPrice } from "../../types/tokenPrice.js";
import { WalletSummary } from "../../types/walletSummary.js";
import { debugLog } from "../../utils/debug.js";

/**
 * Builds a summary of wallet balances and token counts
 */
export async function walletSummary(
  connection: Connection,
  walletPublicKey: PublicKey,
  tokens: TokenInfo[],
  pricedTokens?: TokenPrice[]
): Promise<WalletSummary>
{
  const balanceLamports = await connection.getBalance(walletPublicKey);

  const splTokens = tokens.filter((token) => token.program === "spl");
  const token2022Tokens = tokens.filter((token) => token.program === "token-2022");

  // NFT heuristic: supply = 1, decimals = 0
  const nfts = tokens.filter(
    (token) => token.amount === 1 && token.decimals === 0
  );

  const summary: WalletSummary = {
    wallet: walletPublicKey.toBase58(),

    tokenCount: tokens.length,
    nftCount: nfts.length,
    splTokenCount: splTokens.length,
    token2022Count: token2022Tokens.length,

    solBalanceLamports: balanceLamports,
    solBalance: balanceLamports / LAMPORTS_PER_SOL,
  };

  if (pricedTokens)
  {
    summary.totalValueUsd = pricedTokens.reduce(
      (sum, token) => sum + token.priceUsd,
      0
    );
  }

  debugLog("[SUMMARY] wallet summary built", summary);

  return summary;
}
