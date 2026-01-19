import { Keypair, PublicKey } from "@solana/web3.js";
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
import { getAccount, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { expect } from "chai";
import { bnToTokenAmount } from "../helpers/execution/token-amount-conversion";
import { PAYOUT_MINT_DECIMALS, REWARD_PAYOUT_MULTIPLIER } from "../constants/mints";
import { setupGlobalIfNeeded } from "../helpers/setup/setup-global";
import { getNewYear } from "../helpers/setup/unique-year";
import { withNewTaskId } from "../helpers/execution/unique-task-id";
import { deriveMemberStatusNftMintPda } from "../helpers/pda/derive-pdas";

describe("Employee Rewards — E2E flow", () => {
  const { program, connection, admin } = getTestContext();

  const employee = Keypair.generate();
  const YEAR = getNewYear();
  const TASK = withNewTaskId(TASK_1);

  const REDEEM_AMOUNT = new BN(1);

  before(async () => {
    await airdropSol(connection, employee.publicKey, 2);
  });

  it("runs complete yearly reward flow", async () => {
    // System initialization
    const payoutMint = await setupGlobalIfNeeded(program, connection, admin);

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

    // Year settlement
    await program.methods.closeYear(YEAR).accounts({}).rpc();

    await program.methods
      .settleEmployeeYear(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Rewards distribution
    await program.methods
      .initRewardTokenMint(YEAR, SILVER_COIN_METADATA)
      .accounts({})
      .rpc();

    await program.methods
      .mintRewardTokens(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    // Member status NFT
    await program.methods
      .initMemberStatusCollection(YEAR, MEMBER_STATUS_COLLECTION_METADATA)
      .accounts({})
      .rpc();

    await program.methods
      .mintMemberStatusNft(YEAR)
      .accounts({ employee: employee.publicKey })
      .preInstructions([withHighComputeUnits()])
      .rpc();

    await program.methods
      .verifyMemberStatusNft(YEAR)
      .accounts({ employee: employee.publicKey })
      .rpc();

    const [memberStatusMint] = deriveMemberStatusNftMintPda(
      program.programId,
      employee.publicKey,
      YEAR,
    );

    const nftAta = await getAssociatedTokenAddress(
      memberStatusMint,
      employee.publicKey,
    );

    const nftAccount = await getAccount(connection, nftAta);

    // 1 NFT = amount 1
    expect(Number(nftAccount.amount)).to.eq(1);

    // Reward redemption
    const employeePayoutAta = await getOrCreateAssociatedTokenAccount(
      connection,
      admin.payer,
      payoutMint,
      employee.publicKey,
    );

    const beforeAmount = employeePayoutAta.amount;

    await program.methods
      .redeemRewardTokens(YEAR, REDEEM_AMOUNT)
      .accounts({
        employee: employee.publicKey,
        payoutMint,
      })
      .signers([employee])
      .rpc();

    const afterPayout = await getAccount(
      connection,
      employeePayoutAta.address,
    );

    const expectedDelta = bnToTokenAmount(
      REDEEM_AMOUNT,
      PAYOUT_MINT_DECIMALS,
      REWARD_PAYOUT_MULTIPLIER,
    );

    expect(afterPayout.amount).to.eq(beforeAmount + expectedDelta);
  });
});
