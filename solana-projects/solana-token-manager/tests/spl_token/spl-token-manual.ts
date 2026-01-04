import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTokenManager } from "../../target/types/solana_token_manager";
import { BN } from "bn.js";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("spl / manual", () => {
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

  let metadataPda: PublicKey;

  before("setup accounts", async () => {
    // Fund mintRecipient wallet
    const sig = await connection.requestAirdrop(
      mintRecipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );

    const blockhash  = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, ...blockhash }, "confirmed");

    // Derive Metaplex metadata PDA
    [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
  });

  it("create SPL token with metadata", async () => {
    const tx = await program.methods
      .createSplToken(tokenDecimals, metadataArgs)
      .accounts({
        creator: payer.publicKey,
        tokenMint: mint.publicKey,
        ///@ts-ignore
        tokenMetadata: metadataPda,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      })
      .signers([mint])
      .rpc();

    console.log("create_spl_token tx:", tx);
  });

  it("mint SPL tokens to recipient", async () => {
    // amount is human-readable (scaled internally by decimals)
    const amount = new BN(500);

    const tx = await program.methods
      .mintTokenUniversal(amount)
      .accounts({
        minter: payer.publicKey,
        recipient: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("mint_token tx:", tx);
  });

  it("transfer SPL tokens", async () => {
    const amount = new BN(100);

    const tx = await program.methods
      .transferTokenUniversal(amount)
      .accounts({
        sender: mintRecipient.publicKey,
        recipient: transferRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    console.log("transfer_token tx:", tx);
  });

  it("burn SPL tokens", async () => {
    const burnAmount = new BN(50);

    const tx = await program.methods
      .burnTokenUniversal(burnAmount)
      .accounts({
        owner: mintRecipient.publicKey,
        tokenMint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mintRecipient])
      .rpc();

    console.log("burn_token tx:", tx);
  });

  it("update SPL metadata field (name)", async () => {
    metadataArgs.name = "Crazy Dog";

    const tx = await program.methods
      .updateMetadataSplToken(metadataArgs)
      .accounts({
        authority: payer.publicKey,
        tokenMint: mint.publicKey,
        ///@ts-ignore
        tokenMetadata: metadataPda,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true });

    console.log("update_metadata tx:", tx);
  });

  it("revoke SPL mint authority", async () => {
    const authorityType = { mint: {} };

    const tx = await program.methods
      .setMintAuthoritySplToken(authorityType, null)
      .accounts({
        currentAuthority: payer.publicKey,
        tokenMint: mint.publicKey,
      })
      .rpc();

    console.log("set_mint_authority tx:", tx);
  });
});
