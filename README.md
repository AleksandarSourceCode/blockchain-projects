# Blockchain Projects Portfolio

![Anchor](https://img.shields.io/badge/Anchor-4E44CE?style=flat)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript)
![Hardhat](https://img.shields.io/badge/Hardhat-F7DF1E?style=flat&logo=ethereum)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity)
![Foundry](https://img.shields.io/badge/Foundry-000000?style=flat)

## Overview

This repository is an **educational portfolio monorepo** showcasing a collection of **independent blockchain projects**. The focus is on system architecture, protocol design, and on-chain development across Solana and Ethereum ecosystems.

**Projects are intentionally backend-focused and do not include frontend implementations.**

---

## Solana Projects

⭐ marks **featured / flagship** projects that demonstrate complex system design.

| Project                                                                           | Type                             | Focus                                                                    |
| :-------------------------------------------------------------------------------- | :------------------------------- | :----------------------------------------------------------------------- |
| [solana-config-program](solana-projects/solana-config-program/README.md)          | **Infrastructure / Registry**    | Global configuration accounts and deterministic PDA registry patterns.   |
| [solana-escrow-program](solana-projects/solana-escrow-program/README.md)          | **DeFi / Atomic Swap**           | Secure token swap logic using vault PDAs and atomic execution.           |
| [solana-token-manager](solana-projects/solana-token-manager/README.md)            | **Token Standards / Lab**        | Comparative study of SPL Token vs. Token-2022 extensions.                |
| [solana-nft-factory](solana-projects/solana-nft-factory/README.md)                | **Digital Assets / NFT Tooling** | Multi-flow NFT minting pipelines, metadata, and collection verification. |
| [solana-log-lab](solana-projects/solana-log-lab/README.md)                        | **Dev Tooling / Lab**            | Advanced runtime logging, event emission, and program diagnostics.       |
| [solana-price-oracle](solana-projects/solana-price-oracle/README.md)              | **Infrastructure / Oracle**      | Integration with Pyth Network using the pull-based oracle model.         |
| [solana-wallet-analyzer](solana-projects/solana-wallet-analyzer/README.md)        | **Data Tooling / Analytics**     | Off-chain TypeScript tool for wallet indexing and data enrichment.       |
| ⭐ [solana-employee-rewards](solana-projects/solana-employee-rewards/README.md)   | **Enterprise Web3 / dApp**       | Full-scale rewards system with annual cycles, treasury, and NFT badges.  |
| ⭐ [solana-wormhole-verifier](solana-projects/solana-wormhole-verifier/README.md) | **Infrastructure / Cross-Chain** | On-chain Wormhole VAA verification and deterministic message storage.    |

---

## Ethereum Projects

| Project                                                                             | Type                        | Focus                                                                              |
| :---------------------------------------------------------------------------------- | :-------------------------- | :--------------------------------------------------------------------------------- |
| [ethereum-token-standards](ethereum-projects/ethereum-token-standards/README.md)    | **Token Standards / Lab**   | Deep dive into ERC-20, ERC-721, and ERC-1155 reference implementations.            |
| [ethereum-amm-oracle-lab](ethereum-projects/ethereum-amm-oracle-lab/README.md)      | **DeFi Protocol / AMM Lab** | Constant-product AMM mechanics with slippage and oracle protection.                |
| ⭐ [ethereum-employee-voting](ethereum-projects/ethereum-employee-voting/README.md) | **Governance Engine**       | Modular voting primitives with stake-weighting and Wormhole-based result emission. |

---

### ⭐ Featured Cross-Chain Integration

The featured projects demonstrate a cross-chain concept connecting **Ethereum governance** with **Solana-based reward systems**.

On Ethereum, the **ethereum-employee-voting** project enables voting across multiple proposal types, including **choice-based proposals** (e.g. “Employee of the Year”). Finalized voting results from these proposals are emitted as Wormhole messages.

On Solana, the **solana-employee-rewards** project models an annual reward system based on completed tasks, with support for minting **special-purpose tokens** to recognize exceptional contributions.

To bridge these two layers, the **solana-wormhole-verifier** project verifies Wormhole VAAs on Solana and stores verified messages as on-chain accounts. VAA data is fetched off-chain from WormholeScan using a dedicated fetcher, while the Anchor program validates guardian signatures via the official Wormhole verification shim.

The final step of consuming verified messages inside the reward application (e.g. minting tokens in `solana-employee-rewards`) is intentionally omitted. Once a message is verified and persisted on Solana, downstream execution becomes a straightforward application-level concern.

This design intentionally emphasizes **cross-chain mechanics and verification flow** over application-specific specialization, keeping the implementation general and focused on the core concept. The Ethereum and Solana projects are intentionally kept independent to preserve their primary purpose and presentation scope.

---

## Project Structure

- `solana-projects/` – Rust-based programs built with the Anchor framework.
- `ethereum-projects/` – Solidity smart contracts built with Hardhat and Foundry.

---

## How to Navigate

Each project is designed to be self-contained for easier auditing and review. Inside each directory you will find:

- `programs/`, `src/`, or `contracts/` – Core on-chain logic and smart contracts.
- `tests/` – Comprehensive test suites (Foundry, Hardhat, or Anchor/Mocha).
- `README.md` – Technical documentation, architectural diagrams, and setup guides.

---

## Design Principles

- **Modular Architecture:** Program logic and state are organized into independent modules with clearly defined responsibilities.
- **Defensive Design:** Access checks, state validation, and explicit error handling are used to enforce expected behavior.
- **Standard Compliance:** Core functionality follows established protocol standards (ERC, SPL, Token-2022).
- **Testability:** The architecture is structured to support validation through unit and integration tests.

> Some modules intentionally favor explicit comments, visually traceable tests, and simplified logic to emphasize conceptual clarity and protocol behavior over production-level optimization.

---

## Environment & Tools

- **Backend & Tooling:** Node.js, TypeScript.
- **Solana Stack:** Rust, Anchor Framework, Solana CLI.
- **Ethereum Stack:** Solidity, Hardhat, Foundry, Ethers.js v6.
- **Infrastructure:** Pyth Network, Wormhole, Helius, Birdeye APIs.

---

## Disclaimer

This repository is for **educational and portfolio purposes only**. The code is not audited and should not be used in production environments involving real financial assets.
