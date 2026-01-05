use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{verify_sized_collection_item, Metadata, VerifySizedCollectionItem},
    token::Mint,
};

use crate::constants::{METADATA_EDITION_SEED, METADATA_SEED};

#[derive(Accounts)]
pub struct VerifyCollectionNft<'info> {
    /// Collection authority.
    #[account(mut)]
    pub collection_authority: Signer<'info>,

    /// NFT mint.
    pub nft_mint: Account<'info, Mint>,

    /// Collection mint.
    #[account(mut)]
    pub collection_mint: Account<'info, Mint>,

    /// CHECK: NFT metadata PDA
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), nft_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub nft_metadata_account: UncheckedAccount<'info>,

    /// CHECK: Collection metadata PDA
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub collection_metadata_account: UncheckedAccount<'info>,

    /// CHECK: Collection master edition PDA
    #[account(
        mut,
        seeds = [METADATA_SEED, token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), METADATA_EDITION_SEED],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub collection_edition_account: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
}

/// Verifies an NFT as a member of a collection.
pub fn verify_collection_nft(ctx: Context<VerifyCollectionNft>) -> Result<()> {
    verify_sized_collection_item(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            VerifySizedCollectionItem {
                payer: ctx.accounts.collection_authority.to_account_info(),
                metadata: ctx.accounts.nft_metadata_account.to_account_info(),
                collection_authority: ctx.accounts.collection_authority.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata_account.to_account_info(),
                collection_master_edition: ctx
                    .accounts
                    .collection_edition_account
                    .to_account_info(),
            },
        ),
        None,
    )?;

    Ok(())
}
