use anchor_lang::prelude::*;
use anchor_spl::token::{set_authority, Mint, SetAuthority, Token, TokenAccount};

use crate::{errors::SetAuthorityError, AuthorityTypeSpl};

#[derive(Accounts)]
pub struct SetAuthoritySpl<'info> {
    pub current_authority: Signer<'info>,

    /// Mint account (required for mint-level authorities).
    /// Must be provided even if not used due to Anchor deserialization rules.
    #[account(mut)]
    pub token_mint: Option<Account<'info, Mint>>,

    /// Token account (required for account-level authorities).
    /// Must be provided even if not used due to Anchor deserialization rules.
    #[account(mut)]
    pub token_account: Option<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

/// Update SPL token authorities.
///
/// Depending on the authority type, this instruction updates either the mint
/// or a token account. Both accounts must be provided due to Anchor account
/// deserialization requirements.
pub fn set_authority_spl(
    ctx: Context<SetAuthoritySpl>,
    authority_type: AuthorityTypeSpl,
    new_authority: Option<Pubkey>, // None = renounce authority
) -> Result<()> {
    let account_or_mint = match authority_type {
        // Mint-level authorities
        AuthorityTypeSpl::Mint | AuthorityTypeSpl::Freeze => ctx
            .accounts
            .token_mint
            .as_ref()
            .ok_or(SetAuthorityError::MissingMintAccount)?
            .to_account_info(),

        // Token account-level authorities
        AuthorityTypeSpl::AccountOwner | AuthorityTypeSpl::CloseAccount => ctx
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
