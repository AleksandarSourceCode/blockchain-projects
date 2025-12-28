import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaEscrowProgram } from "../target/types/solana_escrow_program";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { createAccountsMintsAndTokenAccounts } from "@solana-developers/helpers";
import * as assert from "assert";

const TOKEN_PROGRAM = TOKEN_2022_PROGRAM_ID;

describe("minimal solana-escrow-program test", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const program = anchor.workspace
    .solanaEscrowProgram as Program<SolanaEscrowProgram>;
  const payer = provider.wallet.payer;

  let maker: Keypair;
  let taker: Keypair;
  let offerPDA: PublicKey;
  let vaultATA: PublicKey;
  let tokenAmountA = new anchor.BN(1_000_000);
  let tokenAmountB = new anchor.BN(10_000_000);
  let tokenMintA: Keypair;
  let tokenMintB: Keypair;
  let makerTokenAccountA: PublicKey;
  let makerTokenAccountB: PublicKey;
  let takerTokenAccountA: PublicKey;
  let takerTokenAccountB: PublicKey;
  const OFFER_SEED = "offer";
  const offerId = new anchor.BN(1);

  before(async () => {
    const usersMintsAndTokenAccounts =
      await createAccountsMintsAndTokenAccounts(
        [
          [1_000_001, 0], // Maker balances
          [0, 10_000_001], // Taker balances
        ],
        2 * LAMPORTS_PER_SOL,
        connection,
        payer
      );

    maker = usersMintsAndTokenAccounts.users[0];
    taker = usersMintsAndTokenAccounts.users[1];
    tokenMintA = usersMintsAndTokenAccounts.mints[0];
    tokenMintB = usersMintsAndTokenAccounts.mints[1];
    makerTokenAccountA = usersMintsAndTokenAccounts.tokenAccounts[0][0];
    makerTokenAccountB = usersMintsAndTokenAccounts.tokenAccounts[0][1];
    takerTokenAccountA = usersMintsAndTokenAccounts.tokenAccounts[1][0];
    takerTokenAccountB = usersMintsAndTokenAccounts.tokenAccounts[1][1];

    offerPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from(OFFER_SEED),
        maker.publicKey.toBuffer(),
        offerId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    vaultATA = getAssociatedTokenAddressSync(
      tokenMintA.publicKey,
      offerPDA,
      true,
      TOKEN_PROGRAM
    );
  });

  it("should create offer and lock tokens in vault", async () => {
    await program.methods
      .makeOffer(offerId, tokenAmountA, tokenAmountB)
      .accounts({
        maker: maker.publicKey,
        tokenMintA: tokenMintA.publicKey,
        tokenMintB: tokenMintB.publicKey,
        tokenProgram: TOKEN_PROGRAM,
      })
      .signers([maker])
      .rpc();

    const vaultAccount = await getAccount(
      connection,
      vaultATA,
      undefined,
      TOKEN_PROGRAM
    );
    const makerAccountA = await getAccount(
      connection,
      makerTokenAccountA,
      undefined,
      TOKEN_PROGRAM
    );

    assert.equal(
      vaultAccount.amount.toString(),
      tokenAmountA.toString(),
      "Vault should have locked offered tokens"
    );
    assert.equal(
      makerAccountA.amount.toString(),
      "1",
      "Maker token account A should be reduced by offered amount"
    );
  });

  it("should accept offer and transfer tokens correctly", async () => {
    await program.methods
      .takeOffer()
      .accounts({
        taker: taker.publicKey,
        /// @ts-ignore
        offer: offerPDA,
        tokenProgram: TOKEN_PROGRAM,
      })
      .signers([taker])
      .rpc();

    const makerAccountB = await getAccount(
      connection,
      makerTokenAccountB,
      undefined,
      TOKEN_PROGRAM
    );
    const takerAccountA = await getAccount(
      connection,
      takerTokenAccountA,
      undefined,
      TOKEN_PROGRAM
    );
    const takerAccountB = await getAccount(
      connection,
      takerTokenAccountB,
      undefined,
      TOKEN_PROGRAM
    );

    assert.equal(
      makerAccountB.amount.toString(),
      tokenAmountB.toString(),
      "Maker should receive expected tokens"
    );
    assert.equal(
      takerAccountA.amount.toString(),
      tokenAmountA.toString(),
      "Taker should receive offered tokens"
    );
    assert.equal(
      takerAccountB.amount.toString(),
      "1",
      "Taker token B account reduced by expected amount"
    );
  });
});
