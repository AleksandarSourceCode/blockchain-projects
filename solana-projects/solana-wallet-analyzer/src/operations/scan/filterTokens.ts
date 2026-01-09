import { TokenInfo } from "../../types/tokenInfo.js";
import { TokenFilter } from "../../types/tokenFilter.js";

/**
 * Filters tokens based on program, amount, metadata presence, and symbol
 */
export function filterTokens(
  tokens: TokenInfo[],
  filter: TokenFilter
): TokenInfo[]
{
  return tokens.filter((token) =>
  {
    if (filter.program && token.program !== filter.program)
    {
      return false;
    }

    if (
      filter.minAmount !== undefined &&
      token.amount < filter.minAmount
    ) {
      return false;
    }

    if (
      filter.hasMetadata === true &&
      (!token.name || !token.symbol)
    ) {
      return false;
    }

    if (
      filter.hasMetadata === false &&
      (token.name || token.symbol)
    ) {
      return false;
    }

    if (
      filter.symbolEquals !== undefined &&
      token.symbol !== filter.symbolEquals
    ) {
      return false;
    }

    return true;
  });
}
