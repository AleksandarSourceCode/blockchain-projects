# Solana NFT Factory

This program demonstrates **two different NFT flows on Solana using SPL
Token + Metaplex**:

1.  **Standalone NFT**
2.  **NFT that belongs to a Collection (Collection NFT)**

The main goal of this project is to clearly show:
- how the flows differ
- which instructions are required
- when and why collection verification is needed

> **Note**\
> This project uses **classic SPL Token** (`TokenkegQfeZyi...`).\
> **Token-2022 is NOT used.**

------------------------------------------------------------------------

## Features

-   Create NFT Collection (metadata + master edition)
-   Mint NFTs that belong to a collection
-   Verify NFTs inside a collection
-   Mint standalone NFTs (no collection)
-   Clear separation of instructions and types

------------------------------------------------------------------------

## Project Structure

    programs/solana-nft-factory
    ├── constants.rs
    ├── errors.rs
    ├── instructions
    │   ├── collection
    │   │   ├── create_collection.rs
    │   │   ├── mint_collection_nft.rs
    │   │   ├── verify_collection_nft.rs
    │   │   └── mod.rs
    │   ├── standalone
    │   │   ├── mint_standalone_nft.rs
    │   │   └── mod.rs
    │   └── mod.rs
    ├── lib.rs
    └── types
        └── metadata
            ├── metadata_args.rs
            └── mod.rs

------------------------------------------------------------------------

## Standalone NFT Flow

A **standalone NFT** does NOT belong to any collection.

### Flow

1.  Create mint (`decimals = 0`)
2.  Create ATA
3.  Mint exactly **1 token**
4.  Create Metadata
5.  Create Master Edition

### Characteristics

-   No `collection` field in metadata
-   No verification step
-   Fully independent NFT

------------------------------------------------------------------------

## Collection NFT Flow

A **collection NFT** consists of two parts: 
1. **Collection NFT** (parent) 
2. **NFT items** that belong to the collection

------------------------------------------------------------------------

## 1. Creating a Collection

The collection itself is also an NFT.

### Flow

1.  Create mint (`decimals = 0`)
2.  Create ATA
3.  Mint exactly **1 token**
4.  Create Metadata **with `CollectionDetails::V1`**
5.  Create Master Edition (`max_supply = Some(0)`)

### Key Difference

``` rust
Some(CollectionDetails::V1 { size: 0 })
```

This marks the NFT as a **collection**.

------------------------------------------------------------------------

## 2. Minting an NFT in a Collection

NFT items reference the collection in metadata.

### Flow

1.  Create mint (`decimals = 0`)
2.  Create ATA
3.  Mint exactly **1 token**
4.  Create Metadata **with collection reference**
5.  Create Master Edition

### Important Metadata Field

``` rust
collection: Some(Collection {
    key: collection_mint,
    verified: false,
})
```

At this point the NFT **claims** it belongs to the collection, but it is
**NOT verified yet**.

------------------------------------------------------------------------

## 3. Verifying Collection NFT

Verification is a **separate instruction**.

### Flow

1.  Call `verify_collection_nft`
2.  Signed by **collection update authority**

### Result

-   `verified: true`
-   Marketplaces now treat the NFT as part of the collection

------------------------------------------------------------------------

## Why Verification Is Separate

This design prevents: 
- unauthorized NFTs joining a collection 
- fake collections

Only the **collection authority** can verify NFTs.

------------------------------------------------------------------------

## Common Rules & Pitfalls

-   `mint.decimals` must be `0`
-   `mint.supply` must be `1` before creating Master Edition
-   Metadata account must be **uninitialized**
-   Each NFT must use a **unique mint**
-   Verification requires the **collection authority signer**

------------------------------------------------------------------------

## Summary

```
Feature                Standalone NFT   Collection NFT
---------------------- ---------------- ----------------
Collection metadata    ❌               ✅
Master Edition         ✅               ✅
Verification step      ❌               ✅
Marketplace grouping   ❌               ✅
```

------------------------------------------------------------------------

## Purpose of This Project

This project exists to: 
- clearly demonstrate NFT creation flows 
- serve as a reference for future projects 
- avoid common Metaplex and Anchor mistakes

------------------------------------------------------------------------
