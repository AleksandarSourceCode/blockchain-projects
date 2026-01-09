import { HELIUS_API_KEY } from "../../keys.js";

type IndexedTransaction = any;

/**
 * Fetches indexed transactions for an address using Helius Indexer API
 */
export async function fetchHeliusIndexedTransactions(
  address: string,
  limit = 100
): Promise<IndexedTransaction[]>
{
  const url =
    `https://api.helius.xyz/v0/addresses/${address}/transactions` +
    `?api-key=${HELIUS_API_KEY}&limit=${limit}`;

  const response = await fetch(url, { method: "GET" });

  if (!response.ok)
  {
    const text = await response.text();
    throw new Error(`Helius Indexer HTTP ${response.status}: ${text}`);
  }

  const transactions = (await response.json()) as IndexedTransaction[];

  return transactions;
}
