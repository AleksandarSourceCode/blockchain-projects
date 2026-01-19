import { Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

import { getTestContext } from "../context/test-context";
import { airdropSol } from "../helpers/setup/airdrop";
import {
  MEMBER_STATUS_COLLECTION_METADATA,
  SILVER_COIN_METADATA,
} from "../fixtures/metadata";
import { ranks } from "../constants/ranks";
import { TASK_1 } from "../constants/task";
import { createTaskArgs } from "../helpers/execution/create-task-args";
import { withHighComputeUnits } from "../helpers/execution/compute-units";
import { setupGlobalIfNeeded } from "../helpers/setup/setup-global";
import { getNewYear } from "../helpers/setup/unique-year";
import { withNewTaskId } from "../helpers/execution/unique-task-id";
import { withPausedSystem } from "../helpers/scopes/with-system-paused";
import { expectAnchorError } from "../helpers/assertions/expect-anchor-failure";

describe("System pause — global guard", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();
  const YEAR = getNewYear();
  const TASK = withNewTaskId(TASK_1);
  const REDEEM_AMOUNT = new BN(1);

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
  });

  it("blocks critical reward flow operations while paused and resumes correctly", async () => {
    const payoutMint = await setupGlobalIfNeeded(program, connection, admin);

    // Year initialization
    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods.openYear(YEAR, ranks).accounts({}).rpc(),
        "SystemPaused",
      );
    });

    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();
    await program.methods.createTask(createTaskArgs(TASK)).accounts({}).rpc();

    // Employee registration
    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods
          .registerEmployee(YEAR)
          .accounts({ employee: employee.publicKey })
          .rpc(),
        "SystemPaused",
      );
    });

    await program.methods
      .registerEmployee(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Task lifecycle
    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods
          .startTask(TASK.id, YEAR)
          .accounts({ employee: employee.publicKey })
          .signers([employee])
          .rpc(),
        "SystemPaused",
      );
    });

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

    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods.approveTask(TASK.id, YEAR).accounts({}).rpc(),
        "SystemPaused",
      );
    });

    await program.methods.approveTask(TASK.id, YEAR).accounts({}).rpc();

    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods
          .claimPoints(TASK.id, YEAR)
          .accounts({ employee: employee.publicKey })
          .signers([employee])
          .rpc(),
        "SystemPaused",
      );
    });

    await program.methods
      .claimPoints(TASK.id, YEAR)
      .accounts({ employee: employee.publicKey })
      .signers([employee])
      .rpc();

    // Year settlement
    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods.closeYear(YEAR).accounts({}).rpc(),
        "SystemPaused",
      );
    });

    await program.methods.closeYear(YEAR).accounts({}).rpc();

    await program.methods
      .settleEmployeeYear(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Reward distribution
    await program.methods
      .initRewardTokenMint(YEAR, SILVER_COIN_METADATA)
      .accounts({})
      .rpc();

    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods
          .mintRewardTokens(YEAR)
          .accounts({ employee: employee.publicKey })
          .rpc(),
        "SystemPaused",
      );
    });

    await program.methods
      .mintRewardTokens(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Member status NFT
    await program.methods
      .initMemberStatusCollection(YEAR, MEMBER_STATUS_COLLECTION_METADATA)
      .accounts({})
      .rpc();

    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods
          .mintMemberStatusNft(YEAR)
          .accounts({ employee: employee.publicKey })
          .preInstructions([withHighComputeUnits()])
          .rpc(),
        "SystemPaused",
      );
    });

    await program.methods
      .mintMemberStatusNft(YEAR)
      .accounts({ employee: employee.publicKey })
      .preInstructions([withHighComputeUnits()])
      .rpc();

    await program.methods
      .verifyMemberStatusNft(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Reward redemption
    await withPausedSystem(program, async () => {
      await expectAnchorError(
        program.methods
          .redeemRewardTokens(YEAR, REDEEM_AMOUNT)
          .accounts({ employee: employee.publicKey, payoutMint })
          .signers([employee])
          .rpc(),
        "SystemPaused",
      );
    });

    await program.methods
      .redeemRewardTokens(YEAR, REDEEM_AMOUNT)
      .accounts({ employee: employee.publicKey, payoutMint })
      .signers([employee])
      .rpc();
  });
});
