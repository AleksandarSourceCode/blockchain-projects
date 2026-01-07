import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

/**
 * Confirms a transaction using the latest blockhash-based confirmation API.
 *
 * This helper waits until the given transaction reaches the specified commitment level
 * before allowing any subsequent state reads, ensuring deterministic and non-flaky
 * behavior in Anchor tests.
 *
 * @param connection - The Solana connection used to confirm the transaction.
 * @param signature - The transaction signature to be confirmed.
 * @param commitment - The desired commitment level (defaults to "confirmed").
 */
export async function confirmTx(
  connection: anchor.web3.Connection,
  signature: string,
  commitment: anchor.web3.Commitment = "confirmed"
): Promise<void> {
  const bh = await connection.getLatestBlockhash(commitment);
  await connection.confirmTransaction(
    {
      signature,
      blockhash: bh.blockhash,
      lastValidBlockHeight: bh.lastValidBlockHeight,
    },
    commitment
  );
}

/**
 * Represents a snapshot of token account at a specific point in time.
 *
 * This type is used exclusively in tests to capture and compare token balances
 * before and after on-chain instructions are executed.
 */
export type TokenAccountSnapshot = {
  name: string;
  address: string;
  balance: string;
};

/**
 * Fetches the current on-chain state of multiple token accounts.
 *
 * This helper retrieves each account using the provided token program and returns
 * a structured snapshot containing the account address and token balance. If a token
 * account does not exist, the snapshot explicitly marks it as not initialized.
 *
 * @param connection - The Solana connection used to query on-chain data.
 * @param accounts - A list of token accounts to inspect, identified by name and public key.
 * @param tokenProgram - The token program to use (either TOKEN_PROGRAM_ID for SPL Token
 *                       or TOKEN_2022_PROGRAM_ID for Token-2022).
 * 
 * @returns A list of token account snapshots representing the current on-chain state.
 */
export async function fetchTokenAccountsSnapshot(
  connection: anchor.web3.Connection,
  accounts: { name: string; pubkey: PublicKey }[],
  tokenProgram: typeof TOKEN_PROGRAM_ID | typeof TOKEN_2022_PROGRAM_ID
): Promise<TokenAccountSnapshot[]> {
  return await Promise.all(
    accounts.map(async ({ name, pubkey }) => {
      try {
        const acc = await getAccount(
          connection,
          pubkey,
          undefined,
          tokenProgram
        );
        return {
          name,
          address: pubkey.toBase58(),
          balance: acc.amount.toString(),
        };
      } catch {
        return {
          name,
          address: pubkey.toBase58(),
          balance: "not initialized",
        };
      }
    })
  );
}
