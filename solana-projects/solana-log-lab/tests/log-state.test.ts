import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaLogLab } from "../target/types/solana_log_lab";
import { confirmAndFetchTx } from "./helpers/confirm-and-fetch-tx";
import { assert } from "chai";

describe("log_state (persistent on-chain logs)", () => {
  // Anchor provider & program setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program =
    anchor.workspace.SolanaLogLab as Program<SolanaLogLab>;

  it("writes and reads a persistent log account", async () => {
    // Prepare test accounts and input data
    const user = provider.wallet.publicKey;
    const logAccount = anchor.web3.Keypair.generate();

    const kind = 1;
    const message = "Persistent log entry";

    // Invoke instruction that initializes and writes the log account
    const signature = await program.methods
      .logState(kind, message)
      .accounts({
        user,
        log: logAccount.publicKey,
      })
      .signers([logAccount])
      .rpc();

    // Confirm transaction and fetch transaction details
    const tx = await confirmAndFetchTx(connection, signature);

    // Fetch the persisted log account from chain
    const storedLog =
      await program.account.persistentLog.fetch(
        logAccount.publicKey
      );

    // Debug output
    console.log("---- STORED LOG ----");
    console.log(storedLog);

    // Assert stored log fields
    assert.equal(storedLog.kind, kind);
    assert.ok(
      storedLog.user.equals(user),
      "User pubkey mismatch"
    );
    assert.equal(storedLog.message, message);

    // Timestamp sanity check
    assert.isTrue(
      storedLog.timestamp.toNumber() > 0,
      "Invalid timestamp"
    );
  });
});
