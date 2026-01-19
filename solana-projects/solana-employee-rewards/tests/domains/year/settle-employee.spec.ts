import { expect } from "chai";
import { Keypair } from "@solana/web3.js";

import { getTestContext } from "../../context/test-context";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";
import { getNewYear } from "../../helpers/setup/unique-year";
import { ranks } from "../../constants/ranks";
import { airdropSol } from "../../helpers/setup/airdrop";
import { createTaskArgs } from "../../helpers/execution/create-task-args";
import { TASK_1 } from "../../constants/task";
import { withNewTaskId } from "../../helpers/execution/unique-task-id";

describe("Year — settle employee", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();

  const TASK = withNewTaskId(TASK_1);

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
    await setupGlobalIfNeeded(program, connection, admin);
  });

  it("rejects settling an employee for a year that was never opened", async () => {
    const YEAR = getNewYear();

    await expect(
      program.methods
        .settleEmployeeYear(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc(),
    ).to.be.rejected;
  });

  it("rejects settling an employee while the year is still open", async () => {
    const YEAR = getNewYear();

    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();

    await expect(
      program.methods
        .settleEmployeeYear(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc(),
    ).to.be.rejected;
  });

  it("settles employee after year is closed and prevents settling twice", async () => {
    const YEAR = getNewYear();

    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();
    await program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc();

    // Employee lifecycle
    await program.methods
      .registerEmployee(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    await program.methods
      .startTask(TASK.id, YEAR)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await program.methods
      .submitTask(TASK.id, YEAR)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await program.methods.approveTask(TASK.id, YEAR).accounts({}).rpc();

    await program.methods
      .claimPoints(TASK.id, YEAR)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();
    await program.methods.closeYear(YEAR).accounts({}).rpc();

    await program.methods
      .settleEmployeeYear(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    await expect(
      program.methods
        .settleEmployeeYear(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc(),
    ).to.be.rejected;
  });
});
