import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { SolanaWormholeVerifier } from "../../target/types/solana_wormhole_verifier";
import { listVaaFiles } from "../helpers/vaa/list";
import { loadVaaFromFile } from "../helpers/vaa/load";
import { parseVaa, parseVaaBody } from "../helpers/vaa/parse";
import { toPdaMessageSeeds } from "../helpers/pda";
import { VERIFIED_MESSAGE_SEED } from "../constants";

const SINGLE_VAA_FILE = process.env.VAA_FILE;

async function cleanup() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolanaWormholeVerifier as Program<SolanaWormholeVerifier>;

  const vaaFiles = SINGLE_VAA_FILE ? [SINGLE_VAA_FILE] : listVaaFiles();

  console.log(`🧹 Starting cleanup for ${vaaFiles.length} VAA files...`);

  for (const fileName of vaaFiles) {
    const rowVaa = loadVaaFromFile(fileName);
    const rawVaaBase64 = rowVaa.data.vaa;
    const vaaBytes = Buffer.from(rawVaaBase64, "base64");
    const { vaaBody } = parseVaa(vaaBytes);
    const parsedVaaBody = parseVaaBody(vaaBody);
    const seeds = toPdaMessageSeeds(parsedVaaBody);

    const [verifiedMessagePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(VERIFIED_MESSAGE_SEED),
        seeds.emitterChain,
        seeds.emitterAddress,
        seeds.sequence,
      ],
      program.programId,
    );

    try {
      await program.methods
        .closeVerifiedMessage()
        .accounts({
          payer: provider.publicKey,
          verifiedMessage: verifiedMessagePda,
        })
        .rpc({ skipPreflight: true });

      console.log("✅ Closed:", verifiedMessagePda.toBase58());
    } catch (e: any) {
      const code =
        e?.error?.errorCode?.number || e?.error?.InstructionError?.[1]?.Custom;
      const msg = e?.error?.errorMessage || e.toString();

      if (
        code === 6004 || // InstructionDisabled (test-mode)
        msg.includes("Verified message already exists") ||
        msg.includes("Account does not exist")
      ) {
        console.log("close skipped (expected):", verifiedMessagePda.toBase58());
      } else {
        throw e;
      }
    }
  }
  console.log("🧹 Cleanup finished.");
}

cleanup().catch(console.error);
