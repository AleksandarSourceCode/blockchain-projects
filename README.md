# Blockchain Projects Portfolio

**Author:** Aleksandar Joksić

## Overview

This repository serves as a **professional portfolio** of my blockchain development work. It is designed as a **monorepo** to provide an organized overview of all projects, including programs, tests, and documentation.  
The portfolio primarily focuses on **Solana-based projects**, with future plans for Ethereum and other EVM-compatible platforms.

---

## Project Structure

- `solana-projects/` – Contains Solana-based programs, each organized in its own directory.
- `ethereum-projects/` – (Planned) Future Ethereum and EVM-based projects.

---

## Projects Overview

| Project Name                                                             | Platform | Status  |
| ------------------------------------------------------------------------ | -------- | ------- |
| [solana-config-program](solana-projects/solana-config-program/README.md) | Solana   | Active  |
| [solana-escrow-program](solana-projects/solana-escrow-program/README.md) | Solana   | Active  |
| [solana-token-manager](solana-projects/solana-token-manager/README.md)   | Solana   | Active  |
| ethereum-example                                                         | Ethereum | Planned |

---

## How to Navigate

Each project inside the folders is self-contained with its own:

- `src/` or `programs/` – The core smart contract logic.
- `tests/` – Integration and unit tests.
- `.gitignore` – Project-specific ignore rules (e.g., ignoring `target/` folders).

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

Contributions are welcome! Open issues or pull requests for improvements, new projects, or bug fixes.

---
