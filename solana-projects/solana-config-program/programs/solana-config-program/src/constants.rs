/// Seed used to derive the GlobalConfig PDA
pub const GLOBAL_CONFIG_SEED: &[u8] = b"global_config";
/// Seed used to derive the UserConfig PDA
pub const USER_CONFIG_SEED: &[u8] = b"user_config";

/// Default daily transaction limit for new users
pub const DEFAULT_DAILY_LIMIT: u64 = 100;
