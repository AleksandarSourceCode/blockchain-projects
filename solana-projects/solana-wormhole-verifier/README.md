# Solana Wormhole VAA Verifier

## Description

A **Solana on-chain verification program** built with **Anchor (Rust)**  
that validates **Wormhole VAAs (Verifiable Action Approvals)** and persists  
a **VerifiedMessage** account on Solana.

The project is intentionally scoped to **VAA signature verification and message finalization only**  
and is designed as a **reusable verification primitive** that can be embedded into  
larger cross-chain systems (bridges, relayers, reward engines, governance pipelines, etc.).

The verifier delegates cryptographic signature checks to the official  
**Wormhole VAA verification shim**, while enforcing deterministic PDA-based storage  
for verified messages.

---

## What This Project Demonstrates

- Strict Wormhole VAA parsing (header, signatures, body)
- Guardian signature verification via Wormhole verification shim (CPI)
- Deterministic PDA derivation for verified messages
- Atomic verification and message finalization in a single instruction
- External-program interaction via IDL-loaded Anchor `Program`
- Test-only cleanup instructions for devnet workflows
- End-to-end verification testing using real VAA data
- Clean E2E orchestration (fetch → cleanup → verify)

---

## High-Level Verification Flow

```text
        OFF-CHAIN                         ON-CHAIN (SOLANA)
+----------------------+        +----------------------------------+
| Wormhole Guardians   |        |                                  |
| sign VAA body        |        |  verify_vaa instruction          |
+----------+-----------+        |                                  |
           |                    |  - parse VAA body                |
           |                    |  - verify signatures (CPI)       |
           v                    |  - derive verified_message PDA   |
+----------------------+        |  - persist verified state        |
| VAA (signed message) +------->+----------------------------------+
+----------------------+
           |
           v
+----------------------+
|  VAA Fetcher (TS)    |
|  - fetch from API    |
|  - store JSON        |
+----------------------+
```

Only the **VAA body** is hashed and verified;  
headers and signatures are treated as transport metadata.

---

## Program Architecture

```text
programs/solana-wormhole-verifier/src
├── lib.rs                # Program entrypoint
├── constants.rs          # Seeds, limits, static identifiers
├── errors.rs             # Custom program errors
├── state
│   └── verified_message.rs
├── instructions
│   ├── verify_vaa.rs     # Main verification logic
│   ├── close_verified_message.rs
│   └── include_verified_message_idl.rs
```

### External Dependencies

- **wormhole_verify_vaa_shim**
  - Used via CPI for guardian signature verification
  - Loaded in tests using its published IDL

---

## VerifiedMessage Account

Each successfully verified VAA results in a deterministic PDA:

```text
seeds = [
  "verified_message",
  emitter_chain,
  emitter_address,
  sequence
]
```

Stored data includes:

- emitter chain ID
- emitter address
- sequence number
- payload hash
- raw payload
- verification slot & timestamp

---

## Tests

The test suite focuses on **full verification flows using real VAA data**.

### End-to-End Verification Tests

Located under `tests/`:

- Load VAA JSON produced by the fetcher
- Parse header, signatures, and body
- Post guardian signatures to Wormhole shim
- Invoke `verify_vaa`
- Assert successful PDA creation
- Clean up temporary signature accounts
- (Optional) debug-print verified message state

Tests interact with **two on-chain programs**:

- This verifier program
- Wormhole verification shim (via IDL)

---

## VAA Fetcher

A standalone **TypeScript fetcher** retrieves VAA JSON data from
Wormhole Scan APIs.

### Features

- Infinite daemon mode (watcher)
- Bounded fetch mode via `MAX_FETCHES`
- Deterministic JSON output directory
- Sequence persistence across runs

---

## E2E Orchestration

A dedicated orchestration script executes the full pipeline:

```text
fetch VAAs → cleanup state → run verification tests
```

### Script Responsibilities

- Execute VAA fetcher in bounded mode
- Clean up previously verified messages (test-only instruction)
- Run Anchor verification tests

This keeps **environment setup**, **runtime state**, and **tests**
cleanly separated.

---

## Running the Project

### Install Dependencies

```bash
npm install
```

### Build Program

```bash
anchor build
```

### Run Full E2E Flow (Devnet)

```bash
MAX_FETCHES=1 npm run e2e
```

---

## Environment

- Rust + Anchor 0.32.x
- Solana CLI (devnet)
- Node.js 20+
- TypeScript (tsx)
- Wormhole verification shim (external program)

---

## Notes

- `close_verified_message` is **test-only** and must never be enabled in production
- Program logic is intentionally minimal and audit-friendly
- Designed as a **verification primitive**, not a full bridge
- Test VAAs are sourced from the **Ethereum Employee Voting** project

---

## Possible Extensions

- Cross-program callbacks after verification
- Integration into reward / governance pipelines
