import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import assert from "assert";

import {
  DEBUG,
  GUARDIAN_SET_SEED,
  VERIFIED_MESSAGE_SEED,
  WORMHOLE_CORE_PROGRAM_ID_DEVNET,
} from "./constants";

import { SolanaWormholeVerifier } from "../target/types/solana_wormhole_verifier";
import wormholeVerifyIdl from "../idls/wormhole_verify_vaa_shim.json";

import { listVaaFiles } from "./helpers/vaa/list";
import { loadVaaFromFile } from "./helpers/vaa/load";
import { parseVaa, parseVaaBody } from "./helpers/vaa/parse";
import { toPdaMessageSeeds } from "./helpers/pda";
import { sleep, printVerifiedMessage } from "./helpers/utils";

const SINGLE_VAA_FILE = process.env.VAA_FILE;
const CORE_BRIDGE_PROGRAM_ID = new PublicKey(WORMHOLE_CORE_PROGRAM_ID_DEVNET);

describe("verify_vaa instruction", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolanaWormholeVerifier as Program<SolanaWormholeVerifier>;

  // External Wormhole verification program (loaded via IDL)
  const wormholeVerifyProgram = new Program(wormholeVerifyIdl as any, provider);

  const vaaFiles = SINGLE_VAA_FILE ? [SINGLE_VAA_FILE] : listVaaFiles();

  for (const fileName of vaaFiles) {
    it(`executes full VAA verification lifecycle (${fileName})`, async () => {
      const vaaRecord = loadVaaFromFile(fileName);
      const vaaBytes = Buffer.from(vaaRecord.data.vaa, "base64");

      const {
        guardianSetIndex,
        signaturesCount,
        guardianSignaturesVec,
        vaaBody,
      } = parseVaa(vaaBytes);

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

      const payer = provider.publicKey!;
      const guardianSignatures = Keypair.generate();

      await wormholeVerifyProgram.methods
        .postSignatures(
          guardianSetIndex,
          signaturesCount,
          guardianSignaturesVec,
        )
        .accounts({
          payer,
          guardianSignatures: guardianSignatures.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([guardianSignatures])
        .rpc();

      const indexBuf = Buffer.alloc(4);
      indexBuf.writeUInt32BE(guardianSetIndex);

      const [guardianSetPda, guardianSetBump] =
        PublicKey.findProgramAddressSync(
          [Buffer.from(GUARDIAN_SET_SEED), indexBuf],
          CORE_BRIDGE_PROGRAM_ID,
        );

      await program.methods
        .verifyVaa(guardianSetBump, vaaBody)
        .accounts({
          guardianSet: guardianSetPda,
          guardianSignatures: guardianSignatures.publicKey,
          verifiedMessage: verifiedMessagePda,
        })
        .rpc();

      await wormholeVerifyProgram.methods
        .closeSignatures()
        .accounts({
          guardianSignatures: guardianSignatures.publicKey,
          refundRecipient: payer,
        })
        .rpc();

      if (DEBUG) {
        await printVerifiedMessage(program, verifiedMessagePda);
      }

      assert.ok(true);
      await sleep(500);
    });
  }
});
