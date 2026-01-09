import { DEBUG } from "../constants.js";

/**
 * Outputs debug logs when DEBUG flag is enabled
 */
export function debugLog(...args: unknown[]): void
{
  if (!DEBUG) return;
  console.log(...args);
}
