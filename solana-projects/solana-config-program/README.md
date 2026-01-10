# Solana Config Program

## Description

A Solana on-chain program built with **Anchor** for managing global and user-specific configuration accounts.
It demonstrates deterministic PDA design, explicit access control, and safe account management patterns on Solana.

---

## What This Project Demonstrates

- Deterministic PDA derivation for global and user-scoped state
- Clear separation of admin-only and user-accessible instructions
- Global configuration control via active / frozen status
- Safe account validation and authority checks
- Clean Anchor program organization (instructions, state, errors)

---

## Structure

```
programs/solana-config-program/
├── src/
│   ├── instructions/
│   │   ├── admin/
│   │   │   ├── initialize_global.rs
│   │   │   ├── update_global.rs
│   │   │   ├── freeze_global.rs
│   │   │   └── update_user_by_admin.rs
│   │   └── user/
│   │       └── initialize_user.rs
│   ├── state/
│   │   ├── global_config.rs
│   │   └── user_config.rs
│   ├── constants.rs
│   ├── errors.rs
│   └── lib.rs
```

---

## Instructions / API

| Instruction            | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `initialize_global`    | Initialize the global configuration (admin only)         |
| `update_global`        | Update global configuration parameters (admin only)      |
| `freeze_global`        | Freeze the global configuration state (admin only)       |
| `update_user_by_admin` | Update a user's configuration (admin only)               |
| `initialize_user`      | Initialize a user-specific configuration account (PDA)   |

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

- `GlobalConfig` is a single PDA initialized and controlled by the admin
- `UserConfig` is derived from `[USER_CONFIG_SEED, owner]`
- State-changing instructions are blocked when the global configuration is frozen
- Logging is performed using `msg!` for clarity during execution
