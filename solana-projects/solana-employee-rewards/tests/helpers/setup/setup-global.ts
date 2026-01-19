import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

import { createMintAndFund } from "../execution/mint-and-fund";
import { deriveGlobalConfigPda, deriveTreasuryPda } from "../pda/derive-pdas";
import { EmployeeRewards } from "../../../target/types/employee_rewards";

// Initializes global state and payout mint if not already present.
export async function setupGlobalIfNeeded(
  program: Program<EmployeeRewards>,
  connection: Connection,
  admin: Wallet,
): Promise<PublicKey> {
  const [globalPda] = deriveGlobalConfigPda(program.programId);

  try {
    const global = await program.account.globalConfig.fetch(globalPda);
    return global.payoutMint;
  } catch {
    const [treasuryPda] = deriveTreasuryPda(program.programId);

    const { mint: payoutMint } = await createMintAndFund(
      connection,
      admin.payer,
      treasuryPda,
      1_000_000_000n,
    );

    await program.methods.initGlobal().accounts({ payoutMint }).rpc();

    return payoutMint;
  }
}
