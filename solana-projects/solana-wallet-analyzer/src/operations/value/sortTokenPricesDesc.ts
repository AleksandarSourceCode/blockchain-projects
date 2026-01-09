import { TokenPrice } from "../../types/tokenPrice.js";

export function sortTokenPricesDesc(
  tokens: TokenPrice[]
): TokenPrice[] {
  return [...tokens].sort(
    (a, b) => b.priceUsd - a.priceUsd
  );
}