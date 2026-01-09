/**
 * Token price representation with USD value
 */
export type TokenPrice = {
  mint: string;
  name: string;
  amount: number;
  priceUsd: number;
};
