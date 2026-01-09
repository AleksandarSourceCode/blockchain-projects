/**
 * Aggregated incoming and outgoing SOL flow summary
 */
export type SolFlowSummary = {
  receivedLamports: number;
  spentLamports: number;
  receivedSol: number;
  spentSol: number;
};