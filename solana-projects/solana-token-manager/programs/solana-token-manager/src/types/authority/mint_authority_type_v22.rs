use anchor_lang::prelude::*;
use anchor_spl::token_2022::spl_token_2022::instruction::AuthorityType;

/// Token-2022 mint-level authority types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MintAuthorityTypeV22 {
    /// Authority to mint new tokens
    Mint,
    /// Authority to freeze token accounts
    Freeze,
    /// Authority to close the mint account
    CloseMint,
    /// Authority to update the metadata pointer
    Metadata,
}

impl MintAuthorityTypeV22 {
    /// Convert to Token-2022 SPL authority type
    #[inline(always)]
    pub fn to_spl_authority(self) -> AuthorityType {
        match self {
            MintAuthorityTypeV22::Mint => AuthorityType::MintTokens,
            MintAuthorityTypeV22::Freeze => AuthorityType::FreezeAccount,
            MintAuthorityTypeV22::CloseMint => AuthorityType::CloseMint,
            MintAuthorityTypeV22::Metadata => AuthorityType::MetadataPointer,
        }
    }
}
