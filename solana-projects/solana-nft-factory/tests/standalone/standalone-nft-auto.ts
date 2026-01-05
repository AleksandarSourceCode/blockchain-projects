import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftFactory } from "../../target/types/solana_nft_factory";
import {
  getMint,
  getAssociatedTokenAddressSync,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PROGRAM_ID as METADATA_PROGRAM_ID,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { assert } from "chai";
import { airdropSol } from "../helpers/airdrop";

describe("solana-nft-factory", () => {
  // Provider & program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program =
    anchor.workspace.solanaNftFactory as Program<SolanaNftFactory>;

  // Test signers
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();
  const user3 = anchor.web3.Keypair.generate();

  // NFT mint keypairs
  const mint1 = anchor.web3.Keypair.generate();
  const mint2 = anchor.web3.Keypair.generate();
  const mint3 = anchor.web3.Keypair.generate();

  // Test cases (table-driven)
  const nftTestCases = [
    {
      label: "Crazy Cat",
      metadata: {
        name: "Crazy Cat",
        symbol: "CAT",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/nfts/cat/crazy-cat.json",
      },
      user: user1,
      mint: mint1,
    },
    {
      label: "Scared Cat",
      metadata: {
        name: "Scared Cat",
        symbol: "CAT",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/nfts/cat/scared-cat.json",
      },
      user: user2,
      mint: mint2,
    },
    {
      label: "Angry Cat",
      metadata: {
        name: "Angry Cat",
        symbol: "CAT",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/nfts/cat/angry-cat.json",
      },
      user: user3,
      mint: mint3,
    },
  ];

  // Fund all test wallets
  before("fund test wallets", async () => {
    for (const { user } of nftTestCases) {
      await airdropSol(connection, user.publicKey);
    }
  });

  it("mints standalone NFTs and validates on-chain state", async () => {
    for (const { label, metadata, user, mint } of nftTestCases) {
      // Mint standalone NFT
      await program.methods
        .mintStandaloneNft(metadata)
        .accounts({
          creator: user.publicKey,
          mintAccount: mint.publicKey,
        })
        .signers([user, mint])
        .rpc();

      // Fetch and validate mint
      const mintInfo = await waitForMint(connection, mint.publicKey);

      assert.equal(mintInfo.decimals, 0, `${label}: decimals`);
      assert.equal(Number(mintInfo.supply), 1, `${label}: supply`);
      assert.ok(mintInfo.mintAuthority, `${label}: mint authority`);

      // Derive and fetch owner ATA
      const ata = getAssociatedTokenAddressSync(
        mint.publicKey,
        user.publicKey
      );

      const ataAccount = await getAccount(connection, ata, "confirmed");

      // Validate NFT ownership
      assert.equal(
        ataAccount.amount,
        BigInt(1),
        `${label}: ownership`
      );

      // Derive metadata PDA
      const [metadataPda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
          ],
          METADATA_PROGRAM_ID
        );

      // Fetch and validate metadata account
      const metadataAccount = await Metadata.fromAccountAddress(
        connection,
        metadataPda
      );

      assert.equal(
        cleanMetaplexString(metadataAccount.data.name),
        metadata.name,
        `${label}: name`
      );

      assert.equal(
        cleanMetaplexString(metadataAccount.data.symbol),
        metadata.symbol,
        `${label}: symbol`
      );

      assert.equal(
        cleanMetaplexString(metadataAccount.data.uri),
        metadata.uri,
        `${label}: uri`
      );
    }
  });
});

// Wait until mint account is available on-chain
async function waitForMint(
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey,
  retries = 10
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await getMint(
        connection,
        mint,
        "confirmed",
        TOKEN_PROGRAM_ID
      );
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error("Mint account not initialized");
}

// Remove null-byte padding from Metaplex strings
function cleanMetaplexString(value: string): string {
  return value.replace(/\0/g, "");
}
