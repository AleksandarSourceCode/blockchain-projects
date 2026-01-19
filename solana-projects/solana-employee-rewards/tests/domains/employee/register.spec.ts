import { expect } from "chai";
import { Keypair } from "@solana/web3.js";

import { ranks } from "../../constants/ranks";
import { getTestContext } from "../../context/test-context";
import { getNewYear } from "../../helpers/setup/unique-year";
import { airdropSol } from "../../helpers/setup/airdrop";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";

describe("Employee — register", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
    await setupGlobalIfNeeded(program, connection, admin);
  });

  it("registers employee for an open year", async () => {
    const YEAR = getNewYear();

    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();

    await program.methods
      .registerEmployee(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();
  });

  it("rejects duplicate employee registration", async () => {
    const YEAR = getNewYear();

    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();

    await program.methods
      .registerEmployee(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    await expect(
      program.methods
        .registerEmployee(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc(),
    ).to.be.rejected;
  });

  it("rejects employee registration when the year is not open", async () => {
    const YEAR = getNewYear();

    await expect(
      program.methods
        .registerEmployee(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc(),
    ).to.be.rejected;
  });
});
