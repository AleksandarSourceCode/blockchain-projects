import { ComputeBudgetProgram } from "@solana/web3.js";

export const DEFAULT_HIGH_COMPUTE_UNITS = 400_000;

export function withHighComputeUnits(
  units: number = DEFAULT_HIGH_COMPUTE_UNITS,
) {
  return ComputeBudgetProgram.setComputeUnitLimit({ units });
}
