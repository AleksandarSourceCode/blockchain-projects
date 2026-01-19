use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::mpl_token_metadata::types::CollectionDetails;
use anchor_spl::metadata::{create_master_edition_v3, CreateMasterEditionV3};
use anchor_spl::metadata::{
    create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
    Metadata,
};
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

use crate::{
    constants::{
        GLOBAL_SEED, MEMBER_STATUS_AUTHORITY_SEED, MEMBER_STATUS_COLLECTION_MINT_SEED,
        METADATA_EDITION_SEED, METADATA_SEED, YEAR_SEED,
    },
    errors::ErrorCode,
    state::{GlobalConfig, YearConfig},
    types::AssetMetadata,
};

#[derive(Accounts)]
#[instruction(year: u16)]
pub struct InitMemberStatusCollection<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [YEAR_SEED, year.to_le_bytes().as_ref()],
        bump = year_config.bump
    )]
    pub year_config: Account<'info, YearConfig>,

    /// CHECK: PDA used as authority for the yearly member status NFT collection.
    #[account(
        seeds = [MEMBER_STATUS_AUTHORITY_SEED, &year.to_le_bytes()],
        bump
    )]
    pub member_status_authority: UncheckedAccount<'info>,

    /// Yearly member status collection mint.
    #[account(
        init,
        payer = admin,
        seeds = [MEMBER_STATUS_COLLECTION_MINT_SEED, year.to_le_bytes().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = member_status_authority,
        mint::freeze_authority = member_status_authority
    )]
    pub collection_mint: Account<'info, Mint>,

    /// CHECK: Metaplex metadata PDA validated via seeds.
    #[account(
        mut,
        seeds = [
            METADATA_SEED,
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA validated via seeds.
    #[account(
        mut,
        seeds = [
            METADATA_SEED,
            token_metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            METADATA_EDITION_SEED],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,

    /// Token account holding the collection NFT.
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = collection_mint,
        associated_token::authority = member_status_authority,
    )]
    pub collection_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

/// Initializes the yearly member status NFT collection.
pub fn init_member_status_collection(
    ctx: Context<InitMemberStatusCollection>,
    year: u16,
    args: AssetMetadata,
) -> Result<()> {
    let global = &ctx.accounts.global_config;
    let year_cfg = &ctx.accounts.year_config;

    require!(!global.paused, ErrorCode::SystemPaused);
    require!(year_cfg.year == year, ErrorCode::InvalidYear);
    require!(!year_cfg.is_open, ErrorCode::YearNotClosed);

    // Signer seeds for the member status collection authority PDA.
    let seeds: &[&[&[u8]]] = &[&[
        MEMBER_STATUS_AUTHORITY_SEED,
        &year.to_le_bytes(),
        &[ctx.bumps.member_status_authority],
    ]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.collection_mint.to_account_info(),
                to: ctx.accounts.collection_token_account.to_account_info(),
                authority: ctx.accounts.member_status_authority.to_account_info(),
            },
            seeds,
        ),
        1,
    )?;

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.member_status_authority.to_account_info(),
                update_authority: ctx.accounts.member_status_authority.to_account_info(),
                payer: ctx.accounts.admin.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            seeds,
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
        true,
        true,
        Some(CollectionDetails::V1 { size: 0 }),
    )?;

    create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.edition_account.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.member_status_authority.to_account_info(),
                mint_authority: ctx.accounts.member_status_authority.to_account_info(),
                payer: ctx.accounts.admin.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            seeds,
        ),
        Some(0),
    )?;

    Ok(())
}
