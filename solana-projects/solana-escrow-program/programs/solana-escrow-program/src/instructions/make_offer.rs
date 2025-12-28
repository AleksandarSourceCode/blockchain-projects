use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{constants::OFFER_SEED, errors::ErrorCode, state::offer::Offer};

#[derive(Accounts)]
#[instruction (id: u64)]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>, // The user creating the offer

    #[account()]
    pub token_mint_a: InterfaceAccount<'info, Mint>, // Mint of the token being offered
    #[account()]
    pub token_mint_b: InterfaceAccount<'info, Mint>, // Mint of the token expected in return

    #[account(
        init,
        payer = maker,
        space = 8 + Offer::INIT_SPACE,
        seeds = [OFFER_SEED, maker.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>, // PDA account storing the offer details

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub token_account_a: InterfaceAccount<'info, TokenAccount>, // Maker's source token account

    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, // Vault to hold the offered tokens

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn make_offer(
    ctx: Context<MakeOffer>,
    id: u64,
    token_amount_a: u64,
    token_amount_b: u64,
) -> Result<()> {
    // Ensure token amounts are valid
    require!(token_amount_a > 0, ErrorCode::InvalidAmountA);
    require!(token_amount_b > 0, ErrorCode::InvalidAmountB);

    // Initialize the Offer account
    *ctx.accounts.offer = Offer {
        id,
        maker: ctx.accounts.maker.key(),
        token_mint_a: ctx.accounts.token_mint_a.key(),
        token_mint_b: ctx.accounts.token_mint_b.key(),
        token_amount_b,
        bump: ctx.bumps.offer,
    };

    // Transfer offered tokens to the vault
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.token_account_a.to_account_info(),
                mint: ctx.accounts.token_mint_a.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.maker.to_account_info(),
            },
        ),
        token_amount_a,
        ctx.accounts.token_mint_a.decimals,
    )?;

    Ok(())
}
