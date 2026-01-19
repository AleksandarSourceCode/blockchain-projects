use anchor_lang::prelude::*;

#[error_code]
/// Program error definitions.
pub enum ErrorCode {
    // ==================================================
    // Global / system
    // ==================================================
    #[msg("System is paused")]
    SystemPaused,

    #[msg("No fields provided for update")]
    InvalidUpdate,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Invalid year")]
    InvalidYear,

    #[msg("Arithmetic overflow")]
    MathOverflow,

    #[msg("Invalid payout mint")]
    InvalidPayoutMint,

    // ==================================================
    // Rank & scoring
    // ==================================================
    #[msg("No rank definitions were provided")]
    NoRanksProvided,

    #[msg("The number of rank definitions exceeds the allowed maximum")]
    TooManyRanks,

    #[msg("Invalid rank point range: min_points must be <= max_points")]
    InvalidRankRange,

    #[msg("Rank definitions contain gaps or overlapping point ranges")]
    RankGapOrOverlap,

    #[msg("No matching rank found for the given points")]
    RankNotFound,

    // ==================================================
    // Year lifecycle
    // ==================================================
    #[msg("Year is not open")]
    YearNotOpen,

    #[msg("Year is not closed")]
    YearNotClosed,

    #[msg("Year is already settled")]
    YearAlreadySettled,

    // ==================================================
    // Tasks
    // ==================================================
    #[msg("Task description is too long")]
    TaskDescriptionTooLong,

    #[msg("Task specification URL is too long")]
    TaskSpecUrlTooLong,

    #[msg("Task is not active")]
    TaskNotActive,

    #[msg("Invalid task state")]
    InvalidTaskState,

    #[msg("Invalid task")]
    InvalidTask,

    #[msg("Invalid task points")]
    InvalidTaskPoints,

    #[msg("Task already claimed")]
    TaskAlreadyClaimed,

    // ==================================================
    // Rewards & minting
    // ==================================================
    #[msg("Reward already minted")]
    AlreadyMinted,

    #[msg("Nothing to mint")]
    NothingToMint,
}
