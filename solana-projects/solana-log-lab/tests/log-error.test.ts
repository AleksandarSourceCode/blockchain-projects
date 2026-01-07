import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaLogLab } from "../target/types/solana_log_lab";
import { assert } from "chai";

describe("log_error (require! error logs)", () => {
  // Anchor provider & program setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program =
    anchor.workspace.SolanaLogLab as Program<SolanaLogLab>;

  it("emits an error log via require!", async () => {
    try {
      // Invoke instruction (expected to fail)
      await program.methods.logError().rpc();

      // If execution reaches here, the test must fail
      assert.fail("Expected transaction to fail");
    } catch (err: any) {
      // Error must be thrown by the runtime
      assert.ok(err, "Error was not thrown");

      // Extract runtime logs from the Anchor error
      const logs: string[] | undefined = err.logs;
      assert.ok(logs, "Error logs missing");

      // Debug output
      console.log("---- ERROR LOGS ----");
      logs.forEach((l) => console.log(l));

      // Assert expected error message
      assert.isTrue(
        logs.some((l) =>
          l.includes("ERROR_LOG: forced error for demo")
        ),
        "Expected error log not found"
      );
    }
  });
});
