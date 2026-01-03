use anchor_lang::prelude::*;
use anchor_spl::token_2022::spl_token_2022::instruction::AuthorityType;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AuthorityTypeV22 {
    Mint,
    Freeze,
    AccountOwner,
    CloseMint,
}

impl AuthorityTypeV22 {
    #[inline(always)]
    pub fn to_spl_authority(self) -> AuthorityType {
        match self {
            AuthorityTypeV22::Mint => AuthorityType::MintTokens,
            AuthorityTypeV22::Freeze => AuthorityType::FreezeAccount,
            AuthorityTypeV22::AccountOwner => AuthorityType::AccountOwner,
            AuthorityTypeV22::CloseMint => AuthorityType::CloseMint,
        }
    }
}
