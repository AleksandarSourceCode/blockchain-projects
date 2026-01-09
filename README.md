# Blockchain Projects Portfolio

**Author:** Aleksandar Joksić

## Overview

This repository serves as a **professional portfolio** of my blockchain development work. It is designed as a **monorepo** to provide an organized overview of all projects, including programs, tests, and documentation.  
The portfolio primarily focuses on **Solana-based projects**, with future plans for Ethereum and other EVM-compatible platforms.

> This repository is intended for educational and portfolio purposes.

---

## Project Structure

- `solana-projects/` – Contains Solana-based programs, each organized in its own directory.
- `ethereum-projects/` – (Planned) Future Ethereum and EVM-based projects.

---

## Projects Overview

| Project Name                                                                 | Category           | Platform | Status  |
| ---------------------------------------------------------------------------- | ------------------ | -------- | ------- |
| [solana-config-program](solana-projects/solana-config-program/README.md)     | On-chain Program   | Solana   | Active  |
| [solana-escrow-program](solana-projects/solana-escrow-program/README.md)     | On-chain Program   | Solana   | Active  |
| [solana-token-manager](solana-projects/solana-token-manager/README.md)       | On-chain Program   | Solana   | Active  |
| [solana-nft-factory](solana-projects/solana-nft-factory/README.md)           | On-chain Program   | Solana   | Active  |
| [solana-log-lab](solana-projects/solana-log-lab/README.md)                   | On-chain Program   | Solana   | Active  |
| [solana-price-oracle](solana-projects/solana-price-oracle/README.md)         | Oracle / Infra     | Solana   | Active  |
| [solana-wallet-analyzer](solana-projects/solana-wallet-analyzer/README.md)   | Tool / Analyzer    | Solana   | Active  |
| ethereum-example                                                             | On-chain Program   | Ethereum | Planned |

**Category legend:**
- **On-chain Program** – Solana smart contracts (Anchor-based)
- **Tool / Analyzer** – Off-chain tooling and analysis utilities
- **Oracle / Infra** – Oracle integrations and infrastructure components
---

## How to Navigate

Each project inside the folders is self-contained with its own:

- `src/` or `programs/` – Core on-chain program logic.
- `tests/` – Integration and unit tests.
- `README.md` – Project-specific documentation.
- `.gitignore` – Project-level ignore rules (e.g., build artifacts, local ledgers).

---

## How to Clone

### Clone the entire portfolio:

To get all projects at once:

```bash
git clone git@github.com:AleksandarSourceCode/blockchain-projects.git
```

### Clone a specific project only:

```bash
git clone --filter=blob:none --sparse git@github.com:AleksandarSourceCode/blockchain-projects.git
cd blockchain-projects
git sparse-checkout set solana-projects/solana-config-program
```

---

## Global Prerequisites

Make sure the following tools are installed:

- **Git**
- **Rust**
- **Node.js**
- **npm or Yarn**
- **Solana CLI**
- **Anchor CLI**

Specific project versions and additional dependencies are detailed in each project's README.

---

## Contributing

This repository is primarily a personal portfolio, but suggestions
and improvements are welcome via issues or pull requests.

---
