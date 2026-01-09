/**
 * Token price filtering criteria
 */
export type TokenPriceFilter = {
  minPriceUsd?: number;
  maxPriceUsd?: number;
  minValueUsd?: number;
  nameEquals?: string;
};
