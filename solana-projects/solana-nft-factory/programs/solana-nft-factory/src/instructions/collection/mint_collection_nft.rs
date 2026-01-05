use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mpl_token_metadata::types::{Collection, DataV2},
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::{METADATA_EDITION_SEED, METADATA_SEED},
    types::MetadataArgs,
};

#[derive(Accounts)]
pub struct MintCollectionNft<'info> {
    /// NFT creator and mint authority.
    #[account(mut)]
    pub creator: Signer<'info>,

    /// NFT mint (0 decimals).
    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = creator,
        mint::freeze_authority = creator,
    )]
    pub nft_mint: Account<'info, Mint>,

    /// Collection mint.
    pub collection_mint: Account<'info, Mint>,

    /// Token account holding the minted NFT.
    #[account(
        init,
        payer = creator,
        associated_token::mint = nft_mint,
        associated_token::authority = creator,
    )]
    pub nft_token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex metadata PDA.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), nft_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), nft_mint.key().as_ref(), METADATA_EDITION_SEED],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

/// Mints an NFT as part of a collection (unverified).
pub fn mint_collection_nft(ctx: Context<MintCollectionNft>, args: MetadataArgs) -> Result<()> {
    // Mint exactly one NFT token.
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.nft_token_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        1,
    )?;

    // Create metadata with an unverified collection reference
    let data = DataV2 {
        name: args.name,
        symbol: args.symbol,
        uri: args.uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: Some(Collection {
            key: ctx.accounts.collection_mint.key(),
            verified: false,
        }),
        uses: None,
    };

    // Create NFT metadata account.
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        data,
        true, // Mutable metadata
        true, // Update authority is signer
        None, // NOT a collection itself
    )?;

    // Create NFT master edition (1/1).
    create_master_edition_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.edition_account.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        Some(0), // Non-printable NFT
    )?;

    Ok(())
}
