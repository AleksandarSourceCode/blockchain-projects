# Solana Wallet Analyzer

**Solana Wallet Analyzer** is a lightweight **educational / portfolio tool** for analyzing a Solana wallet using on-chain data and public APIs.  
It demonstrates how to scan token accounts, resolve metadata, analyze NFTs, fetch prices, retrieve wallet transactions, and summarize wallet activity.

> This project is intended for educational and portfolio purposes.

---

## Overview

The analyzer performs a step-by-step wallet analysis pipeline:

- Scans SPL and Token-2022 token accounts
- Enriches tokens with on-chain metadata
- Detects NFTs using simple heuristics
- Fetches USD prices using Birdeye
- Fetches indexed transactions via Helius
- Summarizes incoming and outgoing SOL flow
- Builds a wallet summary (balances and counts)

The project focuses on **clarity, correctness, and structure**, not on building a production service.

---

## High-Level Flow

```
Scan → Enrich → NFT → Price (Birdeye) → Transactions (Helius) → SOL Flow → Summary
```

Each step produces structured JSON output that can be inspected or reused.

---

## Project Structure

```
src/
├── config/        # Solana RPC connection and wallet configuration
├── constants.ts   # Global constants (program IDs, flags, defaults)
├── index.ts       # Main execution pipeline
├── keys.ts        # API keys (not committed)
├── operations/    # Core analysis logic
│   ├── scan/          # Token and NFT scanning
│   ├── enrich/        # Metadata enrichment
│   ├── value/         # Pricing and value calculations
│   ├── summary/       # Wallet-level summaries
│   ├── transactions/ # Helius transaction analysis
│   └── run/           # Execution wrappers (file outputs)
├── types/         # Shared data models
└── utils/         # Helpers (rate limiting, retries, IO)
```

Generated analysis results are written to the `outputs/` directory.

---

## Setup

### Prerequisites

- **Node.js**
- **npm**
- Access to:
  - Solana RPC
  - Birdeye API
  - Helius API

---

### API Keys

This project uses a simple `keys.ts` file for API keys.

> **Important:**  
> `keys.ts` is intentionally **not committed** and must be created locally.

Example:

```ts
// src/keys.ts
export const BIRDEYE_API_KEY = "...";
export const HELIUS_API_KEY = "...";
```

---

## Running the Analyzer

From the project root:

```bash
npm install
npm run start
```

The execution flow is defined in `src/index.ts`.
Each step writes its output as JSON to the `outputs/` directory.

To enable or disable specific analysis steps, simply comment or uncomment the relevant lines in that file.

---

## Limitations & Notes

- **Birdeye API** has strict rate limits (free tier).
- **RPC calls** are rate-limited and retried, but public RPC endpoints may still be slow.
- **NFT detection** uses a simple heuristic:
  - `amount === 1`
  - `decimals === 0`
- **Token metadata resolution depends on the token program type**:
  - SPL tokens use Metaplex metadata accounts.
  - Token-2022 tokens are supported **only if metadata is stored via the metadata pointer / extension**.
  - If Token-2022 metadata is stored in a custom or non-standard account, it will not be detected.
- Free API keys are required for:
  - https://birdeye.so/
  - https://www.helius.dev/
- This tool is **not optimized for large wallets** and is intended for educational use.

---

## Purpose

This project exists to demonstrate:

- Practical Solana wallet analysis
- Clean TypeScript project structure
- Responsible RPC usage (rate limiting & retries)
- Data normalization and summarization
- Integration with Solana ecosystem APIs
