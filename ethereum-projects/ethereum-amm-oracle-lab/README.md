# Ethereum AMM with Oracle Guard

## Description

An **educational, portfolio-grade implementation of a constant-product  
Automated Market Maker (AMM)** in Solidity, built to demonstrate  
**core DeFi mechanics**, **clean architecture**, and  
**test-driven development**.

This project intentionally avoids unnecessary abstractions and focuses
on **clarity, correctness, and extensibility**.

---

## What This Project Demonstrates

- Constant-product AMM (`x * y = k`)
- Swap with exact input amount
- Liquidity add / remove
- Basis-points fee model
- Custom Solidity errors (gas-efficient)
- Event-driven design
- Pluggable oracle guard (price deviation protection)
- Minimal owner-based admin control (oracle configuration only)
- Extensive Foundry test suite
- Minimal ERC20 implementation for testing

---

## Core Concepts

### Constant-Product AMM

The pool follows the invariant:

    reserve0 * reserve1 = k

Prices are determined algorithmically based on pool balances. Fees are
applied on input amounts using basis points.

---

### Liquidity Management

- **Initial liquidity**
  - Any ratio is accepted
  - Sets the initial pool price
- **Subsequent liquidity**
  - Must match the existing pool ratio
  - Otherwise reverts with `SlippageExceeded`

Liquidity is represented numerically (no LP token).
Each liquidity provider has an internal liquidity balance, and withdrawals
are proportional to the provider’s share of total liquidity.

---

### Swaps

- Supports swapping either token in the pair
- Uses `AmmMath.getAmountOut`
- Enforces:
  - non-zero input
  - valid token
  - slippage protection
- Emits a `Swap` event on success

---

## Oracle Guard

The AMM optionally integrates a **price oracle** to protect against
price manipulation (e.g. sandwich or flash-loan attacks).

### How it works

- Oracle provides a reference price (1e18 scaled)
- AMM compares its internal price against the oracle
- Swap reverts if deviation exceeds a configurable threshold

```solidity
MAX_DEVIATION_BPS = 500; // 5%
```

The oracle is **pluggable** and can be disabled by setting it to
`address(0)`.

---

## Project Structure

### Contracts

    contracts/
    ├── amm/
    │   ├── Amm.sol            # Core AMM implementation
    │   ├── IAMM.sol           # Public AMM interface
    │   ├── AmmMath.sol        # Stateless AMM math utilities
    │   ├── AmmErrors.sol      # Custom errors
    │   └── AmmEvents.sol      # Shared AMM events
    │
    ├── oracle/
    │   ├── IPriceOracle.sol   # Oracle abstraction
    │   └── MockOracle.sol     # Test oracle
    │
    └── tokens/
        ├── SimpleERC20.sol    # Minimal ERC20 for testing
        └── TokenErrors.sol    # Custom errors

---

## Tests

The project uses a **layered testing approach**, combining:

- **Foundry** for Solidity-level unit and invariant tests
- **Hardhat + Mocha** for end-to-end integration testing

### Covered Scenarios

- AMM math correctness
- Liquidity add / remove flows
- Swap behavior and reserve updates
- Slippage protection
- Event emission
- Oracle guard enforcement
- Oracle-disabled behavior

Tests are deterministic, isolated, and focused on economic correctness  
and realistic execution flows.

### Running Tests

Install dependencies:

```bash
npm install
```

Run Hardhat tests:

```bash
npx hardhat test
```

---

## Notes

- This project includes a minimal ERC20 implementation to avoid hiding
  ERC20 mechanics behind libraries.
- The focus remains on AMM logic rather than token implementation details.
- Tests are fully transparent and self-contained.

For production tokens, OpenZeppelin is recommended.
