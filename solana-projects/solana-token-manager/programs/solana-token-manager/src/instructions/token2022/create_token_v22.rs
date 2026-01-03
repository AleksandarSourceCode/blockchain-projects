use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_spl::token_interface::{
    token_metadata_initialize, Mint, Token2022, TokenMetadataInitialize,
};

use spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::variable_len_pack::VariableLenPack;

use crate::errors::ErrorCode;
use crate::types::metadata_args::*;

#[derive(Accounts)]
#[instruction(_token_decimals: u8)]
pub struct CreateTokenV22<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = _token_decimals,
        mint::authority = creator.key(),
        mint::freeze_authority = creator.key(),
        extensions::metadata_pointer::authority = creator.key(),
        extensions::metadata_pointer::metadata_address = token_mint.key(),
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token2022>,
}

/// Create a new Token-2022 mint with embedded metadata
pub fn create_token_v22(
    ctx: Context<CreateTokenV22>,
    _token_decimals: u8,
    args: MetadataArgs,
) -> Result<()> {
    // Create token metadata
    let token_metadata = TokenMetadata {
        name: args.name.clone(),
        symbol: args.symbol.clone(),
        uri: args.uri.clone(),
        ..Default::default()
    };
    // Add 4 extra bytes for size of MetadataExtension (2 bytes for type, 2 bytes for length)
    let data_len = 4 + token_metadata
        .get_packed_len()
        .map_err(|_| anchor_lang::error::Error::from(ErrorCode::FailedToGetPackedLen))?;

    // Calculate lamports required for the additional metadata
    let lamports = Rent::get()?.minimum_balance(data_len);

    // Transfer additional lamports to mint account
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.token_mint.to_account_info(),
            },
        ),
        lamports,
    )?;

    // Token-2022 metadata stored directly in the mint
    token_metadata_initialize(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenMetadataInitialize {
                program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                metadata: ctx.accounts.token_mint.to_account_info(),
                mint_authority: ctx.accounts.creator.to_account_info(),
                update_authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        args.name,
        args.symbol,
        args.uri,
    )?;

    Ok(())
}
