/**
 * Aggregated wallet overview and balances
 */
export type WalletSummary = {
  wallet: string;

  tokenCount: number;
  nftCount: number;
  splTokenCount: number;
  token2022Count: number;

  solBalanceLamports: number;
  solBalance: number; 

  totalValueUsd?: number;    // Present when token prices are available
};
