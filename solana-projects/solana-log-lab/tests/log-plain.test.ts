import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaLogLab } from "../target/types/solana_log_lab";
import { confirmAndFetchTx } from "./helpers/confirm-and-fetch-tx"
import { assert } from "chai";

describe("log_plain (msg! logs)", () => {
  // Anchor provider & program setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program =
    anchor.workspace.SolanaLogLab as Program<SolanaLogLab>;

  it("emits plain text logs using msg!", async () => {
    // Invoke instruction
    const signature = await program.methods.logPlain().rpc();

    // Confirm transaction and fetch transaction details
    const tx = await confirmAndFetchTx(connection, signature);

    // Basic sanity checks
    assert.ok(tx, "Transaction not found");
    assert.ok(tx.meta, "Transaction meta missing");
    assert.ok(tx.meta.logMessages, "Transaction logs missing");

    const logs = tx.meta.logMessages;

    // Debug output
    console.log("---- RUNTIME LOGS ----");
    logs.forEach((l) => console.log(l));

    // Assert expected plain text logs
    assert.isTrue(
      logs.some((l) => l.includes("PLAIN_LOG: start")),
      "Missing PLAIN_LOG: start"
    );

    assert.isTrue(
      logs.some((l) => l.includes("PLAIN_LOG: simple message")),
      "Missing simple message log"
    );

    assert.isTrue(
      logs.some((l) => l.includes("PLAIN_LOG: number = 42")),
      "Missing number log"
    );

    assert.isTrue(
      logs.some((l) => l.includes("PLAIN_LOG: end")),
      "Missing PLAIN_LOG: end"
    );
  });
});
