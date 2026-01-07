import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaEscrowProgram } from "../target/types/solana_escrow_program";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createAccountsMintsAndTokenAccounts } from "@solana-developers/helpers";

import { confirmTx, TokenAccountSnapshot, fetchTokenAccountsSnapshot } from "./helpers";

// Use the Token-2022 program by default. Can be switched to the classic SPL Token program if needed.
const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

// Debug flag to enable or disable logging of token account snapshots and other test information.
const DEBUG = true;

// Array to store token account snapshots collected during tests.
// Populated during before/after hooks or helper functions for inspection/debugging.
let tokenAccountsSnapshot: TokenAccountSnapshot[] = [];

describe("solana-escrow-program", () => {
  // Anchor provider for interacting with the local Solana cluster
  const provider = anchor.AnchorProvider.env();

  // Connection object to communicate with the Solana network
  const connection = provider.connection;

  // Configures Anchor to use this provider for all program RPC calls and account interactions
  anchor.setProvider(provider);

  // Program instance for the deployed Solana Escrow program
  const program = anchor.workspace
    .solanaEscrowProgram as Program<SolanaEscrowProgram>;

  // Payer Keypair for funding transactions and account creations
  const payer = provider.wallet.payer;

  // Seed string used for generating the Program Derived Address (PDA) for the offer
  const OFFER_SEED = "offer";

  // Unique identifier for the offer, represented as a BigNumber
  const offerId = new anchor.BN(1);

  // Keypairs for the participants
  let maker: Keypair; // The user creating the offer
  let taker: Keypair; // The user accepting the offer

  // Program Derived Address for the escrow offer account
  let offerPDA: PublicKey;

  // Associated Token Account (ATA) for the vault that will hold offered tokens
  let vaultATA: PublicKey;

  // Amounts for tokens involved in the escrow transaction
  let tokenAmountA = new anchor.BN(1_000_000); // Amount of Token A
  let tokenAmountB = new anchor.BN(10_000_000); // Amount of Token B

  // Keypairs representing the mints for Token A and Token B
  let tokeMintA: Keypair; // Mint for Token A
  let tokenMintB: Keypair; // Mint for Token B

  // Token accounts for maker and taker
  let makerTokenAccountA: PublicKey; // Holds Maker's Token A
  let makerTokenAccountB: PublicKey; // Holds Maker's Token B
  let takerTokenAccountA: PublicKey; // Holds Taker's Token A
  let takerTokenAccountB: PublicKey; // Holds Taker's Token B

  before("", async () => {
    // Create token mints and associated token accounts for Maker and Taker.
    // The 2D array defines initial balances for each user's token accounts:
    // [makerTokens, takerTokens] where each inner array contains balances for [Token A, Token B].
    // Also funds each user with 2 SOL for transaction fees.
    const usersMintsAndTokenAccounts =
      await createAccountsMintsAndTokenAccounts(
        [
          [1_000_001, 0], // Maker's initial balances: Token A and Token B
          [0, 10_000_001], // Taker's initial balances: Token A and Token B
        ],
        2 * LAMPORTS_PER_SOL,
        connection,
        payer
      );

    // Assign keypairs for Maker and Taker
    maker = usersMintsAndTokenAccounts.users[0];
    taker = usersMintsAndTokenAccounts.users[1];

    // Assign token mints
    tokeMintA = usersMintsAndTokenAccounts.mints[0]; // Token A mint
    tokenMintB = usersMintsAndTokenAccounts.mints[1]; // Token B mint

    // Assign token accounts for Maker and Taker
    makerTokenAccountA = usersMintsAndTokenAccounts.tokenAccounts[0][0];
    makerTokenAccountB = usersMintsAndTokenAccounts.tokenAccounts[0][1];
    takerTokenAccountA = usersMintsAndTokenAccounts.tokenAccounts[1][0];
    takerTokenAccountB = usersMintsAndTokenAccounts.tokenAccounts[1][1];

    // Derive the Program Derived Address (PDA) for the offer account
    offerPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from(OFFER_SEED),
        maker.publicKey.toBuffer(),
        offerId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    // Compute the vault Associated Token Account (ATA) for holding offered tokens
    vaultATA = getAssociatedTokenAddressSync(
      tokeMintA.publicKey,
      offerPDA,
      true,
      TOKEN_PROGRAM
    );

    // If DEBUG is enabled, fetch and display an initial snapshot of all relevant token accounts
    if (DEBUG) {
      const accountsForSnapshot = [
        { name: "makerOfferedTokenAccount", pubkey: makerTokenAccountA },
        { name: "makerExpectedTokenAccount", pubkey: makerTokenAccountB },
        { name: "takerExpectedTokenAccount", pubkey: takerTokenAccountA },
        { name: "takerOfferedTokenAccount", pubkey: takerTokenAccountB },
        { name: "vaultATA", pubkey: vaultATA },
      ];

      tokenAccountsSnapshot = await fetchTokenAccountsSnapshot(
        connection,
        accountsForSnapshot,
        TOKEN_PROGRAM
      );

      console.log("Initial token accounts snapshot:");
      console.table(tokenAccountsSnapshot);
    }
  });

  it("should create an offer and lock maker's tokens in the vault", async () => {
    // Execute the makeOffer instruction on-chain
    const tx = await program.methods
      .makeOffer(offerId, tokenAmountA, tokenAmountB)
      .accounts({
        maker: maker.publicKey, // Maker account initiating the offer
        tokenMintA: tokeMintA.publicKey, // Mint of the token being offered
        tokenMintB: tokenMintB.publicKey, // Mint of the token expected in return
        tokenProgram: TOKEN_PROGRAM, // Token program
      })
      .signers([maker]) // Signer for the transaction
      .rpc();

    await confirmTx(connection, tx);

    // Debug log: display the transaction signature
    if (DEBUG) {
      console.log("make_offer transaction signature:", tx);
    }
  });
  it("should accept an existing offer and transfer tokens accordingly", async () => {
    // Execute the takeOffer instruction on-chain
    const tx = await program.methods
      .takeOffer()
      .accounts({
        taker: taker.publicKey, // Taker account accepting the offer
        /// @ts-ignore
        offer: offerPDA, // PDA of the existing offer account
        tokenProgram: TOKEN_PROGRAM, // Token program
      })
      .signers([taker]) // Signer for the taker transaction
      .rpc();
    
    // Ensure the transaction is fully confirmed before reading on-chain state
    await confirmTx(connection, tx);

    // Optional debug log: display the transaction signature
    if (DEBUG) {
      console.log("take_offer transaction signature:", tx);
    }
  });

  afterEach("afterEach", async () => {
    // Only fetch and display token account snapshots if DEBUG mode is enabled
    if (DEBUG) {
      // Define all relevant accounts to snapshot
      const accountsForSnapshot = [
        { name: "makerOfferedTokenAccount", pubkey: makerTokenAccountA },
        { name: "makerExpectedTokenAccount", pubkey: makerTokenAccountB },
        { name: "takerExpectedTokenAccount", pubkey: takerTokenAccountA },
        { name: "takerOfferedTokenAccount", pubkey: takerTokenAccountB },
        { name: "vaultATA", pubkey: vaultATA },
      ];

      // Fetch current balances for each account
      tokenAccountsSnapshot = await fetchTokenAccountsSnapshot(
        connection,
        accountsForSnapshot,
        TOKEN_PROGRAM
      );

      // Display the snapshot in a table for easier visualization during debugging
      console.table(tokenAccountsSnapshot);
    }
  });
});


