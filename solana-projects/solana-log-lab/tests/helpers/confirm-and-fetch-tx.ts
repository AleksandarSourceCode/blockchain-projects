import { Finality, Connection } from "@solana/web3.js";

export async function confirmAndFetchTx(
  connection: Connection,
  signature: string,
  finality: Finality = "confirmed"
) {
  const latestBlockhash =
    await connection.getLatestBlockhash(finality);

  await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight:
        latestBlockhash.lastValidBlockHeight,
    },
    finality
  );

  return await connection.getTransaction(signature, {
    commitment: finality,
    maxSupportedTransactionVersion: 0,
  });
}