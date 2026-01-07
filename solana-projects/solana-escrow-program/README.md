# Solana Escrow Program

A Solana program built with **Anchor** that demonstrates a simple, atomic
token swap between two users using a vault controlled by a Program Derived Address (PDA).

The program allows a maker to create an offer by locking tokens into a vault,
and a taker to accept the offer, exchanging tokens in a single transaction.
Token custody is enforced via PDA-based authority and the **SPL Token interface
(compatible with both legacy SPL Token and Token-2022 programs)**,
without maintaining complex on-chain escrow state.

---

## **Program Account Structure**

This diagram shows the relationship between the program's accounts (PDAs) and users:

    ┌──────────────────────────┐
    │       Offer (PDA)        │
    │--------------------------│
    │ id: u64                  │
    │ maker: Pubkey            │
    │ token_mint_a: Pubkey     │
    │ token_mint_b: Pubkey     │
    │ token_amount_b: u64      │
    │ bump: u8                 │
    └─────────┬────────────────┘
              │
    holds offered tokens in vault
              │
    ┌─────────▼──────────────┐
    │       Vault ATA        │
    │ (TokenAccount for A)   │
    └────────────────────────┘

---

### **Notes**

- Each **Offer** is represented by a PDA derived from  
  `[OFFER_SEED, maker.key(), offer_id]`.
- The maker initializes an offer by locking Token A into a vault
  (an associated token account owned by the offer PDA).
- The taker accepts the offer by atomically:
  - transferring Token B to the maker
  - receiving Token A from the vault
- After successful execution:
  - the **vault token account is closed** and its SOL rent is returned to the taker
  - the **offer PDA account is closed** and its SOL rent is returned to the maker

---

## **Instructions Overview**

| Instruction  | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `make_offer` | Create a new offer, locking Token A in a vault (maker only)    |
| `take_offer` | Accept an existing offer, exchanging tokens atomically (taker) |

---

## **Features**

- **Deterministic PDAs**: Each offer is represented by a predictable PDA derived from
  `[OFFER_SEED, maker.key(), offer_id]`, ensuring uniqueness and determinism.
- **Atomic Token Swap**: Uses CPI calls to the SPL Token / Token-2022 program to perform
  an all-or-nothing token exchange between maker and taker.
- **Vault Management**: Offered tokens are locked in a vault (ATA owned by the offer PDA)
  until the offer is either accepted or closed.
- **Input Validation & Errors**: Token amounts and account relationships are validated
  before transfers, with explicit custom errors (e.g. `InvalidAmountA`, `InvalidAmountB`).
- **Clean Architecture**: Instructions, state, constants, and errors are cleanly separated,
  following Anchor best practices for readability and maintainability.

---

## **Usage**

1. Maker creates an offer and locks tokens.
2. Taker accepts the offer and tokens are swapped atomically.
3. Vault and offer accounts are closed after completion.

---

## **Running Tests**

Automated tests are included for both `make_offer` and `take_offer` instructions.

- Minimal functional tests ensure token balances are correctly updated.
- Tests are written in TypeScript and run via **Anchor test suite**.
- The `test` script runs all test files ending with `.test.ts`

---

## **Getting Started**

```bash
# Build the program
anchor build

# Run tests
anchor test
```

---

## Environment / Versions

The following versions were used for the `solana-escrow-program` project:

- **Git:** 2.43.0
- **Rust:** 1.91.1
- **Cargo:** 1.91.1
- **Node.js:** 24.10.0
- **npm:** 11.6.1
- **Yarn:** 1.22.22
- **Solana CLI:** 2.3.13
- **Anchor CLI:** 0.32.1

---
