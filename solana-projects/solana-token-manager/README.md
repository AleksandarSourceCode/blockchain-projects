# Solana Token Manager

A production-ready **Solana program built with Anchor** that provides a unified interface for managing **SPL tokens** and **Token-2022 tokens**, including mint creation, authority management, metadata updates, and common token operations.

This project demonstrates **clean program architecture**, **safe CPI usage**, and **practical handling of both legacy SPL tokens and Token-2022 extensions**.

---

## ✨ Features

### Supported Token Standards
- ✅ SPL Token
- ✅ Token-2022 (with metadata pointer extension)

### Core Functionality
- Create token mints (SPL & Token-2022)
- Initialize and update token metadata
- Mint tokens (human-readable amounts)
- Transfer tokens
- Burn tokens
- Manage mint and account authorities
- Unified token operations via `token_interface`

---

## 🧠 Design Principles

- **Human-readable token amounts**  
  All mint, transfer, and burn instructions accept amounts in user-friendly units and internally scale using mint decimals.

- **Explicit authority handling**  
  Authority changes are type-safe and validated at runtime.

- **No persistent program state**  
  The program does not store custom on-chain accounts; it operates directly on token and metadata accounts.

- **Clear separation of concerns**
  - SPL logic
  - Token-2022 logic
  - Universal token operations
  - Shared data types

---

## 📂 Project Structure

```
src/
├── constants.rs
├── errors.rs
├── instructions/
│   ├── spl_token/
│   ├── token_2022/
│   └── universal/
├── types/
└── lib.rs
```

- **`instructions/`** – All on-chain instruction handlers  
- **`types/`** – Serializable enums and argument structs (IDL-friendly)  
- **`universal/`** – Token operations shared by SPL and Token-2022  
- **`errors.rs`** – Custom program errors  

---

## 🧪 Testing Strategy

This project uses **Anchor + ts-mocha** with a local validator.

### Test Philosophy

- Tests intentionally run **against a shared validator state**
- Token mints and metadata are created once and reused
- This allows:
  - Easier debugging
  - Explorer verification
  - Realistic authority and metadata flows

### Test Types

- **Automatic tests**
  - Assert balances, authorities, and account state
  - Suitable for regression testing

- **Manual / Explorer tests**
  - Print transaction signatures
  - Allow inspection in Solana Explorer

Test files are controlled by naming (`*.test.ts`) and executed via Anchor.

---

## ▶️ Running Tests

```bash
anchor test
```

The validator is configured in `Anchor.toml` to:
- Use a persistent test ledger
- Clone the Metaplex Metadata program
- Avoid unnecessary redeployments

---

## 🔐 Authority Management

Supported authority operations include:

### Mint-level
- Mint authority
- Freeze authority
- Close mint (Token-2022)
- Metadata authority (Token-2022)

### Account-level
- Token account owner
- Close account

Authority instructions validate whether a **mint or token account** is required based on the authority type.

---

## 🧾 Metadata Support

### SPL Token
- Uses Metaplex Metadata program
- PDA-derived metadata accounts

### Token-2022
- Uses the metadata pointer extension
- Metadata stored directly in the mint account
- Automatic rent recalculation when metadata grows

---

## 🛠 Tech Stack

- **Solana**
- **Anchor**
- **SPL Token**
- **Token-2022**
- **Metaplex Metadata**
- **TypeScript (ts-mocha tests)**

---

## 🎯 Use Cases

- Token factories
- Admin-controlled token systems
- Metadata-rich tokens
- Learning reference for SPL vs Token-2022 differences
- Portfolio demonstration of real-world Solana development

---

## 🧩 Environment

The following versions were used during development and testing:

- **Node.js:** v24.10.0
- **npm:** v11.6.1
- **Yarn:** v1.22.22

- **Rust:** v1.92.0
- **Cargo:** v1.92.0

- **Solana CLI:** v2.3.13
- **Anchor CLI:** v0.32.1

---

## 📌 Notes

- This project focuses on **correctness, clarity, and maintainability**
- Designed for **educational and production reference**
- No off-chain dependencies beyond metadata URIs

---
