# Solana Price Oracle (Pyth Pull)

A minimal Solana oracle program built with **Anchor**, designed to fetch, validate, and emit Pyth price data using the **Pyth Pull model**.

The primary goal of this project is to **experiment with oracle integration on Solana**, understand how Pyth price updates work, and establish clean, testable oracle patterns for both single-feed and batch price reads.

---

## ✨ Features

- Reads verified Pyth price updates (`PriceUpdateV2`)
- Supports **single-feed** and **batch** price reads
- Validates price freshness with a configurable maximum age
- Emits structured oracle output via Anchor `emit!` events
- Uses `remaining_accounts` for dynamic batch inputs
- Clean, modular program structure
- Fully tested using Anchor + TypeScript

---

## 📁 Project Structure

```
solana-price-oracle
├── Cargo.toml
└── src
    ├── constants.rs
    ├── errors.rs
    ├── events.rs
    ├── instructions
    │   ├── get_price.rs
    │   ├── get_prices.rs
    │   └── mod.rs
    └── lib.rs
```

---

## 🧠 How It Works

### Single Price Read (`get_price`)

1. A client calls `get_price` with:
   - A Pyth feed ID (hex string)
   - The corresponding `PriceUpdateV2` account
2. The program:
   - Parses and validates the feed ID
   - Reads the verified price update
   - Ensures the price is recent enough
3. The verified price is:
   - Emitted as a structured `PriceReported` event

---

### Batch Price Read (`get_prices`)

1. A client calls `get_prices` with:
   - A list of Pyth feed IDs
   - A matching list of `PriceUpdateV2` accounts passed via `remaining_accounts`
2. The program enforces a **1:1 mapping** between feed IDs and accounts
3. For each feed:
   - The price is validated and read
   - A `PriceReported` event is emitted

All prices are read within a **single transaction**, ensuring consistency.

---

## 📤 Oracle Output

The program emits a structured Anchor event for each price read:

```rust
PriceReported {
    feed_id: [u8; 32],
    price: i64,
    exponent: i32,
    publish_time: i64,
}
```

This makes the oracle output:
- Deterministic and IDL-decodable
- Easy to consume in tests, frontends, or indexers
- Clearly separated from human-readable logs

---

## 🧪 Testing

Tests are written in **TypeScript** using the Anchor testing framework.

They verify:
- Successful execution of both `get_price` and `get_prices`
- Correct handling of Pyth price update accounts
- Emission of exactly one event per price feed
- Correct decoding of events from `Program data:` logs
- Valid publish timestamps and price values

Batch tests use `remainingAccounts(...)` to supply dynamic Pyth update accounts.

---

## 🔧 Versions Used

This project was developed and tested with the following versions:

- `anchor-lang = "0.30.1"`
- `pyth-solana-receiver-sdk = "0.3.1"`
- `solana-program = "1.18.17"`

---

## 🔒 Security Model

- The program is **read-only**
- No state is written on-chain
- No funds or authorities are handled
- Only verified Pyth price update accounts are read
- Price freshness is enforced via a maximum age check

This project is **safe for experimentation**, but not intended for production deployment.

---

## 🎯 Project Goal

This repository is intentionally **minimal**.

It serves as:
- A learning project for Solana oracle mechanics
- A reference implementation for Pyth Pull integration
- An example of batch oracle design using `remaining_accounts`

---

## 🚀 Possible Extensions

- Persist prices in on-chain accounts (stateful oracle)
- Add confidence interval (`conf`) support
- Emit read timestamps in addition to publish timestamps
- Support cross-program invocation (CPI) consumers
- Add access-controlled or cached oracle layers

---
