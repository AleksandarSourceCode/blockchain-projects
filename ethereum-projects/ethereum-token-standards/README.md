# Ethereum Token Standards

## Description

A collection of **Ethereum smart contracts** built with **Solidity,  
Hardhat, and OpenZeppelin**  
that explores the most widely used **token standards** through both:

- **manual reference implementations**, and
- **production-oriented OpenZeppelin-based contracts**.

The project is designed as a **learning and comparison showcase**,  
demonstrating how each standard works internally  
and how it is typically implemented in real-world deployments.

---

## What This Project Demonstrates

- Core mechanics of ERC20, ERC721, and ERC1155 standards
- Differences between manual implementations and OpenZeppelin
  abstractions
- Feature layering vs global behavior changes across standards
- Owner-controlled minting and burning patterns
- Metadata handling and NFT visibility
- Batch operations in ERC1155
- Separation of unit-level and integration-level testing

---

## Covered Standards

### ERC20 --- Fungible Tokens

Implemented in two forms:

- **SimpleERC20**
  - self-contained ERC20 reference implementation
  - balances, transfers, allowances
  - token metadata (name, symbol, decimals)
  - owner-controlled minting and burning (non-standard extensions)
- **CappedPausableERC20**
  - ERC20 with explicit supply cap enforcement
  - global pause mechanism
  - owner-gated mint and burn

OpenZeppelin equivalent:

- **OZERC20**
  - ERC20 with cap, pause control, and burn support
  - built using audited OpenZeppelin components

---

### ERC721 --- Non-Fungible Tokens (NFTs)

Implemented in layered form:

- **SimpleERC721**
  - core ERC721 ownership, approvals, and transfer logic
- **ERC721WithURI**
  - extension adding per-token metadata (`tokenURI`)
  - enables real NFT rendering in wallets and marketplaces

OpenZeppelin equivalent:

- **OZERC721**
  - ERC721 with URI storage
  - burnable NFTs
  - owner-controlled minting
  - ERC2981 royalty support

---

### ERC1155 --- Multi-Token Standard

Implemented using OpenZeppelin only:

- **OZERC1155**
  - generic ERC1155 foundation
  - owner-controlled minting
  - burnable tokens (single and batch)
  - batch minting and batch transfers
  - base URI using `{id}` substitution

This implementation is intentionally generic and suitable  
as a base for gaming items, reward systems, or mixed-asset collections.

---

## Design Philosophy

### Manual Contracts

Manual contracts are written **from scratch** and are intentionally:

- self-contained
- explicit
- easy to read and reason about

They serve as **reference implementations** and are not intended for
deployment.

Manual contracts demonstrate:

- how each standard works internally
- why certain patterns exist
- what responsibilities the standard enforces

---

### OpenZeppelin Contracts

OpenZeppelin contracts represent **production-oriented  
implementations**.

They:

- rely on audited OpenZeppelin libraries
- follow real-world deployment patterns
- include only features commonly used in practice

Deployment scripts are provided **only** for OpenZeppelin contracts.

---

## Project Structure

### Contracts

    contracts/
    ├── manual
    │   ├── erc20
    │   │   ├── SimpleERC20.sol
    │   │   └── CappedPausableERC20.sol
    │   └── erc721
    │       ├── SimpleERC721.sol
    │       └── ERC721WithURI.sol
    └── openzeppelin
        ├── erc20
        │   └── OZERC20.sol
        ├── erc721
        │   └── OZERC721.sol
        └── erc1155
            └── OZERC1155.sol

---

## Tests

### Solidity Unit Tests (`.t.sol`)

- validate internal logic and invariants
- focus on edge cases and permissions
- written close to the contract logic

### Hardhat Integration Tests (`.ts`)

- interact with contracts through ABI
- simulate real user behavior
- validate events, state transitions, and access control
- use Hardhat + Ethers v6

---

## Deployment

Deployment scripts are included **only for OpenZeppelin contracts**,  
as they represent production-ready code.

    scripts/deploy/
    ├── deploy-erc20.ts
    ├── deploy-erc721.ts
    └── deploy-erc1155.ts

Minting can be performed directly through **Etherscan**  
after contract verification.

---

## Notes

Deployment scripts require a local `.env` file:

```
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

Variables are loaded as environment variables and are not committed.
