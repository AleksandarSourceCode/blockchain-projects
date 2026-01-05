use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SEPCkQmnwJ6XAmDEKkxpNGdXtdCU9soC2keiN6QXc8Q");

#[program]
pub mod solana_escrow_program {

    use super::*;

    /// Creates a new escrow offer.
    /// Transfers the offered tokens from the maker to the vault.
    pub fn make_offer(
        ctx: Context<MakeOffer>,
        id: u64,
        token_amount_a: u64,
        token_amount_b: u64,
    ) -> Result<()> {
        instructions::make_offer(ctx, id, token_amount_a, token_amount_b)
    }

    /// Accepts an existing escrow offer.
    /// Transfers tokens between the maker and taker,
    /// releases the vault funds to the taker,
    /// and closes the offer and vault accounts.
    pub fn take_offer(ctx: Context<TakeOffer>) -> Result<()> {
        instructions::take_offer(ctx)
    }
}
