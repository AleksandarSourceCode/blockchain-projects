use anchor_lang::prelude::*;

#[event]
pub struct PriceReported {
    /// Pyth price feed identifier
    pub feed_id: [u8; 32],

    /// Reported price value (scaled by `exponent`)
    pub price: i64,

    /// Base-10 exponent used to scale `price`
    pub exponent: i32,

    /// Timestamp when the price was published by Pyth (Unix seconds)
    pub publish_time: i64,
}
