use anchor_lang::prelude::*;

use crate::constants::{MAX_METADATA_NAME_LEN, MAX_METADATA_SYMBOL_LEN, MAX_METADATA_URI_LEN};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
/// Metadata fields used for token and NFT creation.
pub struct AssetMetadata {
    #[max_len(MAX_METADATA_NAME_LEN)]
    pub name: String,

    #[max_len(MAX_METADATA_SYMBOL_LEN)]
    pub symbol: String,

    #[max_len(MAX_METADATA_URI_LEN)]
    pub uri: String,
}
