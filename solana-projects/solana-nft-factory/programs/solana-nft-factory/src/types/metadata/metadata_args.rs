use anchor_lang::prelude::*;

/// Arguments used to initialize NFT metadata
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
