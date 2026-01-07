use anchor_lang::prelude::*;

mod constants;
mod errors;
mod events;
mod instructions;

use instructions::*;

declare_id!("SPPuqqzXkqe1E9EFbwLdt5uHMSsbzHqEsNMy5SKcX4B");

#[program]
pub mod solana_price_oracle {
    use super::*;

    /// Reads a verified Pyth price for a single feed and emits a `PriceReported` event.
    pub fn get_price(ctx: Context<GetPrice>, feed_id_hex: String) -> Result<()> {
        instructions::get_price(ctx, feed_id_hex)
    }

    /// Reads verified Pyth prices for multiple feeds in a single transaction
    /// and emits one `PriceReported` event per feed.
    pub fn get_prices(ctx: Context<GetPrices>, feed_ids_hex: Vec<String>) -> Result<()> {
        instructions::get_prices(ctx, feed_ids_hex)
    }
}
