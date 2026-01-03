use anchor_lang::prelude::*;
use anchor_spl::token::{set_authority, Mint, SetAuthority, Token};

use crate::MintAuthorityTypeSpl;

#[derive(Accounts)]
pub struct SetMintAuthoritySpl<'info> {
    pub current_authority: Signer<'info>,

    #[account(
        mut,
        mint::authority = current_authority
    )]
    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

/// Update SPL mint-level authorities (mint / freeze)
pub fn set_mint_authority_spl(
    ctx: Context<SetMintAuthoritySpl>,
    authority_type: MintAuthorityTypeSpl,
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
