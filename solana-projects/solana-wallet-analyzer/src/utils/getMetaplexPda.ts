import { PublicKey } from "@solana/web3.js";
import { METADATA_SEED, METAPLEX_PROGRAM_ID } from "../constants.js";

/**
 * Derives the Metaplex metadata PDA for a given mint
 */
export function getMetadataPda(mintPublicKey: PublicKey): PublicKey
{
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      METAPLEX_PROGRAM_ID.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    METAPLEX_PROGRAM_ID
  );

  return pda;
}
