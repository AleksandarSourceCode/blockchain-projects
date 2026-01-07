use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::{constants::MAXIMUM_AGE, events::PriceReported};

#[derive(Accounts)]
pub struct GetPrice<'info> {
    /// Verified Pyth price update account (Pull model)
    pub price_update: Account<'info, PriceUpdateV2>,
}

pub fn get_price(ctx: Context<GetPrice>, feed_id_hex: String) -> Result<()> {
    // Access the verified price update
    let price_update = &ctx.accounts.price_update;

    // Parse feed id from hex string
    let feed_id = get_feed_id_from_hex(feed_id_hex.as_str())?;

    // Fetch a fresh price within the allowed age window
    let price = price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &feed_id)?;

    // Structured oracle output for off-chain consumers
    emit!(PriceReported {
        feed_id,
        price: price.price,
        exponent: price.exponent,
        publish_time: price.publish_time,
    });

    Ok(())
}
