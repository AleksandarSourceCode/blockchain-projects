import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { SolanaWormholeVerifier } from "../../target/types/solana_wormhole_verifier";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function printVerifiedMessage(
  program: Program<SolanaWormholeVerifier>,
  verifiedMessagePda: PublicKey,
  label?: string,
) {
  const header = `--- VerifiedMessage DEBUG ${label ? `[${label}]` : ""} ---`;
  console.log(`\n${header}`);
  console.log(`PDA: ${verifiedMessagePda.toBase58()}`);

  try {
    const account = await program.account.verifiedMessage.fetch(
      verifiedMessagePda,
    );

    const formattedAccount = {
      EmitterChain: account.emitterChain,
      EmitterAddress: Buffer.from(account.emitterAddress).toString("hex"),
      Sequence: account.sequence.toString(),
      PayloadLen: `${account.payload.length} bytes`,
      PayloadHash:
        Buffer.from(account.payloadHash).toString("hex").slice(0, 16) + "...",
      Slot: account.verifiedAtSlot.toString(),
      Time: new Date(Number(account.verifiedAtUnixTs) * 1000).toISOString(),
    };

    const tableData = Object.entries(formattedAccount).map(([key, value]) => ({
      Property: key,
      Value: value,
    }));
    console.table(tableData);
  } catch (e) {
    console.error(
      `❌ Failed to fetch VerifiedMessage at ${verifiedMessagePda.toBase58()}`,
    );
    console.error(e);
  }

  console.log("-".repeat(header.length) + "\n");
}
