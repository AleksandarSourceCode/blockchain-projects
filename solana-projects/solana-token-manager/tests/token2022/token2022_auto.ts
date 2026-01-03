import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTokenManager } from "../../target/types/solana_token_manager";
import { BN } from "bn.js";
import { expect } from "chai";

import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
  getMint,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

describe("token2022 / auto / full flow", () => {
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
    uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/dog/happy-dog.json",
  };

  const mint = anchor.web3.Keypair.generate();
  const mintRecipient = anchor.web3.Keypair.generate();
  const transferRecipient = anchor.web3.Keypair.generate();

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

    recipientAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      mintRecipient.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    transferRecipientAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      transferRecipient.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
  });

  it("creates Token-2022 mint with embedded metadata", async () => {
    await program.methods
      .createToken2022(tokenDecimals, metadataArgs)
      .accounts({
        creator: payer.publicKey,
        tokenMint: mint.publicKey,
      })
      .signers([mint])
      .rpc();

    const mintInfo = await getMint(
      connection,
      mint.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    expect(mintInfo.decimals).to.equal(tokenDecimals);
    expect(mintInfo.mintAuthority?.toBase58()).to.equal(
      payer.publicKey.toBase58()
    );
  });

  it("mints Token-2022 tokens", async () => {
    const amount = new BN(500); // human-readable

    await program.methods
      .mintTokenUniversal(amount)
      .accounts({
        minter: payer.publicKey,
        recipient: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    const account = await getAccount(
      connection,
      recipientAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const expected =
      BigInt(amount.toNumber()) *
      BigInt(Math.pow(10, tokenDecimals));

    expect(account.amount).to.equal(expected);
  });

  it("transfers Token-2022 tokens", async () => {
    const amount = new BN(100);

    await program.methods
      .transferTokenUniversal(amount)
      .accounts({
        sender: mintRecipient.publicKey,
        recipient: transferRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    const account = await getAccount(
      connection,
      transferRecipientAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const expected =
      BigInt(amount.toNumber()) *
      BigInt(Math.pow(10, tokenDecimals));

    expect(account.amount).to.equal(expected);
  });

  it("burns Token-2022 tokens", async () => {
    const burnAmount = new BN(50);

    await program.methods
      .burnTokenUniversal(burnAmount)
      .accounts({
        owner: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    const account = await getAccount(
      connection,
      recipientAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const expected =
      BigInt(500 - 100 - 50) *
      BigInt(Math.pow(10, tokenDecimals));

    expect(account.amount).to.equal(expected);
  });

  it("updates Token-2022 metadata field", async () => {
    await program.methods
      .updateMetadataToken2022({
        field: { name: {} },
        value: "Crazy Dog",
      })
      .accounts({
        authority: payer.publicKey,
        mintAccount: mint.publicKey,
      })
      .rpc();

    // Minimal assertion: mint account still exists
    const mintInfo = await connection.getAccountInfo(mint.publicKey);
    expect(mintInfo).to.not.be.null;
  });

  it("revokes Token-2022 mint authority", async () => {
    const authorityType = { mint: {} };

    await program.methods
      .setMintAuthorityToken2022(authorityType, null)
      .accounts({
        currentAuthority: payer.publicKey,
        tokenMint: mint.publicKey,
      })
      .rpc();

    const mintInfo = await getMint(
      connection,
      mint.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    expect(mintInfo.mintAuthority).to.equal(null);
  });
});
