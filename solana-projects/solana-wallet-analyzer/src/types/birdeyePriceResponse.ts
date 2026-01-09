/**
 * Birdeye price API response shape
 */
export type BirdeyePriceResponse = {
  success: boolean;
  data?: {
    value?: number;
  };
};