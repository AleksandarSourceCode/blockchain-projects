use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::Token2022,
    token_interface::{set_authority, Mint, SetAuthority},
};

use crate::MintAuthorityTypeV22;

#[derive(Accounts)]
pub struct SetMintAuthorityV22<'info> {
    pub current_authority: Signer<'info>,

    #[account(
        mut,
        mint::authority = current_authority
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
}

/// Update Token-2022 mint-level authorities (mint / freeze)
pub fn set_mint_authority_v22(
    ctx: Context<SetMintAuthorityV22>,
    authority_type: MintAuthorityTypeV22,
    new_authority: Option<Pubkey>, // None = renounce authority
) -> Result<()> {
    set_authority(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SetAuthority {
                current_authority: ctx.accounts.current_authority.to_account_info(),
                account_or_mint: ctx.accounts.token_mint.to_account_info(),
            },
        ),
        authority_type.to_spl_authority(),
        new_authority,
    )?;

    Ok(())
}
