import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

import { getTestContext } from "../../context/test-context";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";
import { deriveGlobalConfigPda } from "../../helpers/pda/derive-pdas";

describe("Global — update global config", () => {
  const { program, connection, admin } = getTestContext();

  let payoutMint: PublicKey;
  const newAdmin = Keypair.generate();
  const attackerAdmin = Keypair.generate();
  const pause = true;
  const newPayoutMint = Keypair.generate();

  before(async () => {
    payoutMint = await setupGlobalIfNeeded(program, connection, admin);
  });

  it("updates global config fields", async () => {
    await program.methods
      .updateGlobal(newAdmin.publicKey, null, null)
      .accounts({})
      .rpc();

    let [globalPda] = deriveGlobalConfigPda(program.programId);
    let global = await program.account.globalConfig.fetch(globalPda);

    expect(global.admin).to.eql(newAdmin.publicKey);

    await program.methods
      .updateGlobal(null, pause, null)
      .accounts({ admin: newAdmin.publicKey })
      .signers([newAdmin])
      .rpc();

    global = await program.account.globalConfig.fetch(globalPda);
    expect(global.paused).to.eql(pause);

    await program.methods
      .updateGlobal(null, null, newPayoutMint.publicKey)
      .accounts({ admin: newAdmin.publicKey })
      .signers([newAdmin])
      .rpc();

    global = await program.account.globalConfig.fetch(globalPda);
    expect(global.payoutMint).to.eql(newPayoutMint.publicKey);
  });

  it("rejects unauthorized global config updates", async () => {
    await expect(
      program.methods
        .updateGlobal(attackerAdmin.publicKey, null, null)
        .accounts({ admin: attackerAdmin })
        .signers([attackerAdmin])
        .rpc(),
    ).to.be.rejected;
  });

  after("restores original state", async () => {
    // Restore original global configuration
    await program.methods
      .updateGlobal(admin.publicKey, !pause, payoutMint)
      .accounts({ admin: newAdmin.publicKey })
      .signers([newAdmin])
      .rpc();
  });
});
