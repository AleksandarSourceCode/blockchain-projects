import { writeJson } from "../../utils/writeJson.js";
import { debugLog } from "../../utils/debug.js";
import { summarizeSolFlow } from "../transactions/summarizeSolFlow.js";
import { SolFlowSummary } from "../../types/solFlowSummary.js";

/**
 * Builds a SOL flow summary from indexed transactions and writes it to a JSON file
 */
export async function runSummarizeSolFlow(
  walletAddress: string,
  transactions: unknown[],
  outputFilePath: string
): Promise<SolFlowSummary>
{
  const summary = summarizeSolFlow(walletAddress, transactions);

  writeJson(outputFilePath, summary);

  debugLog(
    "[SOL FLOW] summary saved",
    outputFilePath
  );

  return summary;
}
