import { Keypair } from "@solana/web3.js";
import { expect } from "chai";

import { getTestContext } from "../../../context/test-context";
import { airdropSol } from "../../../helpers/setup/airdrop";
import { createTaskArgs } from "../../../helpers/execution/create-task-args";
import { withHighComputeUnits } from "../../../helpers/execution/compute-units";
import { setupGlobalIfNeeded } from "../../../helpers/setup/setup-global";
import { deriveAnnualSettlementPda } from "../../../helpers/pda/derive-pdas";

import {
  POINTS_FOR_RANK_I,
  POINTS_FOR_RANK_II,
  POINTS_FOR_RANK_III,
  POINTS_FOR_RANK_IV,
  ranks,
} from "../../../constants/ranks";

import { MEMBER_STATUS_COLLECTION_METADATA } from "../../../fixtures/metadata";
import { getNewYear } from "../../../helpers/setup/unique-year";
import { getNewTaskId } from "../../../helpers/execution/unique-task-id";

describe("Member Status NFT — multi-employee E2E", () => {
  const { program, connection, admin } = getTestContext();
  const YEAR = getNewYear();

  const employees = Array.from({ length: 4 }, () => Keypair.generate());

  const tasks = [
    {
      id: getNewTaskId(),
      description: "Rank I task",
      specUrl: "url/7",
      points: POINTS_FOR_RANK_I,
      expectedRank: 1,
    },
    {
      id: getNewTaskId(),
      description: "Rank II task",
      specUrl: "url/8",
      points: POINTS_FOR_RANK_II,
      expectedRank: 2,
    },
    {
      id: getNewTaskId(),
      description: "Rank III task",
      specUrl: "url/9",
      points: POINTS_FOR_RANK_III,
      expectedRank: 3,
    },
    {
      id: getNewTaskId(),
      description: "Rank IV task",
      specUrl: "url/10",
      points: POINTS_FOR_RANK_IV,
      expectedRank: 4,
    },
  ];

  before(async () => {
    for (const employee of employees) {
      await airdropSol(connection, employee.publicKey, 2);
    }
  });

  it("mints correct member status NFTs based on yearly ranks", async () => {
    // Global setup
    await setupGlobalIfNeeded(program, connection, admin);
    await program.methods.openYear(YEAR, ranks).accounts({}).rpc();

    for (const task of tasks) {
      await program.methods.createTask(createTaskArgs(task)).accounts({}).rpc();
    }

    // Employee task execution
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const task = tasks[i];

      await program.methods
        .registerEmployee(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc();

      await program.methods
        .startTask(task.id, YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc();

      await program.methods
        .submitTask(task.id, YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc();

      await program.methods.approveTask(task.id, YEAR).accounts({}).rpc();

      await program.methods
        .claimPoints(task.id, YEAR)
        .accounts({ employee: employee.publicKey })
        .signers([employee])
        .rpc();
    }

    // Year settlement
    await program.methods.closeYear(YEAR).accounts({}).rpc();

    for (const employee of employees) {
      await program.methods
        .settleEmployeeYear(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc();
    }

    // Member Status NFT minting
    await program.methods
      .initMemberStatusCollection(YEAR, MEMBER_STATUS_COLLECTION_METADATA)
      .accounts({})
      .rpc();

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const expectedRank = tasks[i].expectedRank;

      await program.methods
        .mintMemberStatusNft(YEAR)
        .accounts({ employee: employee.publicKey })
        .preInstructions([withHighComputeUnits()])
        .rpc();

      await program.methods
        .verifyMemberStatusNft(YEAR)
        .accounts({ employee: employee.publicKey })
        .rpc();

      const [annualSettlementPda] = deriveAnnualSettlementPda(
        program.programId,
        employee.publicKey,
        YEAR,
      );

      const settlement = await program.account.annualSettlement.fetch(
        annualSettlementPda,
      );

      expect(settlement.rank.id).to.eq(expectedRank);
      expect(settlement.memberStatusNftMinted).to.be.true;
    }
  });
});
