# Solana Wallet Analyzer

## Description

A lightweight off-chain **educational and portfolio tool**  
for analyzing a Solana wallet using on-chain data and public APIs.

The analyzer focuses on structured data collection, enrichment,  
and summarization rather than building a production service.

---

## What This Project Demonstrates

- Scanning SPL and Token-2022 token accounts
- Enriching tokens with on-chain metadata
- NFT detection using simple heuristics
- USD price fetching via Birdeye
- Indexed transaction analysis via Helius
- SOL inflow / outflow summarization
- Clean, step-by-step analysis pipelines in TypeScript

---

## Structure

```
src/
├── config/        # RPC connection and wallet configuration
├── index.ts       # Main execution pipeline
├── constants.ts
├── keys.ts        # API keys (not committed)
├── operations/
│   ├── scan/          # Token and NFT scanning
│   ├── enrich/        # Metadata enrichment
│   ├── value/         # Pricing and value calculations
│   ├── transactions/ # Helius transaction analysis
│   ├── summary/      # Wallet-level summaries
│   └── run/           # Execution wrappers (file outputs)
├── types/         # Shared data models
└── utils/         # Helpers (rate limiting, retries, IO)
```

All analysis results are written as JSON files to the `outputs/` directory.

---

## Instructions / API

This project is organized as a sequential analysis pipeline executed from `index.ts`:

1. Token account scan
2. Metadata enrichment (SPL and Token-2022)
3. Token filtering and classification
4. NFT detection
5. USD price resolution (Birdeye)
6. Indexed transaction fetch (Helius)
7. SOL flow summarization
8. Wallet-level summary generation

Each step produces structured JSON output that can be reused or inspected independently.

---

## Usage

### 1. Create API configuration

Create a file:

```
src/keys.ts
```

Add your API keys:

```ts
export const BIRDEYE_API_KEY = "YOUR_BIRDEYE_API_KEY";
export const HELIUS_API_KEY = "YOUR_HELIUS_API_KEY";
export const JUPITER_API_KEY = "YOUR_JUPITER_API_KEY";
```

### 2. Set wallet address

Open the file:

```
src/constants.ts
```

Set the wallet address:

```ts
export const WALLET_ADDRESS = "YOUR_WALLET_ADDRESS";
```

### 3. Install dependencies and run the analyzer

```bash
npm install
npm run start
```

> The execution flow is defined in `src/index.ts`.
> Individual pipeline steps can be enabled or disabled directly in that file.

---

## Environment / Versions

- Node.js: 20+
- Solana RPC access
- Birdeye API key
- Helius API key

---

## Notes

- The wallet address to analyze must be provided by the user  
  by updating the `WALLET_ADDRESS` constant.
- API keys are required for Birdeye (https://birdeye.so)  
  and Helius (https://helius.dev)  
  and are provided via a local `keys.ts` file (not committed).
- Birdeye and RPC endpoints are rate-limited;  
  retry logic is built in.
- NFT detection uses a simple heuristic  
  (`amount === 1`, `decimals === 0`).
- Token-2022 metadata is supported only when stored  
  via the metadata pointer extension.
- The tool is not optimized for very large wallets  
  and is intended for educational use.
