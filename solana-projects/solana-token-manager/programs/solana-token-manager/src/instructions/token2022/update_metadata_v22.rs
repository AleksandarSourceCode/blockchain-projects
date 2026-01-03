use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token_interface::spl_token_metadata_interface::state::TokenMetadata;
use anchor_spl::token_interface::{token_metadata_update_field, TokenMetadataUpdateField};
use anchor_spl::{
    token_2022::spl_token_2022::{
        extension::{BaseStateWithExtensions, PodStateWithExtensions},
        pod::PodMint,
    },
    token_interface::{Mint, Token2022},
};

use crate::metadata_update_field::*;

#[derive(Accounts)]
pub struct UpdateMetadataV22<'info> {
    /// Metadata update authority
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        mint::authority = authority,
        extensions::metadata_pointer::metadata_address = mint_account,
    )]
    pub mint_account: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

/// Update Token-2022 metadata fields stored directly in the mint account
pub fn update_metadata_v22(ctx: Context<UpdateMetadataV22>, args: UpdateFieldArgs) -> Result<()> {
    let UpdateFieldArgs { field, value } = args;

    let field = field.to_spl_field();

    // Compute required lamports after metadata update
    let (current_lamports, required_lamports) = {
        let mint = &ctx.accounts.mint_account.to_account_info();
        let buffer = mint.try_borrow_data()?;
        let state = PodStateWithExtensions::<PodMint>::unpack(&buffer)?;

        let mut token_metadata = state.get_variable_len_extension::<TokenMetadata>()?;
        token_metadata.update(field.clone(), value.clone());

        let new_account_len =
            state.try_get_new_account_len_for_variable_len_extension(&token_metadata)?;

        let required_lamports = Rent::get()?.minimum_balance(new_account_len);

        let current_lamports = mint.lamports();

        (current_lamports, required_lamports)
    };

    // Fund mint account if metadata expansion requires additional rent
    if required_lamports > current_lamports {
        let lamport_difference = required_lamports - current_lamports;
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.mint_account.to_account_info(),
                },
            ),
            lamport_difference,
        )?;
    }

    // Apply metadata field update
    token_metadata_update_field(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenMetadataUpdateField {
                program_id: ctx.accounts.token_program.to_account_info(),
                metadata: ctx.accounts.mint_account.to_account_info(),
                update_authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        field,
        value,
    )?;
    Ok(())
}
