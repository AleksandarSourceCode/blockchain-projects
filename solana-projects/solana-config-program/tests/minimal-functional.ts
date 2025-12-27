import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaConfigProgram } from "../target/types/solana_config_program";
import { BN } from "bn.js";
import { expect } from "chai";

describe("solana-config-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const program = anchor.workspace
    .solanaConfigProgram as Program<SolanaConfigProgram>;

  const userWallet = new anchor.Wallet(new anchor.web3.Keypair());
  const USER_CONFIG_SEED = Buffer.from("user_config");
  const GLOBAL_CONFIG_SEED = Buffer.from("global_config");
  let userConfigPda: anchor.web3.PublicKey;
  let globalConfigPda: anchor.web3.PublicKey;

  const DEFAULT_DAILY_LIMIT = 100;

  before("Fund user wallet and derive PDAs", async () => {
    const signature = await program.provider.connection.requestAirdrop(
      userWallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    [userConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [USER_CONFIG_SEED, userWallet.publicKey.toBuffer()],
      program.programId
    );
    [globalConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [GLOBAL_CONFIG_SEED],
      program.programId
    );
  });

  it("should initialize global state", async () => {
    const feeBps = 250;
    await program.methods.initializeGlobal(feeBps).accounts({}).rpc();

    const globalAccount = await program.account.globalConfig.fetch(
      globalConfigPda
    );
    expect(globalAccount.feeBps).to.equal(feeBps);
  });

  it("should initialize user account", async () => {
    await program.methods
      .initializeUser()
      .accounts({ payer: userWallet.publicKey })
      .signers([userWallet.payer])
      .rpc();

    const userAccount = await program.account.userConfig.fetch(userConfigPda);
    expect(userAccount.dailyLimit.toNumber()).to.equal(DEFAULT_DAILY_LIMIT);
    expect(userAccount.enabled).to.equal(true);
  });

  it("should update user account by admin", async () => {
    const newDailyLimit = new BN(50);
    const enable = false;

    await program.methods
      .updateUserByAdmin(newDailyLimit, enable)
      .accounts({ userConfig: userConfigPda })
      .rpc();

    const userAccount = await program.account.userConfig.fetch(userConfigPda);
    expect(userAccount.dailyLimit.toNumber()).to.equal(
      newDailyLimit.toNumber()
    );
    expect(userAccount.enabled).to.equal(enable);
  });
});
