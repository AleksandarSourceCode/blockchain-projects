import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { getAccount, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import { getTestContext } from "../../../context/test-context";
import { airdropSol } from "../../../helpers/setup/airdrop";
import { GOLD_COIN_METADATA } from "../../../fixtures/metadata";
import { deriveSpecialTokenMintPda } from "../../../helpers/pda/derive-pdas";
import { setupGlobalIfNeeded } from "../../../helpers/setup/setup-global";
import { bnToTokenAmount } from "../../../helpers/execution/token-amount-conversion";
import { PAYOUT_MINT_DECIMALS, SPECIAL_PAYOUT_MULTIPLIER } from "../../../constants/mints";

describe("Special tokens — redeem", () => {
  const { program, connection, admin } = getTestContext();

  const recipient = Keypair.generate();
  let payoutMint: PublicKey;
  const MINT_AMOUNT = new BN(5000);
  const REDEEM_AMOUNT = new BN(50);

  before(async () => {
    await airdropSol(connection, recipient.publicKey, 2);
    payoutMint = await setupGlobalIfNeeded(program, connection, admin);

    await program.methods
      .initSpecialTokenMint(GOLD_COIN_METADATA)
      .accounts({})
      .rpc();
  });

  it("redeems special tokens and transfers treasury payout to recipient", async () => {
    // Special token minting
    await program.methods
      .mintSpecialTokens(MINT_AMOUNT)
      .accounts({ recipient: recipient.publicKey })
      .rpc();

    // Reward redemption
    const recipientPayoutAta = await getOrCreateAssociatedTokenAccount(
      connection,
      admin.payer,
      payoutMint,
      recipient.publicKey,
    );

    const beforePayoutAmount = recipientPayoutAta.amount;

    await program.methods
      .redeemSpecialTokens(REDEEM_AMOUNT)
      .accounts({
        recipient: recipient.publicKey,
        admin: admin.publicKey,
        payoutMint,
      })
      .signers([recipient])
      .rpc();

    // Special token burn verification
    const [specialTokenMintPda] = deriveSpecialTokenMintPda(
      program.programId,
      admin.publicKey,
    );

    const recipientSpecialAta = await getAssociatedTokenAddress(
      specialTokenMintPda,
      recipient.publicKey,
    );

    const recipientSpecialAccount = await getAccount(
      connection,
      recipientSpecialAta,
    );

    expect(recipientSpecialAccount.amount).to.eq(
      BigInt(MINT_AMOUNT.sub(REDEEM_AMOUNT).toString()),
    );

    // Treasury payout verification
    const afterPayoutAccount = await getAccount(
      connection,
      recipientPayoutAta.address,
    );

    const expectedDelta = bnToTokenAmount(
      REDEEM_AMOUNT,
      PAYOUT_MINT_DECIMALS,
      SPECIAL_PAYOUT_MULTIPLIER,
    );

    expect(afterPayoutAccount.amount).to.eq(
      beforePayoutAmount + expectedDelta,
    );
  });

  it("rejects redeeming more tokens than available", async () => {
    await program.methods
      .mintSpecialTokens(MINT_AMOUNT)
      .accounts({ recipient: recipient.publicKey })
      .rpc();

    const excessiveAmount = MINT_AMOUNT.add(new BN(1));

    await expect(
      program.methods
        .redeemSpecialTokens(excessiveAmount)
        .accounts({
          recipient: recipient.publicKey,
          admin: admin.publicKey,
          payoutMint,
        })
        .signers([recipient])
        .rpc(),
    ).to.be.rejected;
  });
  it("rejects minting special tokens by an unauthorized admin", async () => {
    const attackerAdmin = Keypair.generate();

    await expect(
      program.methods
        .mintSpecialTokens(MINT_AMOUNT)
        .accounts({ recipient: recipient.publicKey })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;
  });
});
