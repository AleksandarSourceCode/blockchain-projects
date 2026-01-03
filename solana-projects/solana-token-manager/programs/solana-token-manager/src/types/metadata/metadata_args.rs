use anchor_lang::prelude::*;

/// Metadata fields used when creating or updating a token
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
