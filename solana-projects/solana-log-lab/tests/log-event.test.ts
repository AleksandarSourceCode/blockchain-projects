import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaLogLab } from "../target/types/solana_log_lab";
import { Commitment } from "@solana/web3.js";
import { confirmAndFetchTx } from "./helpers/confirm-and-fetch-tx";
import { assert } from "chai";

describe("log_event (emit! structured logs)", () => {
  // Anchor provider & program setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program =
    anchor.workspace.SolanaLogLab as Program<SolanaLogLab>;

  const TX_COMMITMENT: Commitment = "confirmed";

  it("emits and decodes an Anchor event from Program data logs", async () => {
    // Invoke instruction that emits a structured event
    const signature = await program.methods.logEvent().rpc();

    // Confirm transaction and fetch transaction details
    const tx = await confirmAndFetchTx(connection, signature);

    assert.ok(tx?.meta?.logMessages, "Missing transaction logs");

    const logs = tx.meta.logMessages;

    // Debug output
    console.log("---- RAW LOGS ----");
    logs.forEach((l) => console.log(l));

    // Extract Anchor `Program data` log entries
    const dataLogs = logs.filter((l) =>
      l.startsWith("Program data:")
    );

    assert.isNotEmpty(
      dataLogs,
      "No Program data logs found"
    );

    // Decode events using the program IDL
    const decodedEvents = dataLogs
      .map((l) => {
        const base64 = l.replace("Program data: ", "");
        return program.coder.events.decode(base64);
      })
      .filter(Boolean);

    // Expect exactly one emitted event
    assert.lengthOf(
      decodedEvents,
      1,
      "Expected exactly one decoded event"
    );

    // Use the decoded event payload directly
    const event = decodedEvents[0]!;

    // Narrow the event data type for assertions
    type DemoEventData = {
      level: number;
      code: number;
      message: string;
    };

    const data = event.data as DemoEventData;

    // Assert structured event payload
    assert.equal(data.level, 1);
    assert.equal(data.code, 100);
    assert.equal(
      data.message,
      "This is a structured event log"
    );
  });
});
