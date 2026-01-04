import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTokenManager } from "../../target/types/solana_token_manager";
import { BN } from "bn.js";

import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

describe("token2022 / manual", () => {
  // Provider & program setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace
    .SolanaTokenManager as Program<SolanaTokenManager>;

  // Test data
  const tokenDecimals = 6;
  const metadataArgs = {
    name: "Happy Dog Token",
    symbol: "HAPPYDOG",
    uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/tokens/dog/happy-dog.json",
  };

  const mint = anchor.web3.Keypair.generate();
  const mintRecipient = anchor.web3.Keypair.generate();
  const transferRecipient = anchor.web3.Keypair.generate();

  before("setup accounts", async () => {
    const sig = await connection.requestAirdrop(
      mintRecipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );

    const blockhash  = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, ...blockhash }, "confirmed");
  });

  it("create Token-2022 mint with embedded metadata", async () => {
    const tx = await program.methods
      .createToken2022(tokenDecimals, metadataArgs)
      .accounts({
        creator: payer.publicKey,
        tokenMint: mint.publicKey,
      })
      .signers([mint])
      .rpc();

    console.log("create_token2022 tx:", tx);
  });

  it("mint Token-2022 tokens", async () => {
    const amount = new BN(500); // human-readable

    const tx = await program.methods
      .mintTokenUniversal(amount)
      .accounts({
        minter: payer.publicKey,
        recipient: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    console.log("mint_token tx:", tx);
  });

  it("transfer Token-2022 tokens", async () => {
    const amount = new BN(100);

    const tx = await program.methods
      .transferTokenUniversal(amount)
      .accounts({
        sender: mintRecipient.publicKey,
        recipient: transferRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    console.log("transfer_token tx:", tx);
  });

  it("burn Token-2022 tokens", async () => {
    const burnAmount = new BN(50);

    const tx = await program.methods
      .burnTokenUniversal(burnAmount)
      .accounts({
        owner: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    console.log("burn_token tx:", tx);
  });

  it("update Token-2022 metadata field (name)", async () => {
    const tx = await program.methods
      .updateMetadataToken2022({
        field: { name: {} },
        value: "Crazy Dog",
      })
      .accounts({
        authority: payer.publicKey,
        mintAccount: mint.publicKey,
      })
      .rpc({ skipPreflight: true });

    console.log("update_metadata tx:", tx);
  });

  it("revoke Token-2022 mint authority", async () => {
    const authorityType = { mint: {} };

    const tx = await program.methods
      .setMintAuthorityToken2022(authorityType, null)
      .accounts({
        currentAuthority: payer.publicKey,
        tokenMint: mint.publicKey,
      })
      .rpc();

    console.log("set_mint_authority tx:", tx);
  });

  // Optional example: unified authority instruction with dummy ATA
  /*
  it("set_authority_token2022 (dummy account example)", async () => {
    const dummyAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      mintRecipient.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const authorityType = { mint: {} };

    const tx = await program.methods
      .setAuthorityToken2022(authorityType, null)
      .accounts({
        tokenMint: mint.publicKey,
        tokenAccount: dummyAta,
        currentAuthority: payer.publicKey,
      })
      .rpc();

    console.log("set_authority_token2022 tx:", tx);
  });
  */
});
