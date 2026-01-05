use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mpl_token_metadata::types::{CollectionDetails, DataV2},
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::{METADATA_EDITION_SEED, METADATA_SEED},
    types::MetadataArgs,
};

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    /// Collection creator and authority.
    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: Metaplex metadata PDA.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), METADATA_EDITION_SEED],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,

    /// Collection mint (0 decimals).
    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = creator.key(),
        mint::freeze_authority = creator.key(),
    )]
    pub collection_mint: Account<'info, Mint>,

    /// Creator's token account holding the collection NFT
    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = collection_mint,
        associated_token::authority = creator,
    )]
    pub collection_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

/// Creates an NFT collection.
pub fn create_collection(ctx: Context<CreateCollection>, args: MetadataArgs) -> Result<()> {
    // Mint the collection NFT.
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.collection_mint.to_account_info(),
                to: ctx.accounts.collection_token_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        1,
    )?;

    // Create collection metadata account.
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        DataV2 {
            name: args.name,
            symbol: args.symbol,
            uri: args.uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true,                                    // Mutable collection metadata
        true,                                    // Update authority is signer
        Some(CollectionDetails::V1 { size: 0 }), // Collection marker
    )?;

    // Create collection master edition.
    create_master_edition_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.edition_account.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        Some(0), // Collection NFTs are always 1/1
    )?;

    Ok(())
}
