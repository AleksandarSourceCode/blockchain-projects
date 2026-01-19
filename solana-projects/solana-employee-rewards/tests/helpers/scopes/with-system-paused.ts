import { Program } from "@coral-xyz/anchor";
import { EmployeeRewards } from "../../../target/types/employee_rewards";

export async function withPausedSystem(
  program: Program<EmployeeRewards>,
  fn: () => Promise<void>,
) {
  await program.methods.updateGlobal(null, true, null).accounts({}).rpc();

  try {
    await fn();
  } finally {
    await program.methods.updateGlobal(null, false, null).accounts({}).rpc();
  }
}
