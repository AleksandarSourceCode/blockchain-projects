use {
    crate::constants::SEED_METADATA,
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            mpl_token_metadata::types::DataV2, update_metadata_accounts_v2, Metadata,
            UpdateMetadataAccountsV2,
        },
        token::Mint,
    },
};

use crate::types::metadata_args::*;

#[derive(Accounts)]
pub struct UpdateMetadataSpl<'info> {
    /// Metadata update authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Metaplex metadata PDA derived from mint
    #[account(
        mut,
        seeds = [SEED_METADATA, token_metadata_program.key().as_ref(), token_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub token_metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    pub token_metadata_program: Program<'info, Metadata>,
}

/// Update SPL token metadata (name, symbol, URI)
pub fn update_metadata_spl(ctx: Context<UpdateMetadataSpl>, args: MetadataArgs) -> Result<()> {
    update_metadata_accounts_v2(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            UpdateMetadataAccountsV2 {
                metadata: ctx.accounts.token_metadata.to_account_info(),
                update_authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        None, // keep update authority unchanged
        Some(DataV2 {
            name: args.name,
            symbol: args.symbol,
            uri: args.uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        }),
        None, // primary_sale_happened
        None, // is_mutable
    )?;

    Ok(())
}
