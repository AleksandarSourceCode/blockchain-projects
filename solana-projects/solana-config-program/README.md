# Solana Config Program

A Solana program built with **Anchor** for managing global and user-specific configurations.  
This project demonstrates **deterministic PDAs, admin/user access control, and safe account management** on Solana.

The program allows an administrator to manage global program settings and users to initialize their own configuration accounts, showing a clear example of secure and maintainable Anchor code.

---

## **Program Account Structure**

This diagram shows the relationship between the program's accounts (PDAs) and users:

    ┌────────────────────────┐
    │   GlobalConfig (PDA)   │
    │------------------------│
    │ admin: Pubkey          │
    │ status: Active/Frozen  │
    │ fee_bps: u16           |
    | bump: u8               │
    └─────────┬──────────────┘
              │
      verifies admin & status
              │
    ┌─────────▼──────────────┐
    │   UserConfig (PDA)     │
    │------------------------│
    │ owner: Pubkey          │
    │ daily_limit: u64       │
    │ enabled: bool          |
    | bump: u8               │
    └────────────────────────┘

### **Notes**

- **GlobalConfig** is a single PDA, initialized by the admin.
- **UserConfig** PDAs are user-specific, derived from `[USER_CONFIG_SEED, owner.key()]`.
- Admin can update any UserConfig account if GlobalConfig status is `Active`.
- Users can only initialize their own UserConfig PDA.

---

## **Instructions Overview**

| Instruction            | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `initialize_global`    | Initialize global configuration (admin only)             |
| `update_global`        | Update fee in global configuration (admin only)          |
| `freeze_global`        | Freeze global configuration (admin only)                 |
| `update_user_by_admin` | Update user's daily limit or enabled status (admin only) |
| `initialize_user`      | Initialize a new user account with default settings      |

---

## **Features**

- **Deterministic PDAs**: `global_config` and `user_config` accounts are PDAs, ensuring safe and predictable account addresses.
- **Access Control**: Only admin can perform privileged operations.
- **Status Validation**: Instructions cannot run if the global configuration is `Frozen`.
- **Logging**: Uses `msg!` for clear debug and transaction logs.
- **Clean Architecture**: Separation of admin and user instructions, constants, state, and errors. Follows **SOLID principles**.

---

## **Usage**

1. Deploy the program on Solana using **Anchor**.
2. Admin initializes the global configuration using `initialize_global`.
3. Users can create their own accounts with `initialize_user`.
4. Admin can update fees or user settings as needed.

---

## **Running Tests**

This project includes automated tests for program instructions.

- Only files ending with `.test.ts` are executed, as configured in the test setup.

---

## **Getting Started (Optional)**

```bash
# Build the program
anchor build

# Deploy to localnet / devnet
anchor deploy

# Run tests
anchor test
```

---

## Environment / Versions

The following versions were used for the `solana-config-program` project:

- **Git:** 2.43.0
- **Rust:** 1.89.0
- **Cargo:** 1.89.0
- **Node.js:** 24.10.0
- **npm:** 11.6.1
- **Yarn:** 1.22.22
- **Solana CLI:** 2.3.13
- **Anchor CLI:** 0.32.1

---
