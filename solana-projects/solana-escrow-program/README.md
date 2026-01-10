# Solana Escrow Program

## Description

A Solana on-chain program built with **Anchor**
that implements a simple, atomic token swap mechanism between two users.

It demonstrates escrow-style swaps
using PDAs and vault accounts,
without maintaining complex on-chain state.

---

## What This Project Demonstrates

- Deterministic PDA-based escrow offers
- Atomic token swaps using CPI calls
- Vault control via PDA-owned token accounts
- Clean separation of instructions and state

---

## Structure

```
programs/solana-escrow-program/
├── src/
│   ├── instructions/
│   │   ├── make_offer.rs
│   │   └── take_offer.rs
│   ├── state/
│   │   └── offer.rs
│   ├── constants.rs
│   ├── errors.rs
│   └── lib.rs
```

---

## Instructions / API

| Instruction  | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `make_offer` | Create a new escrow offer and lock tokens into a vault       |
| `take_offer` | Accept an offer and swap tokens atomically                   |

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

- Each offer is represented by a PDA derived from `[OFFER_SEED, maker, offer_id]`
- Offered tokens are held in a vault ATA owned by the offer PDA
- On successful execution, both the vault account and offer account are closed
- Token transfers are compatible with SPL Token and Token-2022 via the token interface
