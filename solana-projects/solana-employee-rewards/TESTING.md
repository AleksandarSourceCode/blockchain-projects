# Testing

## Directory Structure

```
tests/
├── constants/      # Test constants (seeds, mints, ranks, task parameters)
├── context/        # Shared test environment (provider, program, wallets)
├── domains/        # Instruction-level domain tests (business rules)
├── e2e/            # End-to-end system flows
├── fixtures/       # Static metadata and predefined test data
├── helpers/        # Reusable utilities (setup, PDAs, execution, assertions)
├── types/          # Test-specific TypeScript types
```

---

## Testing Approach

The testing strategy follows a **layered architecture**:

- **Domain tests** validate instruction behavior and business rules
- **E2E tests** validate full system workflows and integration

The goal is to keep tests deterministic, isolated, and free of duplicated coverage.

---

## Domain Tests

Domain tests verify **individual instructions** in isolation.

They focus on:

- Valid state transitions
- Invalid inputs and edge cases
- Instruction-level constraints
- Business rule enforcement

Domain tests:

- Do **not** execute full workflows
- Do **not** duplicate integration or permission scenarios covered by E2E tests

---

## End-to-End (E2E) Tests

E2E tests validate **complete system behavior** across multiple instructions.

Covered scenarios include:

- Full yearly reward flow (happy path)
- Permission enforcement
- System paused behavior

E2E tests focus on integration correctness and avoid duplicating domain-level edge cases.

---

## Test Context

The shared context (`tests/context/test-context.ts`) initializes:

- Anchor provider
- Program instance
- Test wallets
- Global configuration
- Common environment setup

This ensures consistent and deterministic execution across all tests.

---

## Helpers

Helpers are organized by responsibility:

- `setup/` – environment initialization (airdrop, global setup, year creation)
- `pda/` – PDA derivation and seed encoding
- `execution/` – transaction helpers and runtime utilities
- `assertions/` – custom failure expectations
- `scopes/` – temporary state modifiers (e.g. system paused)

---

## Conventions

- `rejects ...` naming for negative test cases
- Deterministic test data (unique years, task IDs)
- No duplicated assertions across test layers
- Tests are organized by **domain**, not instruction name
- Minimal inline comments in domain tests
- Section comments are mainly used in E2E tests

---

## Running Tests

Install dependencies:

```
npm install
```

Run tests:

```
anchor test
```
