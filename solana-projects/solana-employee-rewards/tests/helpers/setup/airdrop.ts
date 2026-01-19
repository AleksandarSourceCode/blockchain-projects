import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Airdrops SOL to the given public key and waits for confirmation.
export async function airdropSol(
  connection: Connection,
  recipient: PublicKey,
  solAmount: number,
): Promise<string> {
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);

  const signature = await connection.requestAirdrop(recipient, lamports);

  const latestBlockhash = await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    "confirmed",
  );

  return signature;
}
