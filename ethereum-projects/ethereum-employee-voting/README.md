# Ethereum Employee Voting

## Description

An Ethereum-based on-chain system built with **Solidity** and **Hardhat 3**  
that implements a focused **employee voting engine**  
designed for internal decision-making scenarios.

The project is intentionally scoped to **voting mechanics only** and is designed as a  
**reusable governance building block** that can be embedded into larger systems  
(e.g. reward distribution, DAO-like decision layers, or internal HR tooling).

The system supports multiple **voting domains**, each with clearly separated  
proposal models, storage, and voting logic.

---

## What This Project Demonstrates

- Modeling of real-world employee voting processes on Ethereum
- Time-based proposal lifecycle management (lazy state synchronization)
- Clear separation of voting domains and strategies
- Binary (yes/no) and choice-based proposal models
- Stake-weighted voting using ERC20 tokens
- Snapshot-based voting power for weighted voting
- Temporary stake locking to preserve voting fairness
- Interface-driven and modular contract architecture
- Explicit, custom error handling
- Comprehensive unit and integration testing with Hardhat 3

---

## Voting Domains

### Binary Voting (Yes / No)

Binary voting represents decisions with exactly two possible outcomes.

- **Simple Binary Voting**

  - One employee equals one vote
  - No token requirements

- **Weighted Binary Voting**
  - Voting power based on staked ERC20 tokens
  - Enforced `minStake` and `maxStake` bounds
  - Voting power snapshotted at vote time
  - Stake is locked while a proposal is active

Binary voting is suitable for decisions with a clear approval / rejection outcome.

### Choice Voting (One-of-Many)

Choice voting represents decisions where voters select exactly one option from a  
predefined set.

- Each proposal defines a fixed list of valid options
- Options are represented as `bytes32` identifiers
- Each employee may vote for exactly one option
- Votes are counted per option
- The winning option is resolved deterministically after proposal closure
- Optional cross-chain result publishing via Wormhole

This model is suitable for elections, rankings, or competitive selections  
(e.g. “best proposal”, “employee of the year”, or similar scenarios).

---

## High-Level Voting Flow

```text
        ADMINISTRATIVE STEPS                  EMPLOYEE ACTIONS
      +----------------------+           +-------------------------+
      |  Register Employees  |           |                         |
      +----------+-----------+           |                         |
                 |                       |                         |
      +----------v-----------+           |    (Weighted Only)      |
      | Distribute Tokens    +-----------> Approve & Stake Tokens  |
      +----------+-----------+           |                         |
                 |                       +------------+------------+
      +----------v-----------+                        |
      |   Create Proposal    |               STAKE IS LOCKED
      +----------+-----------+             (While proposal active)
                 |                                    |
      +----------v-----------+           +------------v------------+
      | Proposal Is Active   +----------->       Cast Votes        |
      |   (Time-triggered)   |           | (Binary or Multi-Choice)|
      +----------+-----------+           +------------+------------+
                 |                                    |
      +----------v-----------+                        |
      |   Voting Period Ends |           +------------v------------+
      |   (Time-triggered)   +----------->    (Weighted Only)      |
      +----------+-----------+           |  unlockStake() (Manual) |
                 |                       | (Stake becomes liquid)  |
      +----------v-----------+           +-------------------------+
      | (Choice Only)        |
      | Finalize & Publish   |
      | to Wormhole          |
      +----------------------+
```

**Note on Voting Model Differences:**

- **Weighted Binary Voting**  
  Requires token distribution, approval, staking, and post-vote unlocking.

- **Simple Binary & Choice Voting**  
  Ignore token mechanics and rely solely on employee identity and direct voting power.

---

## Architecture Overview

```
contracts/
├── core
│   ├── binary
│   │   ├── BinaryProposalManager.sol
│   │   └── BinaryVotingStorage.sol
│   └── choice
│       ├── ChoiceProposalManager.sol
│       └── ChoiceVotingStorage.sol
│
├── voting
│   ├── binary
│   │   ├── SimpleBinaryVoting.sol
│   │   └── WeightedBinaryVoting.sol
│   └── choice
│       └── ChoiceVoting.sol
│
├── registry
│   └── EmployeeRegistry.sol
│
├── staking
│   └── TokenStaking.sol
│
├── tokens
│   └── VotingToken.sol
│
├── interfaces
│   ├── IEmployeeRegistry.sol
│   ├── IVoting.sol
│   ├── IStaking.sol
│   └── IWormhole.sol
│
├── types
│   └── VotingTypes.sol
├── errors
│   └── VotingErrors.sol
└── events
    └── VotingEvents.sol
```

---

## Tests

The test suite is intentionally split into **unit** and **integration** layers.

### Unit Tests (Solidity / Foundry-style)

Located under `test/unit/`, these tests focus on:

- isolated contract logic
- proposal lifecycle rules
- access control and invariants
- edge cases and revert conditions

Unit tests are written in Solidity to closely mirror on-chain execution
and to validate internal state transitions deterministically.

### Integration Tests (Hardhat / TypeScript)

Located under `test/integration/`, these tests cover:

- full voting flows across multiple contracts
- employee registration and voting scenarios
- cross-contract wiring and interactions
- optional Wormhole signaling behavior

Integration tests are written using **Hardhat 3** and **ethers v6**
to simulate realistic end-to-end usage.

---

## Deployment

Deployment and verification require a `.env` file with the following variables:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<INFURA_PROJECT_ID>
SEPOLIA_PRIVATE_KEY=<DEPLOYER_PRIVATE_KEY>
ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY>
```

The private key must correspond to an account funded on the Sepolia test network.

---

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Sepolia

```bash
npx hardhat ignition deploy ignition/modules/EmployeeVotingModule.ts --network sepolia
```

### Verify Deployment

```bash
npx hardhat ignition verify chain-11155111 --network sepolia
```

---

### Post-deployment (admin)

- Register employees in `EmployeeRegistry`
- Create proposals
- Mint and distribute voting tokens (for weighted voting)
- Optionally configure cross-chain signaling via  
  `ChoiceVoting.configureWormhole(...)`

---

## Environment

- Solidity ^0.8.28
- Hardhat 3.x
- OpenZeppelin Contracts v5.x
- Node.js 20+

---

## Possible Extensions

- Support for multiple concurrent weighted proposals
- Optional external execution layer (timelock + executor)
