import { SolFlowSummary } from "../../types/solFlowSummary.js";

type IndexedTransaction = any;

/**
 * Summarizes incoming and outgoing SOL flow for a wallet
 */
export function summarizeSolFlow(
  walletAddress: string,
  transactions: IndexedTransaction[]
): SolFlowSummary
{
  let receivedLamports = 0;
  let spentLamports = 0;

  for (const tx of transactions)
  {
    const nativeTransfers = tx.nativeTransfers ?? [];

    for (const transfer of nativeTransfers)
    {
      if (transfer.toUserAccount === walletAddress)
      {
        receivedLamports += transfer.amount;
      }
      else if (transfer.fromUserAccount === walletAddress)
      {
        spentLamports += transfer.amount;
      }
    }
  }

  const summary: SolFlowSummary = {
    receivedLamports,
    spentLamports,
    receivedSol: receivedLamports / 1e9,
    spentSol: spentLamports / 1e9,
  };

  return summary;
}
