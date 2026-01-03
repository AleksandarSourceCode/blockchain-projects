use anchor_lang::prelude::*;
use anchor_spl::token::spl_token::instruction::AuthorityType;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AuthorityTypeSpl {
    Mint,
    Freeze,
    AccountOwner,
    CloseAccount,
}

impl AuthorityTypeSpl {
    #[inline(always)]
    pub fn to_spl_authority(self) -> AuthorityType {
        match self {
            AuthorityTypeSpl::Mint => AuthorityType::MintTokens,
            AuthorityTypeSpl::Freeze => AuthorityType::FreezeAccount,
            AuthorityTypeSpl::AccountOwner => AuthorityType::AccountOwner,
            AuthorityTypeSpl::CloseAccount => AuthorityType::CloseAccount,
        }
    }
}
