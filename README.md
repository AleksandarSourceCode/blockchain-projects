# Blockchain Projects Portfolio

## Overview

This repository is an **educational portfolio monorepo** showcasing a collection of **independent blockchain projects**. The focus is on on-chain architecture, protocol design, and high-quality smart contract development across both Solana and Ethereum ecosystems.

---

## Project Structure

- `solana-projects/` – Rust-based programs built with the Anchor framework.
- `ethereum-projects/` – Solidity smart contracts built with the Hardhat framework.

---

## Solana Projects

⭐ marks **featured / flagship** projects that demonstrate complex system design.

| Project                                                                         | Type                             | Focus                                                                    |
| :------------------------------------------------------------------------------ | :------------------------------- | :----------------------------------------------------------------------- |
| [solana-config-program](solana-projects/solana-config-program/README.md)        | **Infrastructure / Registry**    | Global configuration accounts and deterministic PDA registry patterns.   |
| [solana-escrow-program](solana-projects/solana-escrow-program/README.md)        | **DeFi / Atomic Swap**           | Secure token swap logic using vault PDAs and atomic execution.           |
| [solana-token-manager](solana-projects/solana-token-manager/README.md)          | **Token Standards / Lab**        | Comparative study of SPL Token vs. Token-2022 extensions.                |
| [solana-nft-factory](solana-projects/solana-nft-factory/README.md)              | **Digital Assets / NFT Tooling** | Multi-flow NFT minting pipelines, metadata, and collection verification. |
| [solana-log-lab](solana-projects/solana-log-lab/README.md)                      | **Dev Tooling / Lab**            | Advanced runtime logging, event emission, and program diagnostics.       |
| [solana-price-oracle](solana-projects/solana-price-oracle/README.md)            | **Oracle / Infrastructure**      | Integration with Pyth Network using the pull-based oracle model.         |
| [solana-wallet-analyzer](solana-projects/solana-wallet-analyzer/README.md)      | **Data Tooling / Analytics**     | Off-chain TypeScript tool for wallet indexing and data enrichment.       |
| ⭐ [solana-employee-rewards](solana-projects/solana-employee-rewards/README.md) | **Enterprise Web3 / dApp**       | Full-scale rewards system with annual cycles, treasury, and NFT badges.  |

---

## Ethereum Projects

| Project                                                                             | Type                        | Focus                                                                     |
| :---------------------------------------------------------------------------------- | :-------------------------- | :------------------------------------------------------------------------ |
| [ethereum-token-standards](ethereum-projects/ethereum-token-standards/README.md)    | **Token Standards / Lab**   | Deep dive into ERC-20, ERC-721, and ERC-1155 reference implementations.   |
| [ethereum-amm-oracle-lab](ethereum-projects/ethereum-amm-oracle-lab/README.md)      | **DeFi Protocol / AMM Lab** | Constant-product AMM mechanics with slippage and oracle protection.       |
| ⭐ [ethereum-employee-voting](ethereum-projects/ethereum-employee-voting/README.md) | **Governance Engine**       | Modular voting primitives with stake-weighting and cross-chain potential. |

---

## How to Navigate

Each project is designed to be self-contained for easier auditing and learning. Inside each directory you will find:

- `programs/`, `src/`, or `contracts/` – The core on-chain logic and smart contracts.
- `tests/` – Comprehensive test suites (Foundry, Hardhat, or Anchor/Mocha).
- `README.md` – Detailed technical documentation, architectural diagrams, and setup guides.

---

## Technical Philosophy

- **Clarity Over Abstraction:** Implementations favor explicit state transitions and clear logic to better illustrate core blockchain concepts.
- **Security Mindset:** Use of industry standards (OpenZeppelin, Anchor safety checks), custom error handling, and protection against common vectors like price manipulation.
- **Educational Transparency:** Projects include extensive inline comments and documentation to explain the "why" behind specific architecture choices.

---

## Environment & Tools

- **Solana:** Rust, Anchor Framework, Solana CLI.
- **Ethereum:** Solidity, Hardhat, Foundry, Ethers.js v6.
- **Infrastructure:** Pyth Network, Wormhole, Helius, Birdeye APIs.

---

## Disclaimer

This repository is for **educational and portfolio purposes only**. The code is not audited and should not be used in production environments involving real financial assets.
