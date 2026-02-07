# Solana Price Oracle

## Description

A Solana on-chain program built with **Anchor**  
that reads verified price data from **Pyth** using the pull model.

The program supports both single-feed and batch price reads,  
and emits structured events for off-chain use.

---

## What This Project Demonstrates

- Reading verified Pyth price updates on Solana
- Single-feed vs batch price queries in one transaction
- Event-based reporting of oracle data
- Deterministic validation of price freshness
- Clean oracle instruction design with minimal state

---

## Structure

```
programs/solana-price-oracle/
├── src/
│   ├── instructions/
│   │   ├── get_price.rs
│   │   └── get_prices.rs
│   ├── events.rs
│   ├── constants.rs
│   ├── errors.rs
│   └── lib.rs
```

---

## Instructions / API

| Instruction  | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| `get_price`  | Reads a verified Pyth price for a single feed and emits an event |
| `get_prices` | Reads verified prices for multiple feeds and emits events        |

---

## Usage

Install dependencies:

```bash
npm install
```

Run program tests using Anchor:

```bash
anchor test
```

---

## Environment / Versions

- Solana CLI: 1.18.17
- Anchor CLI: 0.30.1
- Rust: 1.89.x
- Node.js: 20+ (for running tests)

---

## Notes

- The program uses verified Pyth price updates and enforces freshness checks.
- Price data is reported via events rather than stored on-chain.
- Batch reads reduce transaction overhead when querying multiple feeds.
- This project intentionally uses older Solana and Anchor versions  
  due to compatibility requirements of `pyth-solana-receiver-sdk`.
