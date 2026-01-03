use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::Token2022,
    token_interface::{set_authority, Mint, SetAuthority, TokenAccount},
};

use crate::{errors::SetAuthorityError, AuthorityTypeV22};

#[derive(Accounts)]
pub struct SetAuthorityV22<'info> {
    pub current_authority: Signer<'info>,

    /// Mint account (required for mint-level authorities).
    /// Must be provided even if not used due to Anchor deserialization rules.
    #[account(mut)]
    pub token_mint: Option<InterfaceAccount<'info, Mint>>,

    /// Token account (required for account-level authorities).
    /// Must be provided even if not used due to Anchor deserialization rules.
    #[account(mut)]
    pub token_account: Option<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,
}

/// Update Token-2022 authorities.
///
/// Depending on the authority type, this instruction updates either the mint
/// or a token account. Both accounts must be provided due to Anchor account
/// deserialization requirements.
pub fn set_authority_v22(
    ctx: Context<SetAuthorityV22>,
    authority_type: AuthorityTypeV22,
    new_authority: Option<Pubkey>, // None = renounce authority
) -> Result<()> {
    let account_or_mint = match authority_type {
        // Mint-level authorities
        AuthorityTypeV22::Mint | AuthorityTypeV22::Freeze | AuthorityTypeV22::CloseMint => ctx
            .accounts
            .token_mint
            .as_ref()
            .ok_or(SetAuthorityError::MissingMintAccount)?
            .to_account_info(),

        // Token account-level authorities
        AuthorityTypeV22::AccountOwner => ctx
            .accounts
            .token_account
            .as_ref()
            .ok_or(SetAuthorityError::MissingTokenAccount)?
            .to_account_info(),
    };

    set_authority(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SetAuthority {
                account_or_mint,
                current_authority: ctx.accounts.current_authority.to_account_info(),
            },
        ),
        authority_type.to_spl_authority(),
        new_authority,
    )?;

    Ok(())
}
