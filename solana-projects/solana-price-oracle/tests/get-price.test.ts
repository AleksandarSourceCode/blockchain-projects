import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaPriceOracle } from "../target/types/solana_price_oracle";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("solana-price-oracle / get_price (emit! event)", () => {
  // Anchor provider & program
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program =
    anchor.workspace.SolanaPriceOracle as Program<SolanaPriceOracle>;

  // Pyth feeds used in tests
  const FEEDS = [
    {
      name: "SOL/USD",
      feedId:
        "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
      priceUpdate: new PublicKey(
        "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
      ),
    },
    {
      name: "BTC/USD",
      feedId:
        "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      priceUpdate: new PublicKey(
        "4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo"
      ),
    },
    {
      name: "ETH/USD",
      feedId:
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      priceUpdate: new PublicKey(
        "42amVS4KgzR9rA28tkVYqVXjq9Qa8dcZQMbH5EYFX6XC"
      ),
    },
  ];

  // Faster commitment level for tests
  const commitment = "confirmed" as const;

  for (const feed of FEEDS) {
    it(`emits a PriceReported event for ${feed.name}`, async () => {
      // Invoke oracle instruction
      const signature = await program.methods
        .getPrice(feed.feedId)
        .accounts({
          priceUpdate: feed.priceUpdate,
        })
        .rpc();

      // Ensure transaction is confirmed
      const latestBlockhash =
        await connection.getLatestBlockhash(commitment);

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight:
            latestBlockhash.lastValidBlockHeight,
        },
        commitment
      );

      // Fetch transaction logs
      const tx = await connection.getTransaction(signature, {
        commitment,
        maxSupportedTransactionVersion: 0,
      });

      assert.ok(tx?.meta?.logMessages, "Missing transaction logs");

      const logs = tx.meta.logMessages!;

      // Extract Anchor `emit!` payload
      const dataLogs = logs.filter((l) =>
        l.startsWith("Program data:")
      );

      assert.lengthOf(
        dataLogs,
        1,
        "Expected exactly one Program data log"
      );

      // Decode emitted event via IDL
      const base64 = dataLogs[0].replace("Program data: ", "");
      const decoded = program.coder.events.decode(base64);

      assert.isOk(decoded, "Failed to decode event");

      // Validate event payload structure
      type PriceReportedData = {
        feedId: number[];
        price: anchor.BN;
        exponent: number;
        publishTime: anchor.BN;
      };

      const data = decoded!.data as PriceReportedData;

      const humanPrice =
        data.price.toNumber() *
        Math.pow(10, data.exponent);

      // Output for inspection
      console.log(`📈 ${feed.name}:`, humanPrice);

      const publishTs = new Date(
        data.publishTime.toNumber() * 1000
      );

      console.log(
        `🕒 ${feed.name} publish time (local):`,
        publishTs.toLocaleString()
      );

      // Basic sanity assertions
      assert.isNumber(humanPrice);
      assert.isAbove(
        data.publishTime.toNumber(),
        0,
        "Invalid publish_time"
      );
    });
  }
});
