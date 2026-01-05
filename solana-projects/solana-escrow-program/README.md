# Solana Escrow Program

A Solana program built with **Anchor** for creating and accepting token swap offers between users.  
This project demonstrates **deterministic PDAs, secure token transfers, and safe escrow management** on Solana.

The program allows a maker to create an offer by locking tokens into a vault, and a taker to accept the offer, exchanging tokens atomically. All account states are managed securely via **Anchor PDAs and the SPL token program**.

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

- Each **Offer** is a PDA derived from `[OFFER_SEED, maker.key(), offer_id]`.
- Maker initializes the offer by locking Token A into a vault.
- Taker accepts the offer by transferring Token B to maker and receiving Token A.
- After completion, the vault is closed and SOL rent goes to the taker.

---

## **Instructions Overview**

| Instruction  | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `make_offer` | Create a new offer, locking Token A in a vault (maker only)    |
| `take_offer` | Accept an existing offer, exchanging tokens atomically (taker) |

---

## **Features**

- **Deterministic PDAs**: Each offer uses a predictable PDA address derived from maker and offer ID.
- **Atomic Token Swap**: Uses SPL `transfer_checked` CPI calls to ensure safe token transfers.
- **Vault Management**: Tokens are held in a PDA vault until the offer is accepted.
- **Error Handling**: Validates token amounts before transfers (`InvalidAmountA`, `InvalidAmountB`).
- **Clean Architecture**: Instructions, state, constants, and errors are separated following **Anchor best practices**.

---

## **Usage**

1. Deploy the program on Solana using **Anchor**.
2. Maker creates an offer via `make_offer`.
3. Taker accepts an offer via `take_offer`.
4. Token swaps are executed atomically; vault is closed automatically after completion.

---

## **Running Tests**

Automated tests are included for both `make_offer` and `take_offer` instructions.

- Minimal functional tests ensure token balances are correctly updated.
- Tests are written in TypeScript and run via **Anchor test suite**.
- The `test` script runs all test files ending with `.test.ts`

---

## **Getting Started (Optional)**

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
