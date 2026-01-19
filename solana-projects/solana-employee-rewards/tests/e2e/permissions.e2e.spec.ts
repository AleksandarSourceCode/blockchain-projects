import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { expect } from "chai";

import { getTestContext } from "../context/test-context";
import { airdropSol } from "../helpers/setup/airdrop";

import { SILVER_COIN_METADATA } from "../fixtures/metadata";

import { ranks } from "../constants/ranks";
import { TASK_1 } from "../constants/task";
import { createTaskArgs } from "../helpers/execution/create-task-args";
import { setupGlobalIfNeeded } from "../helpers/setup/setup-global";
import { getNewYear } from "../helpers/setup/unique-year";
import { withNewTaskId } from "../helpers/execution/unique-task-id";

describe("Employee Rewards — E2E permissions (full flow)", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();
  const attackerEmployee = Keypair.generate();
  const attackerAdmin = Keypair.generate();

  const YEAR = getNewYear();
  const TASK = withNewTaskId(TASK_1);
  const REDEEM_AMOUNT = new BN(1);

  let payoutMint: PublicKey;

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
    await airdropSol(connection, attackerEmployee.publicKey, 2);
    await airdropSol(connection, attackerAdmin.publicKey, 2);

    payoutMint = await setupGlobalIfNeeded(program, connection, admin);
  });

  it("enforces access control across the yearly reward flow", async () => {
    // Global administration
    await expect(
      program.methods
        .openYear(YEAR, ranks)
        .accounts({ admin: attackerAdmin })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;

    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();
    await program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc();

    // Employee registration
    await expect(
      program.methods
        .registerEmployee(YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;

    await program.methods
      .registerEmployee(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Task lifecycle
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

    await expect(
      program.methods
        .approveTask(TASK.id, YEAR)
        .accounts({ admin: attackerAdmin.publicKey })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;

    await program.methods.approveTask(TASK.id, YEAR).accounts({}).rpc();

    // Points claiming
    await expect(
      program.methods
        .claimPoints(TASK.id, YEAR)
        .accounts({ employee: attackerEmployee.publicKey })
        .signers([attackerEmployee])
        .rpc(),
    ).to.be.rejected;

    await program.methods
      .claimPoints(TASK.id, YEAR)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    // Year settlement
    await expect(
      program.methods
        .closeYear(YEAR)
        .accounts({ admin: attackerAdmin })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;

    await program.methods.closeYear(YEAR).accounts({}).rpc();

    await expect(
      program.methods
        .settleEmployeeYear(YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;

    await program.methods
      .settleEmployeeYear(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Reward distribution
    await program.methods
      .initRewardTokenMint(YEAR, SILVER_COIN_METADATA)
      .accounts({})
      .rpc();

    await expect(
      program.methods
        .mintRewardTokens(YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;

    await program.methods
      .mintRewardTokens(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    await program.methods
      .redeemRewardTokens(YEAR, REDEEM_AMOUNT)
      .accounts({
        employee: employee.publicKey,
        payoutMint,
      })
      .signers([employee])
      .rpc();
  });
});
