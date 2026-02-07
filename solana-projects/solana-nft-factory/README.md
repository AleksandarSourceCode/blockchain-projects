# Solana NFT Factory

## Description

A Solana on-chain program built with **Anchor**  
that demonstrates two distinct NFT creation flows  
using **SPL Token and Metaplex Metadata**:  
standalone NFTs and collection-based NFTs.

The program focuses on clearly illustrating how NFT minting,  
metadata creation, and collection verification differ  
between these two approaches.

---

## What This Project Demonstrates

- Standalone NFT minting without collection linkage
- NFT collection creation using `CollectionDetails::V1`
- Minting NFTs that reference an existing collection
- Explicit collection verification via a separate instruction
- Clean separation of standalone and collection instruction flows
- Correct usage of Metaplex metadata and master editions

---

## Structure

```
programs/solana-nft-factory/
├── src/
│   ├── instructions/
│   │   ├── standalone/
│   │   │   └── mint_standalone_nft.rs
│   │   └── collection/
│   │       ├── create_collection.rs
│   │       ├── mint_collection_nft.rs
│   │       └── verify_collection_nft.rs
│   ├── types/
│   │   └── metadata/
│   │       └── metadata_args.rs
│   ├── constants.rs
│   ├── errors.rs
│   └── lib.rs
```

---

## Instructions / API

| Instruction             | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `mint_standalone_nft`   | Mint a standalone NFT with its own metadata        |
| `create_collection`     | Create an NFT collection (parent NFT)              |
| `mint_collection_nft`   | Mint an NFT that references an existing collection |
| `verify_collection_nft` | Verify an NFT as a member of a collection          |

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

- Solana CLI: 2.3.x
- Anchor CLI: 0.32.x
- Rust: 1.92.x
- Node.js: 20+ (for running tests)

---

## Notes

- This project uses the classic SPL Token program (Tokenkeg...), not Token-2022
- All NFTs are minted with `decimals = 0` and supply of `1`
- Collection NFTs require a separate verification step signed by the collection authority
- Verification is intentionally separated to prevent unauthorized NFTs from joining a collection
