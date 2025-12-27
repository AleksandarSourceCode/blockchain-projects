import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaConfigProgram } from "../target/types/solana_config_program";
import { BN } from "bn.js";
import { after } from "mocha";
import { expect } from "chai";

const Status = {
  Active: "active",
  Frozen: "frozen",
} as const;

// Enable debug logging and store transaction/account snapshots
const DEBUG = true;
const txLog: { description: string; signature: string; accounts: any }[] = [];

describe("solana-config-program", () => {
  // Basic program setup for testing.
  // Initializes the Anchor provider, connection, and program instance.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const program = anchor.workspace
    .solanaConfigProgram as Program<SolanaConfigProgram>;
  // Configure the global Anchor provider.
  // Used as the default payer and signer when accounts/signers are not explicitly specified.
  anchor.setProvider(provider);
  // Default admin wallet provided by the Anchor test environment.
  // Used as the primary payer and authority for admin-level instructions.
  const adminWallet = provider.wallet as anchor.Wallet;
  // Simulated user wallet created from a new keypair.
  // Used to represent a non-admin user in tests.
  const userWallet = new anchor.Wallet(new anchor.web3.Keypair());
  // Hardcoded PDA seed for user config account.
  // This value must match the seed used in the Rust program.
  const USER_CONFIG_SEED = Buffer.from("user_config");
  let userConfigPda: anchor.web3.PublicKey;
  // Hardcoded PDA seed for global config account.
  // This value must match the seed global in the Rust program.
  const GLOBAL_CONFIG_SEED = Buffer.from("global_config");
  let globalConfigPda: anchor.web3.PublicKey;
  // Default daily limit for new user accounts
  const DEFAULT_DAILY_LIMIT = 100;

  before("Fund user wallet and derive PDA", async () => {
    // Fund the user wallet with SOL to cover transaction fees during tests.
    const signature = await program.provider.connection.requestAirdrop(
      userWallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    // Derive the PDA for the userConfig account using the hardcoded seed and the user's public key.
    // This PDA must match the seeds used in the Rust program to ensure correct account derivation.
    [userConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        USER_CONFIG_SEED, // USER_CONFIG_SEED
        userWallet.publicKey.toBuffer(), // payer.key().as_ref()
      ],
      program.programId
    );
    // Derive the PDA for the globalConfig account using the hardcoded global seed.
    // This PDA represents the global program state and must remain stable across deployments.
    [globalConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [GLOBAL_CONFIG_SEED],
      program.programId
    );

    // Display program ID and user balance for verification
    console.log("Program ID:", program.programId.toBase58());

    const balance = await program.provider.connection.getBalance(
      userWallet.publicKey
    );
    // Assert user has at least 1 SOL
    expect(balance / anchor.web3.LAMPORTS_PER_SOL).to.be.gte(1);
  });

  it("should initialize global state with the correct fee", async () => {
    const feeBps = 250;

    // Call instruction to initialize the global account
    const tx = await program.methods
      .initializeGlobal(feeBps)
      .accounts({})
      .rpc();

    // Fetch the globalConfig account state
    const globalAccount = await program.account.globalConfig.fetch(
      globalConfigPda
    );

    // Assert the fee is correctly set
    expect(globalAccount.feeBps).to.equal(feeBps);

    // Log
    logTx("initialize global", tx, { globalConfig: globalAccount });
  });
  it("should update global state with the new fee", async () => {
    const feeBps = 100;

    // Call instruction to update the global account
    const tx = await program.methods.updateGlobal(feeBps).accounts({}).rpc();

    // Fetch the globalConfig account state
    const globalAccount = await program.account.globalConfig.fetch(
      globalConfigPda
    );

    // Assert the fee is updated correctly
    expect(globalAccount.feeBps).to.equal(feeBps);

    // Log
    logTx("update global", tx, { globalConfig: globalAccount });
  });
  // it("should freeze the global state", async () => {
  //   // Call instruction to freeze the global state
  //   const tx = await program.methods.freezeGlobal().accounts({}).rpc();

  //   // Fetch the globalConfig account state
  //   const globalAccount = await program.account.globalConfig.fetch(
  //     globalConfigPda
  //   );
  //   // Convert enum object to string key for assertion
  //   const statusKey = Object.keys(globalAccount.status)[0];

  //   // Assert that the global state is frozen
  //   expect(statusKey).to.equal(Status.Frozen);

  //   // Log
  //   logTx("freeze global", tx, { globalConfig: globalAccount });
  // });
  it("should initialize the user account correctly", async () => {
    // Call instruction to initialize the user account
    const tx = await program.methods
      .initializeUser()
      .accounts({ payer: userWallet.publicKey })
      .signers([userWallet.payer])
      .rpc();

    // Fetch the userConfig account state
    const userAccount = await program.account.userConfig.fetch(userConfigPda);

    // Assert default values after initialization
    expect(userAccount.dailyLimit.toNumber()).to.equal(DEFAULT_DAILY_LIMIT);
    expect(userAccount.enabled).to.equal(true);

    // Log
    logTx("initialize user", tx, { userConfig: userAccount });
  });
  it("should update user account by admin", async () => {
    const newDailyLimit = new BN(50);
    const enable = false;

    // Call instruction to update the user account
    const tx = await program.methods
      .updateUserByAdmin(newDailyLimit, enable)
      .accounts({ userConfig: userConfigPda })
      .rpc();

    // Fetch the userConfig account state
    const userAccount = await program.account.userConfig.fetch(userConfigPda);

    // Assert that the update was applied correctly
    expect(userAccount.dailyLimit.toNumber()).to.equal(
      newDailyLimit.toNumber()
    );
    expect(userAccount.enabled).to.equal(enable);

    // Log
    logTx("update user by admin", tx, { userConfig: userAccount });
  });
  after("display transaction log and account states", () => {
    if (!DEBUG) return;

    txLog.forEach((entry, i) => {
      console.log(`\nTx #${i + 1} - ${entry.description}: ${entry.signature}`);
      displayAccounts("Account snapshot", entry.accounts);
    });
  });
});

/**
 * Helper function to log transactions and account states for debugging purposes.
 *
 * @param description - A short description of the instruction or test step.
 * @param signature - The transaction signature returned by the `.rpc()` call.
 * @param accounts - Snapshot of relevant account states after the transaction.
 *
 * Notes:
 * - Logs are added only if DEBUG flag is true, so normal test runs remain clean.
 * - Useful for tracking the sequence of transactions and verifying account states
 *   during development and debugging.
 */
function logTx(description: string, signature: string, accountSnapshot: any) {
  if (!DEBUG) return;
  txLog.push({
    description,
    signature,
    accounts: accountSnapshot,
  });
}

/**
 * Helper function to display account states in a readable format.
 * Only logs output if DEBUG is true.
 *
 * @param description - A title or description for the log section.
 * @param accounts - Object containing account snapshots to display.
 */
function displayAccounts(description: string, accounts: any) {
  if (!DEBUG) return;

  console.log(`\n=== ${description} ===`);
  for (const [name, account] of Object.entries(accounts)) {
    console.log(`${name}:`, account);
  }
}
