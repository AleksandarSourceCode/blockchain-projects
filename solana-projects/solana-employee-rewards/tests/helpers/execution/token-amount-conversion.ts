import { BN } from "@coral-xyz/anchor";

export function bnToTokenAmount(amount: BN, decimals: number, payoutMultiplier: number) {
  return BigInt(payoutMultiplier) * BigInt(amount.toString()) * 10n ** BigInt(decimals);
}
