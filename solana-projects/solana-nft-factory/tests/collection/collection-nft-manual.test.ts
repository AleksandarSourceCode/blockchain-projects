import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftFactory } from "../../target/types/solana_nft_factory";
import { airdropSol } from "../helpers/airdrop";

describe("solana-nft-factory", () => {
  // Provider & program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;
  const program =
    anchor.workspace.solanaNftFactory as Program<SolanaNftFactory>;

  // Collection metadata
  const collectionMetadata = {
    name: "WoW Collection",
    symbol: "WOW",
    uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/collections/wow/wow-collection.json",
  };
  // Collection mint
  const collectionMint = anchor.web3.Keypair.generate();

  // Test signer
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();

  // NFT mints
  const mint1 = anchor.web3.Keypair.generate();
  const mint2 = anchor.web3.Keypair.generate();
  const mint3 = anchor.web3.Keypair.generate();
  const mint4 = anchor.web3.Keypair.generate();
  const mint5 = anchor.web3.Keypair.generate();

  // Test cases (table-driven)
  const nftTestCases = [
    {
      label: "WoW #1",
      metadata: {
        name: "WoW #1",
        symbol: "WOW1",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/collections/wow/wow-nft1.json",
      },
      user: user1,
      mint: mint1,
    },
    {
      label: "WoW #2",
      metadata: {
        name: "WoW #2",
        symbol: "WOW2",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/collections/wow/wow-nft2.json",
      },
      user: user1,
      mint: mint2,
    },
    {
      label: "WoW #3",
      metadata: {
        name: "WoW #3",
        symbol: "WOW3",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/collections/wow/wow-nft3.json",
      },
      user: user1,
      mint: mint3,
    },
    {
      label: "WoW #4",
      metadata: {
        name: "WoW #4",
        symbol: "WOW4",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/collections/wow/wow-nft4.json",
      },
      user: user1,
      mint: mint4,
    },
    {
      label: "WoW #5",
      metadata: {
        name: "WoW #5",
        symbol: "WOW5",
        uri: "https://raw.githubusercontent.com/AleksandarSourceCode/dev-assets/refs/heads/main/json/collections/wow/wow-nft5.json",
      },
      user: user1,
      mint: mint5,
    },
  ];

  // Fund all test wallets
  before("fund test wallets", async () => {
    for (const { user } of nftTestCases) {
      await airdropSol(connection, user.publicKey);
    }
  });

  it("creates NFT collection mint account", async () => {
      const tx = await program.methods
        .createCollection(collectionMetadata)
        .accounts({
          creator: payer.publicKey,
          collectionMint: collectionMint.publicKey,
        })
        .signers([collectionMint])
        .rpc();

      console.log('Created NFT collection tx:', tx);
  });

  it("mints multiple NFTs in a collection", async () => {
    for (const { label, metadata, user, mint } of nftTestCases) {
      const tx = await program.methods
        .mintCollectionNft(metadata)
        .accounts({
          creator: user.publicKey,
          nftMint: mint.publicKey,  // unique NFT mint
          collectionMint: collectionMint.publicKey,
        })
        .signers([user, mint])
        .rpc();

      console.log(`Minted NFT (${label}) tx:`, tx);
    }
  });

  it("verifies NFTs in the collection", async () => {
    for (const { label, mint } of nftTestCases) {
      const tx = await program.methods
        .verifyCollectionNft()
        .accounts({
          collectionAuthority: payer.publicKey,
          nftMint: mint.publicKey,
          collectionMint: collectionMint.publicKey,
        })
        .rpc();

       console.log(`Verifed NFT (${label}) tx:`, tx);
    }
  });
});