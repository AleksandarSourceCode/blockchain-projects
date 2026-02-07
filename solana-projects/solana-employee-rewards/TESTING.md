# Testing

## Test Structure

```
tests/
├── domains/        # Instruction-level business rules
├── e2e/            # Full system flows
├── helpers/        # Shared test utilities
├── fixtures/       # Static test data
├── constants/      # Test constants
└── setup/          # Test context
```

## Test Layers

### Domain Tests

Domain tests verify individual instruction behavior and business rules in isolation.
They cover valid and invalid state transitions without executing full system flows.

Domain tests do not duplicate permission or integration checks handled by E2E tests.

### End-to-End (E2E) Tests

E2E tests verify complete system behavior across multiple instructions.
They cover:

- Full yearly reward flow (happy path)
- Permission enforcement
- System paused behavior

E2E tests focus on integration correctness and avoid duplicating domain-level edge cases.

## Conventions

- `rejects ...` is used for negative test cases
- Section comments are mainly used in E2E tests
- Domain tests keep inline comments to a minimum
- Deterministic test data (unique years, task IDs)
- Helpers are grouped by responsibility
- No duplicated assertions across test layers

## Running Tests

Install project dependencies:

```bash
npm install
```

Run tests:

```
anchor test
```
