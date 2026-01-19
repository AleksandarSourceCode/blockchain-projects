import { expect } from "chai";

import { getTestContext } from "../../context/test-context";
import { createTaskArgs } from "../../helpers/execution/create-task-args";
import { TASK_1 } from "../../constants/task";
import { withNewTaskId } from "../../helpers/execution/unique-task-id";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";
import { getNewYear } from "../../helpers/setup/unique-year";
import { Keypair } from "@solana/web3.js";
import { airdropSol } from "../../helpers/setup/airdrop";
import { ranks } from "../../constants/ranks";

describe("Task — lifecycle", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();
  const YEAR = getNewYear();

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
    await setupGlobalIfNeeded(program, connection, admin);
    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();
    await program.methods
      .registerEmployee(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();
  });

  it("rejects creating a task with an existing task id", async () => {
    const TASK = withNewTaskId(TASK_1);
    await program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc();

    await expect(
      program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc(),
    ).to.be.rejected;
  });
  it("rejects approving a task after it has been rejected", async () => {
    const TASK = withNewTaskId(TASK_1);

    await program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc();

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

    await program.methods.rejectTask(TASK.id, YEAR).accounts({}).rpc();

    await expect(program.methods.approveTask(TASK.id, YEAR).accounts({}).rpc())
      .to.be.rejected;
  });
  it("deactivates a task and prevents it from being started", async () => {
    const TASK = withNewTaskId(TASK_1);

    await program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc();

    await program.methods.deactivateTask(TASK.id).accounts({}).rpc();

    await expect(
      program.methods
        .startTask(TASK.id, YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc(),
    ).to.be.rejected;
  });
});
