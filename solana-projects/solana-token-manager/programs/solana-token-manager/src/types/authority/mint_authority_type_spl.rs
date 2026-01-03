use anchor_lang::prelude::*;
use anchor_spl::token::spl_token::instruction::AuthorityType;

/// SPL mint-level authority types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MintAuthorityTypeSpl {
    /// Authority to mint new tokens
    Mint,
    /// Authority to freeze token accounts
    Freeze,
}

impl MintAuthorityTypeSpl {
    /// Convert to SPL Token authority type
    #[inline(always)]
    pub fn to_spl_authority(self) -> AuthorityType {
        match self {
            MintAuthorityTypeSpl::Mint => AuthorityType::MintTokens,
            MintAuthorityTypeSpl::Freeze => AuthorityType::FreezeAccount,
        }
    }
}
