# Solana Log Lab

## Description

A Solana on-chain program built with **Anchor**  
that demonstrates the main logging patterns  
available on Solana.  

The project focuses on how logs are produced  
at runtime and how they can be reliably tested  
and inspected.  

---

## What This Project Demonstrates

- Plain runtime logs using `msg!`
- Structured Anchor events emitted via `emit!`
- Error-based logs produced by `require!`
- Implicit runtime logs generated during CPI calls
- Persistent on-chain logs stored in program state

Each logging pattern is implemented as a dedicated instruction.

---

## Structure

```
programs/solana-log-lab/
├── src/
│   ├── instructions/
│   │   ├── log_plain.rs
│   │   ├── log_event.rs
│   │   ├── log_error.rs
│   │   ├── log_cpi.rs
│   │   └── log_state.rs
│   ├── state/
│   │   └── persistent_log.rs
│   ├── events.rs
│   ├── constants.rs
│   ├── errors.rs
│   └── lib.rs
```

---

## Instructions / API

| Instruction   | Description                                             |
| ------------- | ------------------------------------------------------- |
| `log_plain`   | Emits plain runtime logs using `msg!`                   |
| `log_event`   | Emits a structured Anchor event via `emit!`             |
| `log_error`   | Emits logs by intentionally triggering an Anchor error  |
| `log_cpi`     | Produces runtime logs via a CPI call                    |
| `log_state`   | Writes a persistent log entry into program state        |

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

- Solana does not have native on-chain events; all logging is based on runtime logs.
- Anchor events are serialized into program logs and decoded off-chain using the IDL.
- Persistent logs are stored in accounts and can be queried for audit or history use cases.
- Manual log inspection and decoding is preferred for deterministic testing.
