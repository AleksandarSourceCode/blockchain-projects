import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";
import { fetchHeliusIndexedTransactions } from "../transactions/fetchHeliusIndexedTransactions.js";

/**
 * Fetches indexed transactions via Helius and writes them to a JSON file
 */
export async function runFetchHeliusIndexedTransactions(
  address: string,
  outputFilePath: string,
  limit = 100
) {
  const transactions = await fetchHeliusIndexedTransactions(address, limit);

  writeJson(outputFilePath, transactions);

  debugLog(
    "[HELIUS] indexed transactions saved",
    `${transactions.length} transactions`
  );

  return transactions;
}
