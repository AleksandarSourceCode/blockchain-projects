# Solana Token Manager

**Solana Token Manager** is an **Anchor-based Solana program** designed to **explore, compare, and demonstrate the practical differences between SPL Token and Token-2022 standards**.

The primary goal of this project is **educational and architectural**: to clearly show how instructions, authorities, metadata handling, and token behavior differ between the two standards, while maintaining **clean, production-grade program structure**.

---

## 🎯 Project Goal

This program was written to:

- Understand **instruction-level differences** between SPL Token and Token-2022
- Compare **authority models** and edge cases
- Explore **metadata handling** (Metaplex vs Metadata Pointer)
- Demonstrate **clean separation of token logic**
- Serve as a **reference implementation** for real-world Solana token programs

While the code follows production-quality patterns, the project is intentionally focused on **clarity, correctness, and learning**, rather than being a turnkey on-chain product.

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
- Manage mint- and account-level authorities
- Unified token operations via `token_interface`

---

## 🧠 Design Principles

- **Human-readable token amounts**  
  All mint, transfer, and burn instructions accept user-friendly values and internally scale using mint decimals.

- **Explicit authority handling**  
  Authority changes are type-safe, validated, and intentionally verbose to highlight behavioral differences.

- **No persistent custom program state**  
  The program operates directly on token and metadata accounts without introducing additional PDAs.

- **Clear separation of concerns**
  - SPL Token logic
  - Token-2022 logic
  - Universal token operations
  - Shared data types and enums

This structure makes the differences between token standards easy to trace and reason about.

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

- **`instructions/`** – On-chain instruction handlers
- **`types/`** – Serializable enums and argument structs (IDL-friendly)
- **`universal/`** – Shared token operations for SPL and Token-2022
- **`errors.rs`** – Custom program errors

---

## 🧪 Testing Strategy

This project uses **Anchor + ts-mocha** with a local validator.

### Testing Philosophy

- Tests intentionally run **against a shared validator state**
- Token mints and metadata are created once and reused
- This enables:
  - Easier debugging
  - Explorer-based inspection
  - Realistic authority and metadata workflows

### Test Types

- **Automated tests**
  - Balance checks
  - Authority validation
  - Account state assertions

- **Manual / Explorer tests**
  - Transaction signatures are printed
  - Instructions can be inspected in Solana Explorer

Test files are controlled by naming (*.test.ts) and executed via Anchor.

---

## ▶️ Running Tests

```bash
anchor test
```

`Anchor.toml` is configured to:
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

Authority instructions validate whether a mint or token account is required based on the authority type.

---

## 🧾 Metadata Support

### SPL Token
- Uses the Metaplex Metadata program
- PDA-derived metadata accounts

### Token-2022
- Uses the metadata pointer extension
- Metadata stored directly in the mint account
- Automatic rent recalculation when metadata grows

This contrast is a key focus of the project.

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

- Learning reference for SPL vs Token-2022 differences
- Token factories and admin-controlled tokens
- Metadata-rich token experiments
- Portfolio demonstration of real-world Solana development
- Base for future production token systems

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

- This project prioritizes **clarity over abstraction**
- Designed as both an **educational reference** and a **production-quality codebase**
- No off-chain dependencies beyond metadata URIs

