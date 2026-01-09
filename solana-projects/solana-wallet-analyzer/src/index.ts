import { connection } from "./config/solana.js";
import { walletPublicKey } from "./config/wallet.js";
import { WALLET_ADDRESS } from "./constants.js";

import { runBasicTokenScan } from "./operations/run/runBasicTokenScan.js";
import { runEnrichSplMetadata } from "./operations/run/runEnrichSplMetadata.js";
import { runEnrichToken2022Metadata } from "./operations/run/runEnrichToken2022Metadata.js";
import { runFetchBirdeyePricesUsd } from "./operations/run/runFetchBirdeyePricesUsd.js";
import { runFetchHeliusIndexedTransactions } from "./operations/run/runFetchHeliusIndexedTransactions.js";
import { runNftScanFromList } from "./operations/run/runNftScanFromList.js";
import { runSummarizeSolFlow } from "./operations/run/runSummarizeSolFlow.js";
import { runWalletSummary } from "./operations/run/runWalletSummary.js";


import { filterTokens } from "./operations/scan/filterTokens.js";
import { filterTokenPrices } from "./operations/value/filterTokenPrices.js";
import { writeJson } from "./utils/writeJson.js";

/* =========================
 * TOKEN SCAN
 * ========================= */

const tokens = await runBasicTokenScan(
  connection,
  walletPublicKey,
  "outputs/tokens.raw.json"
);

/* =========================
 * METADATA ENRICHMENT
 * ========================= */

await runEnrichSplMetadata(
  connection,
  tokens,
  "outputs/tokens.spl.metadata.json",
  50
);

await runEnrichToken2022Metadata(
  connection,
  tokens,
  "outputs/tokens.token2022.metadata.json",
  20
);

/* =========================
 * FILTERING
 * ========================= */

const largeBalanceTokens = filterTokens(tokens, {
  minAmount: 1_000_000,
});

writeJson(
  "outputs/tokens.large-balances.json",
  largeBalanceTokens
);

/* =========================
 * PRICES
 * ========================= */

const pricedTokens = await runFetchBirdeyePricesUsd(
  tokens,
  "outputs/tokens.prices.usd.json",
  10
);

const expensiveTokens = filterTokenPrices(pricedTokens, {
  minPriceUsd: 100,
});

writeJson(
  "outputs/tokens.expensive.json",
  expensiveTokens
);

/* =========================
 * NFTS
 * ========================= */

await runNftScanFromList(
  connection,
  tokens,
  "outputs/nfts.from-token-list.json"
);

/* =========================
 * WALLET SUMMARY
 * ========================= */

await runWalletSummary(
  connection,
  walletPublicKey,
  tokens,
  "outputs/wallet.summary.json"
);

/* =========================
 * HELIUS / SOL FLOW
 * ========================= */

const indexedTransactions =
  await runFetchHeliusIndexedTransactions(
    WALLET_ADDRESS,
    "outputs/transactions.indexed.json"
  );

await runSummarizeSolFlow(
  WALLET_ADDRESS,
  indexedTransactions,
  "outputs/sol.flow.summary.json"
);
