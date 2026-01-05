use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::{METADATA_EDITION_SEED, METADATA_SEED},
    types::MetadataArgs,
};

#[derive(Accounts)]
pub struct MintStandaloneNft<'info> {
    /// NFT creator and mint authority.
    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: Metaplex metadata PDA.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA.
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), mint_account.key().as_ref(), METADATA_EDITION_SEED],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,

    /// NFT mint (0 decimals).
    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = creator.key(),
        mint::freeze_authority = creator.key(),
    )]
    pub mint_account: Account<'info, Mint>,

    /// Creator's associated token account holding the NFT.
    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = mint_account,
        associated_token::authority = creator,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

/// Mints a standalone 1/1 NFT.
pub fn mint_standalone_nft(ctx: Context<MintStandaloneNft>, args: MetadataArgs) -> Result<()> {
    // Mint exactly one token to the creator's ATA.
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        1,
    )?;

    // Create Metaplex metadata account.
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
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
        false, // Immutable metadata
        true,  // Update authority is signer
        None,  // No collection details
    )?;

    // Create master edition account.
    create_master_edition_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.edition_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                payer: ctx.accounts.creator.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        Some(0), // 1/1 NFT (no editions)
    )?;

    Ok(())
}
