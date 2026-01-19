import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EmployeeRewards } from "../../target/types/employee_rewards";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

export function getTestContext() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EmployeeRewards as Program<EmployeeRewards>;
  const connection = provider.connection;

  const admin = provider.wallet as anchor.Wallet;

  return { provider, program, connection, admin };
}
