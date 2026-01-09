import { TokenPrice } from "../../types/tokenPrice.js";
import { TokenPriceFilter } from "../../types/tokenPriceFilter.js";

/**
 * Filters token prices based on price, value, and name criteria
 */
export function filterTokenPrices(
  tokens: TokenPrice[],
  filter: TokenPriceFilter
): TokenPrice[]
{
  return tokens.filter((token) =>
  {
    if (
      filter.minPriceUsd !== undefined &&
      token.priceUsd < filter.minPriceUsd
    ) {
      return false;
    }

    if (
      filter.maxPriceUsd !== undefined &&
      token.priceUsd > filter.maxPriceUsd
    ) {
      return false;
    }

    const valueUsd = token.amount * token.priceUsd;

    if (
      filter.minValueUsd !== undefined &&
      valueUsd < filter.minValueUsd
    ) {
      return false;
    }

    if (
      filter.nameEquals !== undefined &&
      token.name !== filter.nameEquals
    ) {
      return false;
    }

    return true;
  });
}
