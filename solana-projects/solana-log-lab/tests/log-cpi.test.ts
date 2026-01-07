import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaLogLab } from "../target/types/solana_log_lab";
import { confirmAndFetchTx } from "./helpers/confirm-and-fetch-tx";
import { assert } from "chai";

describe("log_cpi (CPI runtime logs)", () => {
  // Anchor provider & program setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program =
    anchor.workspace.SolanaLogLab as Program<SolanaLogLab>;

  it("emits CPI invoke/success logs", async () => {
    // Use an existing account to avoid rent issues (self-transfer)
    const from = provider.wallet.publicKey;
    const to = provider.wallet.publicKey;

    // Invoke instruction that performs a CPI to the System Program
    const signature = await program.methods
      .logCpi(new anchor.BN(1)) // transfer 1 lamport
      .accounts({
        from,
        to,
      })
      .rpc();

    // Confirm transaction and fetch transaction details
    const tx = await confirmAndFetchTx(connection, signature);

    assert.ok(tx?.meta?.logMessages, "Missing CPI logs");

    const logs = tx.meta.logMessages;

    // Debug output
    console.log("---- CPI LOGS ----");
    logs.forEach((l) => console.log(l));

    // Assert runtime-generated CPI logs
    assert.isTrue(
      logs.some((l) => l.includes("invoke")),
      "Missing CPI invoke log"
    );

    assert.isTrue(
      logs.some((l) => l.includes("success")),
      "Missing CPI success log"
    );

    // Assert program-emitted logs around the CPI
    assert.isTrue(
      logs.some((l) =>
        l.includes("CPI_LOG: before transfer")
      ),
      "Missing before-transfer log"
    );

    assert.isTrue(
      logs.some((l) =>
        l.includes("CPI_LOG: after transfer")
      ),
      "Missing after-transfer log"
    );
  });
});
