# Solana Log Lab

**Solana Log Lab** is a small but comprehensive Anchor-based program that demonstrates **all major logging patterns on Solana**, together with **reliable testing strategies** for each type.

This project is intentionally educational but written in a **production-grade style**, avoiding flaky patterns and highlighting how Solana logging actually works at runtime.

---

## ✨ What This Project Demonstrates

This repository demonstrates:

- Plain runtime logs (`msg!`)
- Structured Anchor events (`emit!`)
- Error-based logs (`require!`)
- CPI runtime logs (`invoke` / `success`)
- Persistent on-chain logs (state-based records)

Each pattern has a **dedicated instruction** and a **corresponding test**.

---

## 📁 Project Structure

```
src/
├── constants.rs
├── errors.rs
├── events.rs
├── instructions/
│   ├── log_plain.rs
│   ├── log_event.rs
│   ├── log_error.rs
│   ├── log_cpi.rs
│   └── log_state.rs
├── state/
│   └── persistent_log.rs
└── lib.rs
```

```
tests/
├── helpers/
│   └── confirm-and-fetch-tx.ts
├── log-plain.test.ts
├── log-event.test.ts
├── log-error.test.ts
├── log-cpi.test.ts
└── log-state.test.ts
```

---

## 🧪 Logging Patterns Explained

### Plain Logs (`msg!`)
Human-readable runtime logs intended for debugging.

### Structured Events (`emit!`)
Serialized into `Program data` logs and decoded off-chain using the IDL.

### Error Logs (`require!`)
Errors abort execution but still emit logs that can be inspected.

### CPI Runtime Logs
Generated implicitly by the Solana runtime during cross-program invocations.

### Persistent On-Chain Logs
State-based records stored in accounts for audit trails and historical queries.

---

## 🧠 Design Notes

- Anchor events are **not on-chain events**, but structured runtime logs emitted via `Program data`.
- Manual decoding of event logs is preferred in tests and indexers for determinism and reliability.
- WebSocket listeners are best suited for frontend and real-time UX use cases.

---

## 🧪 Running Tests

```bash
anchor test
```

---

## 🎯 Intended Audience

- Solana developers interested in logging and runtime internals
- Anchor users writing robust and deterministic tests
- Backend engineers building off-chain indexers

---

## 📌 Final Note

**Solana has no on-chain events — only logs.**  
Everything else is tooling built on top of runtime logs.

---
