/**
 * Minimal NFT metadata representation
 */
export type NftInfo = {
  mint: string;
  name?: string | null;
  symbol?: string | null;
  uri?: string | null;
};
