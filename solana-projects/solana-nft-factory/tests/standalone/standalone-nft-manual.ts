import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftFactory } from "../../target/types/solana_nft_factory";

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

  // NFT mints
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

  it("mints multiple standalone NFTs", async () => {
    for (const { label, metadata, user, mint } of nftTestCases) {
      const tx = await program.methods
        .mintStandaloneNft(metadata)
        .accounts({
          creator: user.publicKey,
          mintAccount: mint.publicKey,
        })
        .signers([user, mint])
        .rpc();

      console.log(`Minted NFT (${label}) tx:`, tx);
    }
  });
});