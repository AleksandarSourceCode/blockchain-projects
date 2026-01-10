# Blockchain Projects Portfolio

## Overview

This repository is an **educational and portfolio monorepo** for blockchain development projects.
It provides a clear overview of multiple independent projects, including programs, tests, and documentation.

The repository primarily focuses on **Solana-based projects**, with future plans for Ethereum and other EVM-compatible platforms.

---

## Project Structure

- `solana-projects/` – Solana-based programs, each organized in its own directory.
- `ethereum-projects/` – (Planned) Ethereum and other EVM-compatible projects.

---

## Projects

| Project Name                                                                 | Type               | Platform | Status  |
| ---------------------------------------------------------------------------- | ------------------ | -------- | ------- |
| [solana-config-program](solana-projects/solana-config-program/README.md)     | On-chain Program   | Solana   | Active  |
| [solana-escrow-program](solana-projects/solana-escrow-program/README.md)     | On-chain Program   | Solana   | Active  |
| [solana-token-manager](solana-projects/solana-token-manager/README.md)       | On-chain Program   | Solana   | Active  |
| [solana-nft-factory](solana-projects/solana-nft-factory/README.md)           | On-chain Program   | Solana   | Active  |
| [solana-log-lab](solana-projects/solana-log-lab/README.md)                   | On-chain Program   | Solana   | Active  |
| [solana-price-oracle](solana-projects/solana-price-oracle/README.md)         | Oracle / Infra     | Solana   | Active  |
| [solana-wallet-analyzer](solana-projects/solana-wallet-analyzer/README.md)   | Tool / Analyzer    | Solana   | Active  |
| ethereum-example                                                             | On-chain Program   | Ethereum | Planned |

---

## How to Navigate

Each project is self-contained and includes its own:

- `src/` or `programs/` – Core logic
- `tests/` – Integration and unit tests (where applicable)
- `README.md` – Project-specific documentation

---

## Notes

Some projects include additional inline comments and more explicit implementations for educational clarity.
In certain cases, code is intentionally simplified to highlight core concepts rather than production optimizations.

Some tests are written in a more explicit style to make program behavior and runtime effects easier to observe,
especially for readers less familiar with Solana and Anchor internals.

---

## Disclaimer

Educational and portfolio purposes only.