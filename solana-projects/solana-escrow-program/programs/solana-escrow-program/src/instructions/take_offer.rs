use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::{constants::OFFER_SEED, state::offer::Offer};

#[derive(Accounts)]
pub struct TakeOffer<'info> {
    #[account(mut)]
    pub taker: Signer<'info>, // User accepting the offer
    #[account(mut)]
    pub maker: SystemAccount<'info>, // Maker's system account, receives tokens if offer closes

    #[account()]
    pub token_mint_a: InterfaceAccount<'info, Mint>, // Mint of the token offered by maker
    #[account()]
    pub token_mint_b: InterfaceAccount<'info, Mint>, // Mint of the token expected by maker

    #[account(
        mut,
        close = maker, // Close offer account after transfer, funds go to maker
        has_one = maker, // Ensures the offer belongs to this maker
        has_one = token_mint_a,
        has_one = token_mint_b,
        seeds = [OFFER_SEED, maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>, // Escrow offer PDA storing offer details

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program
    )]
    pub taker_token_account_b: InterfaceAccount<'info, TokenAccount>, // Taker's destination for token B

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program
    )]
    pub taker_token_account_a: InterfaceAccount<'info, TokenAccount>, // Taker's destination for token A

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_b: InterfaceAccount<'info, TokenAccount>, // Maker's destination for token B

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, // Vault holding maker's tokens

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn take_offer(ctx: Context<TakeOffer>) -> Result<()> {
    // Transfer token B from taker to maker
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.taker_token_account_b.to_account_info(),
                mint: ctx.accounts.token_mint_b.to_account_info(),
                to: ctx.accounts.maker_token_account_b.to_account_info(),
                authority: ctx.accounts.taker.to_account_info(),
            },
        ),
        ctx.accounts.offer.token_amount_b,
        ctx.accounts.token_mint_b.decimals,
    )?;

    // Prepare seeds for PDA authority
    let offer_seeds: &[&[&[u8]]] = &[&[
        OFFER_SEED,
        ctx.accounts.offer.maker.as_ref(),
        &ctx.accounts.offer.id.to_le_bytes(),
        &[ctx.accounts.offer.bump],
    ]];

    // Transfer token A from vault to taker
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.vault.to_account_info(),
                mint: ctx.accounts.token_mint_a.to_account_info(),
                to: ctx.accounts.taker_token_account_a.to_account_info(),
                authority: ctx.accounts.offer.to_account_info(),
            },
            offer_seeds,
        ),
        ctx.accounts.vault.amount,
        ctx.accounts.token_mint_a.decimals,
    )?;

    // Close vault account and send remaining SOL to taker
    close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.vault.to_account_info(),
            destination: ctx.accounts.taker.to_account_info(),
            authority: ctx.accounts.offer.to_account_info(),
        },
        offer_seeds,
    ))?;
    Ok(())
}
