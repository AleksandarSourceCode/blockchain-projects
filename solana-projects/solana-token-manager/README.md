# Solana Token Manager

## Description

A Solana on-chain program built with **Anchor** that compares and demonstrates the practical differences
between **SPL Token** and **Token-2022** standards.
The project focuses on instruction design, authority management, and metadata handling across both token programs.

---

## What This Project Demonstrates

- Instruction-level differences between SPL Token and Token-2022
- Mint-level vs account-level authority models
- Metadata handling via Metaplex (SPL) vs metadata pointer (Token-2022)
- Unified token operations across different token standards
- Human-readable token amounts with internal decimal scaling
- Clean separation of SPL, Token-2022, and universal logic

---

## Structure

```
programs/solana-token-manager/
├── src/
│   ├── instructions/
│   │   ├── spl_token/
│   │   ├── token2022/
│   │   └── universal/
│   ├── types/
│   │   ├── authority/
│   │   └── metadata/
│   ├── constants.rs
│   ├── errors.rs
│   └── lib.rs
```

---

## Instructions / API

### SPL Token

- `create_spl_token` — Creates an SPL token mint and initializes metadata
- `set_mint_authority_spl_token` — Updates SPL mint-level authorities
- `set_authority_spl_token` — Updates SPL mint or token account authorities
- `update_metadata_spl_token` — Updates SPL token metadata via Metaplex

### Token-2022

- `create_token2022` — Creates a Token-2022 mint with metadata extensions
- `set_mint_authority_token2022` — Updates Token-2022 mint-level authorities
- `set_authority_token2022` — Updates Token-2022 mint or token account authorities
- `update_metadata_token2022` — Updates Token-2022 metadata fields

### Universal

- `mint_token_universal` — Mints tokens for SPL or Token-2022 mints
- `transfer_token_universal` — Transfers tokens for SPL or Token-2022 mints
- `burn_token_universal` — Burns tokens for SPL or Token-2022 mints

---

## Usage

Run program tests using Anchor:

```bash
anchor test
```

---

## Environment / Versions

- Solana CLI: 2.3.x
- Anchor CLI: 0.32.x
- Rust: 1.92.x
- Node.js: 20+ (for running tests)

---

## Notes

- The program operates directly on token and metadata accounts and does not introduce custom program-owned PDAs.
- Universal authority instructions require both mint and token accounts due to Anchor account deserialization requirements, even when only one is modified.
- Token-2022 metadata is stored directly in the mint account via the metadata pointer extension
- The project prioritizes clarity and explicit behavior over abstraction
