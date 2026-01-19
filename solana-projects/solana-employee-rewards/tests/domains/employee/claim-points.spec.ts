import { Keypair } from "@solana/web3.js";

import { getTestContext } from "../../context/test-context";
import { airdropSol } from "../../helpers/setup/airdrop";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";
import { getNewYear } from "../../helpers/setup/unique-year";
import { withNewTaskId } from "../../helpers/execution/unique-task-id";
import { TASK_1, TASK_2 } from "../../constants/task";
import { createTaskArgs } from "../../helpers/execution/create-task-args";
import { ranks } from "../../constants/ranks";
import { expect } from "chai";

describe("Employee — claim points", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();
  const YEAR1 = getNewYear();
  const YEAR2 = getNewYear();
  const TASK1 = withNewTaskId(TASK_1);
  const TASK2 = withNewTaskId(TASK_2);

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
    await setupGlobalIfNeeded(program, connection, admin);
  });

  it("allows claiming points only after task approval and only once", async () => {
    await program.methods.openYear(YEAR1, ranks).accounts({}).rpc();
    await program.methods.createTask(createTaskArgs(TASK1)).accounts({}).rpc();

    await program.methods
      .registerEmployee(YEAR1)
      .accounts({ employee: employee.publicKey })
      .rpc();

    await expect(
      program.methods
        .claimPoints(TASK1.id, YEAR1)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc(),
    ).to.be.rejected;

    await program.methods
      .startTask(TASK1.id, YEAR1)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await expect(
      program.methods
        .claimPoints(TASK1.id, YEAR1)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc(),
    ).to.be.rejected;

    await program.methods
      .submitTask(TASK1.id, YEAR1)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await expect(
      program.methods
        .claimPoints(TASK1.id, YEAR1)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc(),
    ).to.be.rejected;

    await program.methods.approveTask(TASK1.id, YEAR1).accounts({}).rpc();

    await program.methods
      .claimPoints(TASK1.id, YEAR1)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await expect(
      program.methods
        .claimPoints(TASK1.id, YEAR1)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc(),
    ).to.be.rejected;
  });

  it("rejects claim after year is closed", async () => {
    await program.methods.openYear(YEAR2, ranks).accounts({}).rpc();
    await program.methods.createTask(createTaskArgs(TASK2)).accounts({}).rpc();

    await program.methods
      .registerEmployee(YEAR2)
      .accounts({ employee: employee.publicKey })
      .rpc();

    await program.methods
      .startTask(TASK2.id, YEAR2)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await program.methods
      .submitTask(TASK2.id, YEAR2)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    await program.methods.approveTask(TASK2.id, YEAR2).accounts({}).rpc();
    await program.methods.closeYear(YEAR2).accounts({}).rpc();

    // Claim is not allowed after year closure
    await expect(
      program.methods
        .claimPoints(TASK2.id, YEAR2)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc(),
    ).to.be.rejected;
  });
});
