import * as anchor from "@coral-xyz/anchor";

// Airdrops SOL to a wallet and confirms the transaction.
export async function airdropSol(
  connection: anchor.web3.Connection,
  pubkey: anchor.web3.PublicKey,
  sol = 5
) {
  const sig = await connection.requestAirdrop(
    pubkey,
    sol * anchor.web3.LAMPORTS_PER_SOL
  );

  const blockhash = await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    { signature: sig, ...blockhash },
    "confirmed"
  );
}