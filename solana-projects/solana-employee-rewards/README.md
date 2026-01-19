# Solana Employee Rewards

## Description

A Solana on-chain program built with **Anchor**  
that implements a complete **employee reward and recognition system**  
based on task execution and annual performance cycles.

The program combines:

- task-based scoring,
- yearly settlements,
- fungible reward and compensation tokens,
- and rank-based _Member Status NFTs_ used as identity and privilege badges.

---

## What This Project Demonstrates

- On-chain modeling of a real-world reward system
- Annual lifecycle management (open → earn → close → settle)
- Task-based scoring with admin verification
- Separation of earned rewards vs discretionary compensation
- Treasury-backed token redemption
- Rank-based NFT issuance from a verified collection
- Clear separation of admin and employee responsibilities
- Conservative pause mechanism for system safety
- Extensive domain and end-to-end testing

---

## Core Concepts

### Annual Reward Cycle

Each reward year is explicitly opened by an admin and defines:

- the active year identifier,
- rank definitions and thresholds,
- reward configuration scoped to that year.

At the end of the year:

- task earning is closed,
- employees are settled,
- rewards are minted based on final results.

---

### Task Lifecycle

Tasks are defined globally by an admin.

Employees:

1. start available tasks,
2. submit completed tasks.

Admins:

- approve tasks (recording completion),
- or reject tasks (freeing the assignment).

Approved tasks generate points that employees may later claim.

---

### Employee Model

Employees must be registered per year.

The program tracks:

- task assignments,
- completed tasks,
- accumulated points,
- settlement state.

This ensures strict isolation between reward years.

---

### Treasury Model

A treasury PDA is created for the program.

- The treasury owns an associated token account for a configurable payout mint
  (e.g. USDC, USDT).
- Treasury funding is performed **externally**.
- All redemptions transfer tokens from the treasury to users.

---

## Reward Types

### Reward Token (Fungible)

- Earned through approved tasks during a reward year
- Minted after annual settlement
- Redeemable **1:1** for the treasury payout token

---

### Member Status NFT

- Minted once per employee per year
- Rank-based, using thresholds defined when opening the year
- Used as an identity and privilege badge

Member Status NFTs are **intended to function as non-transferable**.  
Transfer restrictions are not enforced at the token level.

---

### Special Token (Fungible)

- Not tied to annual cycles or task points
- Used for exceptional rewards or compensation cases
- Can be minted to any wallet
- Redeemable **1:2** for the treasury payout token

---

## System Pause Behavior

The program implements a **full pause mechanism**.

When the system is paused:

- all on-chain actions are blocked,
- no tasks can be started or submitted,
- no points can be claimed,
- no tokens or NFTs can be minted or redeemed.

This design prioritizes **safety, simplicity, and auditability**.

---

## Instruction Domains / API

### Global

- Initialize global configuration
- Update admin, pause state, and payout mint

### Year

- Open reward year with rank definitions
- Close year to stop task earning
- Settle employee yearly results

### Task

- Create task definitions
- Deactivate tasks
- Start tasks
- Submit tasks
- Approve or reject tasks

### Employee

- Register employee for a year
- Update employee status
- Claim points from approved tasks

### Rewards

#### Reward Token

- Initialize yearly reward token mint
- Mint reward tokens after settlement
- Redeem reward tokens from the treasury

#### Member Status NFT

- Initialize yearly NFT collection
- Mint rank-based NFTs
- Verify NFTs against the collection

#### Special Token

- Initialize special token mint
- Mint special tokens
- Redeem special tokens from the treasury

---

## Project Structure

```
programs/solana-employee-rewards/
├── src/
│   ├── instructions/
│   │   ├── global/
│   │   ├── year/
│   │   ├── task/
│   │   ├── employee/
│   │   └── reward/
│   ├── helpers/
│   ├── state/
│   ├── types/
│   ├── constants.rs
│   ├── errors.rs
│   ├── events.rs
│   └── lib.rs
```

---

## Tests

The test suite is divided into:

- **Domain tests**
  - global configuration
  - tasks
  - employees
  - yearly settlement
  - reward minting and redemption
- **End-to-end tests**
  - full lifecycle flows
  - permission checks
  - paused system behavior

Test helpers cover:

- PDA derivation
- token minting and funding
- compute unit tracking
- reusable fixtures

---

## Environment / Versions

- Solana CLI: 2.3.x
- Anchor CLI: 0.32.x
- Rust: 1.92.x
- Node.js: 20+

---

## Notes

- This project is designed as a complete on-chain reward system  
  rather than a generic task management tool.
- The focus is on correctness, explicit state transitions, and safety.

---

## Possible Extensions

- Introducing multiple pause modes (e.g. full vs operational pause),  
  allowing task execution to continue while financial operations are frozen.
- Supporting a backup administrator role to allow controlled recovery  
  of administrative authority in case of key loss.
- Supporting delegated administrative roles for task approval and reward management.
- Enforcing non-transferable _Member Status NFTs_ using Token-2022  
  non-transferable extensions.
- Supporting non-stable reward tokens with configurable normalization factors  
  that map token amounts to a USD-equivalent value, optionally backed by price oracles.
- Supporting multiple reward valuation strategies for converting reward tokens  
  into treasury payout assets (fixed-rate, factor-based, or oracle-driven).

---
