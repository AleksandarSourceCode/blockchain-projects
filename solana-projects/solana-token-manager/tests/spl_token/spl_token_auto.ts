import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTokenManager } from "../../target/types/solana_token_manager";
import { BN } from "bn.js";
import { expect } from "chai";

import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
  getMint,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("spl / auto / full flow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace
    .SolanaTokenManager as Program<SolanaTokenManager>;

  const tokenDecimals = 6;
  const metadataArgs = {
    name: "Happy Dog Token",
    symbol: "HAPPYDOG",
    uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/happy-dog.json",
  };

  const mint = anchor.web3.Keypair.generate();
  const mintRecipient = anchor.web3.Keypair.generate();
  const transferRecipient = anchor.web3.Keypair.generate();

  let metadataPda: PublicKey;
  let recipientAta: PublicKey;
  let transferRecipientAta: PublicKey;

  before("setup", async () => {
    await connection.requestAirdrop(
      mintRecipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.requestAirdrop(
      transferRecipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );

    [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    recipientAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      mintRecipient.publicKey
    );

    transferRecipientAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      transferRecipient.publicKey
    );
  });

  it("creates SPL token with metadata", async () => {
    await program.methods
      .createSplToken(tokenDecimals, metadataArgs)
      .accounts({
        creator: payer.publicKey,
        tokenMint: mint.publicKey,
        /// @ts-ignore
        tokenMetadata: metadataPda,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      })
      .signers([mint])
      .rpc();

    const mintInfo = await getMint(connection, mint.publicKey);
    expect(mintInfo.decimals).to.equal(tokenDecimals);
    expect(mintInfo.mintAuthority?.toBase58()).to.equal(
      payer.publicKey.toBase58()
    );
  });

  it("mints tokens to recipient", async () => {
    const amount = new BN(500);

    await program.methods
      .mintTokenUniversal(amount)
      .accounts({
        minter: payer.publicKey,
        recipient: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const account = await getAccount(connection, recipientAta);
    const expected =
      BigInt(amount.toNumber()) *
      BigInt(Math.pow(10, tokenDecimals));

    expect(account.amount).to.equal(expected);
  });

  it("transfers tokens to another recipient", async () => {
    const amount = new BN(100);

    await program.methods
      .transferTokenUniversal(amount)
      .accounts({
        sender: mintRecipient.publicKey,
        recipient: transferRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    const account = await getAccount(connection, transferRecipientAta);
    const expected =
      BigInt(amount.toNumber()) *
      BigInt(Math.pow(10, tokenDecimals));

    expect(account.amount).to.equal(expected);
  });

  it("burns tokens from original recipient", async () => {
    const burnAmount = new BN(50);

    await program.methods
      .burnTokenUniversal(burnAmount)
      .accounts({
        owner: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    const account = await getAccount(connection, recipientAta);
    const expected =
      BigInt(500 - 100 - 50) *
      BigInt(Math.pow(10, tokenDecimals));

    expect(account.amount).to.equal(expected);
  });

  it("updates metadata name", async () => {
    const newName = "Crazy Dog";

    await program.methods
      .updateMetadataSplToken({
        ...metadataArgs,
        name: newName,
      })
      .accounts({
        authority: payer.publicKey,
        tokenMint: mint.publicKey,
        /// @ts-ignore
        tokenMetadata: metadataPda,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      })
      .rpc();

    const accountInfo = await connection.getAccountInfo(metadataPda);
    expect(accountInfo).to.not.be.null;
  });

  it("revokes mint authority", async () => {
    const authorityType = { mint: {} };

    await program.methods
      .setMintAuthoritySplToken(authorityType, null)
      .accounts({
        currentAuthority: payer.publicKey,
        tokenMint: mint.publicKey,
      })
      .rpc();

    const mintInfo = await getMint(connection, mint.publicKey);
    expect(mintInfo.mintAuthority).to.equal(null);
  });
});
