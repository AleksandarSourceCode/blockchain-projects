// ======================================================
// Versioning & Anchor internals
// ======================================================

/// Initial global configuration version.
pub const INITIAL_VERSION: u16 = 1;

/// Anchor account discriminator length (in bytes).
pub const ACCOUNT_DISCRIMINATOR_LEN: usize = 8;

// ======================================================
// PDA Seeds — Core configuration
// ======================================================

/// Global configuration PDA seed.
pub const GLOBAL_SEED: &[u8] = b"global";

/// Year configuration PDA seed.
pub const YEAR_SEED: &[u8] = b"year";

/// Employee account PDA seed.
pub const EMPLOYEE_SEED: &[u8] = b"employee";

// ======================================================
// PDA Seeds — Tasks & workflow
// ======================================================

/// Task definition PDA seed.
pub const TASK_SEED: &[u8] = b"task";

/// Task assignment PDA seed.
pub const ASSIGNMENT_SEED: &[u8] = b"assignment";

/// Task completion PDA seed.
pub const COMPLETION_SEED: &[u8] = b"completion";

/// Annual settlement PDA seed.
pub const SETTLEMENT_SEED: &[u8] = b"settlement";

// ======================================================
// PDA Seeds — Rewards & NFTs
// ======================================================

/// Yearly reward token mint PDA seed.
pub const REWARD_MINT_SEED: &[u8] = b"reward-mint";

/// Authority for fungible reward token minting.
pub const REWARD_TOKEN_AUTHORITY_SEED: &[u8] = b"reward-token-authority";

/// Member status collection mint PDA seed.
pub const MEMBER_STATUS_COLLECTION_MINT_SEED: &[u8] = b"member-status-collection-mint";

/// Authority for member status NFT collection and individual member status NFT minting.
pub const MEMBER_STATUS_AUTHORITY_SEED: &[u8] = b"member-status-authority";

/// Member status NFT PDA seed.
pub const MEMBER_STATUS_NFT_SEED: &[u8] = b"member-status-nft";

/// Special token mint PDA seed.
pub const SPECIAL_MINT_SEED: &[u8] = b"special-mint";

/// Authority for fungible special token minting.
pub const SPECIAL_TOKEN_AUTHORITY_SEED: &[u8] = b"special-token-authority";

/// Program-owned treasury PDA used for reward payouts.
pub const TREASURY_SEED: &[u8] = b"treasury";

// ======================================================
// Metaplex constants
// ======================================================

/// Metaplex metadata PDA seed.
pub const METADATA_SEED: &[u8] = b"metadata";

/// Metaplex master edition PDA seed.
pub const METADATA_EDITION_SEED: &[u8] = b"edition";

/// Maximum length of name (Metaplex standard).
pub const MAX_METADATA_NAME_LEN: usize = 32;

/// Maximum length of symbol (Metaplex standard).
pub const MAX_METADATA_SYMBOL_LEN: usize = 10;

/// Maximum length of metadata URI (IPFS / HTTPS JSON, practical upper bound).
pub const MAX_METADATA_URI_LEN: usize = 200;

// ======================================================
// Limits & validation
// ======================================================

/// Maximum length of a task description string.
pub const MAX_TASK_DESCRIPTION_LEN: usize = 120;

/// Maximum length of a task specification URL.
pub const MAX_TASK_SPEC_URL_LEN: usize = 200;

/// Maximum number of rank definitions per year.
pub const MAX_RANKS: usize = 6;

// ======================================================
// Reward economics & payout rules
// ======================================================

/// Treasury payout multiplier for reward tokens.
pub const REWARD_PAYOUT_MULTIPLIER: u64 = 1;

/// Treasury payout multiplier for special tokens.
pub const SPECIAL_PAYOUT_MULTIPLIER: u64 = 2;
