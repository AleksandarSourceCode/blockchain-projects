import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { PAYOUT_MINT_DECIMALS } from "../../constants/mints";

// Creates a new SPL mint and mints tokens to the recipient ATA.
export async function createMintAndFund(
  connection: Connection,
  payer: Keypair,
  recipient: PublicKey,
  amount: bigint,
  decimals = PAYOUT_MINT_DECIMALS,
): Promise<{
  mint: PublicKey;
  recipientAta: PublicKey;
}> {
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    decimals,
  );

  const recipientAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    recipient,
    true,
  );

  const signature = await mintTo(
    connection,
    payer,
    mint,
    recipientAta.address,
    payer,
    amount,
  );

  const latestBlockhash = await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    "confirmed",
  );

  return {
    mint,
    recipientAta: recipientAta.address,
  };
}
