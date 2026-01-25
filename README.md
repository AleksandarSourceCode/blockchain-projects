# Blockchain Projects Portfolio

## Overview

This repository is an **educational portfolio monorepo**  
for blockchain development projects.

It provides a clear overview of multiple independent projects,  
including programs, tests, and documentation.

The repository primarily focuses on **Solana-based projects**
and **Ethereum-based projects**,
with future plans for **other EVM-compatible platforms**.

---

## Project Structure

- `solana-projects/` – Solana-based projects, each organized in its own directory.
- `ethereum-projects/` – Ethereum-based projects, with room for other EVM-compatible platforms.

---

## Projects

| Project Name                                                                     | Type             | Platform | Status      |
| -------------------------------------------------------------------------------- | ---------------- | -------- | ----------- |
| [solana-config-program](solana-projects/solana-config-program/README.md)         | On-chain Program | Solana   | Active      |
| [solana-escrow-program](solana-projects/solana-escrow-program/README.md)         | On-chain Program | Solana   | Active      |
| [solana-token-manager](solana-projects/solana-token-manager/README.md)           | On-chain Program | Solana   | Active      |
| [solana-nft-factory](solana-projects/solana-nft-factory/README.md)               | On-chain Program | Solana   | Active      |
| [solana-log-lab](solana-projects/solana-log-lab/README.md)                       | On-chain Program | Solana   | Active      |
| [solana-price-oracle](solana-projects/solana-price-oracle/README.md)             | Oracle / Infra   | Solana   | Active      |
| [solana-wallet-analyzer](solana-projects/solana-wallet-analyzer/README.md)       | Tool / Analyzer  | Solana   | Active      |
| [solana-employee-rewards](solana-projects/solana-employee-rewards/README.md)     | On-chain Program | Solana   | ⭐ Featured |
| [ethereum-token-standards](ethereum-projects/ethereum-token-standards/README.md) | Smart Contracts  | Ethereum | Active      |
| [ethereum-amm-oracle-lab](ethereum-projects/ethereum-amm-oracle-lab/README.md)   | DeFi Protocol    | Ethereum | Active      |

---

## How to Navigate

Each project is self-contained and includes its own:

- `programs/`, `src/`, or `contracts/` – Core logic
- `tests/` – Integration and unit tests (where applicable)
- `README.md` – Project-specific documentation

---

## Notes

- Some projects include additional inline comments  
  and more explicit implementations for educational clarity.
- In certain cases, code is intentionally simplified  
  to highlight core concepts rather than production optimizations.
- Some tests are written in a more explicit style  
  to make contract behavior and runtime effects easier to observe,  
  especially for readers less familiar with blockchain internals  
  or specific frameworks used in the project.

---

## Disclaimer

Educational and portfolio purposes only.
