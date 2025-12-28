use anchor_lang::prelude::*;

// Anchor account representing a single escrow offer
#[account]
// Automatically calculates required space for the account when initialized
#[derive(InitSpace)]
pub struct Offer {
    /// Unique identifier for the offer, used in PDA derivation
    pub id: u64,

    /// Public key of the user who created the offer (maker)
    pub maker: Pubkey,

    /// Mint of the token that the maker is offering
    pub token_mint_a: Pubkey,

    /// Mint of the token that the maker expects in return
    pub token_mint_b: Pubkey,

    /// Amount of token B that the maker expects from the taker
    pub token_amount_b: u64,

    /// PDA bump seed to derive a valid Program Derived Address
    pub bump: u8,
}
