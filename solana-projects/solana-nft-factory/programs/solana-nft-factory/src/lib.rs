use anchor_lang::prelude::*;

mod constants;
mod errors;
mod instructions;
mod types;

use instructions::*;
use types::*;

declare_id!("SNFZ4Ski1XW3gwd556UdKAe9CQjF1P1ZGZCEAe61Phq");

#[program]
pub mod solana_nft_factory {

    use crate::types::MetadataArgs;

    use super::*;

    /// Mints a standalone NFT.
    ///
    /// The NFT is created with its own mint and metadata
    /// and is not associated with any collection.
    pub fn mint_standalone_nft(ctx: Context<MintStandaloneNft>, args: MetadataArgs) -> Result<()> {
        instructions::standalone::mint_standalone_nft(ctx, args)
    }

    /// Creates an NFT collection.
    ///
    /// Initializes a collection mint and its metadata.
    /// The collection can later be used to group NFTs.
    pub fn create_collection(ctx: Context<CreateCollection>, args: MetadataArgs) -> Result<()> {
        instructions::collection::create_collection(ctx, args)
    }

    /// Mints an NFT as part of an existing collection.
    ///
    /// The minted NFT is linked to the specified collection
    /// but is not verified yet.
    pub fn mint_collection_nft(ctx: Context<MintCollectionNft>, args: MetadataArgs) -> Result<()> {
        instructions::collection::mint_collection_nft(ctx, args)
    }

    /// Verifies an NFT against its collection.
    ///
    /// Marks the NFT as a verified member of the collection.
    /// Requires the collection authority.
    pub fn verify_collection_nft(ctx: Context<VerifyCollectionNft>) -> Result<()> {
        instructions::collection::verify_collection_nft(ctx)
    }
}
