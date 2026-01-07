use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::{constants::MAXIMUM_AGE, errors::OracleError, events::PriceReported};

/// Context for batch price reads using dynamic Pyth price update accounts.
/// Price update accounts are provided via `remaining_accounts`.
#[derive(Accounts)]
pub struct GetPrices {}

/// Reads verified Pyth prices for multiple feeds in a single transaction.
/// Expects a 1:1 mapping between `remaining_accounts` and `feed_ids_hex`.
/// Emits one `PriceReported` event per feed.
pub fn get_prices(ctx: Context<GetPrices>, feed_ids_hex: Vec<String>) -> Result<()> {
    // Ensure account-to-feed mapping consistency
    require!(
        ctx.remaining_accounts.len() == feed_ids_hex.len(),
        OracleError::LengthMismatch
    );

    for (acc, feed_id_hex) in ctx.remaining_accounts.iter().zip(feed_ids_hex) {
        // Deserialize the verified Pyth price update directly from the account data
        let price_update = PriceUpdateV2::try_deserialize(&mut &acc.data.borrow()[..])?;

        // Parse and validate feed identifier
        let feed_id = get_feed_id_from_hex(&feed_id_hex)?;

        // Fetch a fresh price within the allowed age window
        let price = price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &feed_id)?;

        // Emit structured oracle output for off-chain consumers
        emit!(PriceReported {
            feed_id,
            price: price.price,
            exponent: price.exponent,
            publish_time: price.publish_time,
        });
    }

    Ok(())
}
