use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct MintToken<'info> {
    /// Mint authority
    #[account(mut)]
    pub minter: Signer<'info>,

    #[account(
        mut,
        mint::authority = minter
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub recipient: SystemAccount<'info>,
    /// Recipient's associated token account (created if missing)
    #[account(
        init_if_needed,
        payer = minter,
        associated_token::mint = token_mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Mint tokens to the recipient's associated token account.
///
/// `amount` is specified in human-readable units and is scaled internally
/// using the mint's decimals.
pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.minter.to_account_info(),
            },
        ),
        amount * 10u64.pow(ctx.accounts.token_mint.decimals as u32),
    )?;

    Ok(())
}
