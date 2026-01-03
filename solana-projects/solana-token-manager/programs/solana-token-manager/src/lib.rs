use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod types;

pub use instructions::*;
pub use types::*;

declare_id!("STME98XvsZnfE8MSdXmS7bP3JgCGmQMGSvrKj9Ub6hh");

#[program]
pub mod solana_token_manager {

    use super::*;

    /// Create a new SPL token mint with metadata
    pub fn create_spl_token(
        ctx: Context<CreateTokenSpl>,
        token_decimals: u8,
        args: MetadataArgs,
    ) -> Result<()> {
        create_token_spl(ctx, token_decimals, args)
    }

    /// Update SPL mint-level authorities (mint / freeze)
    pub fn set_mint_authority_spl_token(
        ctx: Context<SetMintAuthoritySpl>,
        authority_type: MintAuthorityTypeSpl,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        set_mint_authority_spl(ctx, authority_type, new_authority)
    }

    /// Update SPL token authorities.
    ///
    /// Depending on the authority type, this instruction updates either the mint
    /// or a token account. Due to Anchor account deserialization requirements,
    /// both accounts must be provided even if only one is actually modified.
    pub fn set_authority_spl_token(
        ctx: Context<SetAuthoritySpl>,
        authority_type: AuthorityTypeSpl,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        set_authority_spl(ctx, authority_type, new_authority)
    }

    /// Update SPL token metadata
    pub fn update_metadata_spl_token(
        ctx: Context<UpdateMetadataSpl>,
        args: MetadataArgs,
    ) -> Result<()> {
        update_metadata_spl(ctx, args)
    }

    /// Create a new Token-2022 mint with metadata extensions
    pub fn create_token2022(
        ctx: Context<CreateTokenV22>,
        token_decimals: u8,
        args: MetadataArgs,
    ) -> Result<()> {
        create_token_v22(ctx, token_decimals, args)
    }

    /// Update Token-2022 mint-level authorities
    pub fn set_mint_authority_token2022(
        ctx: Context<SetMintAuthorityV22>,
        authority_type: MintAuthorityTypeV22,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        set_mint_authority_v22(ctx, authority_type, new_authority)
    }

    /// Update Token-2022 authorities.
    ///
    /// Depending on the authority type, this instruction updates either the mint
    /// or a token account. Due to Anchor account deserialization requirements,
    /// both accounts must be provided even if only one is actually modified.
    pub fn set_authority_token2022(
        ctx: Context<SetAuthorityV22>,
        authority_type: AuthorityTypeV22,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        set_authority_v22(ctx, authority_type, new_authority)
    }

    /// Update Token-2022 metadata fields
    pub fn update_metadata_token2022(
        ctx: Context<UpdateMetadataV22>,
        args: UpdateFieldArgs,
    ) -> Result<()> {
        update_metadata_v22(ctx, args)
    }

    /// Mint tokens (SPL or Token-2022)
    pub fn mint_token_universal(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        mint_token(ctx, amount)
    }

    /// Transfer tokens (SPL or Token-2022)
    pub fn transfer_token_universal(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
        transfer_token(ctx, amount)
    }

    /// Burn tokens (SPL or Token-2022)
    pub fn burn_token_universal(ctx: Context<BurnToken>, amount: u64) -> Result<()> {
        burn_token(ctx, amount)
    }
}
