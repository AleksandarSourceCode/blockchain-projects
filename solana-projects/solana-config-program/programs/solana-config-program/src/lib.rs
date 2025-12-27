use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SCPQViE66wTG3jGycUvRYL4rGom7MYP1SDT2jAz8fwp");

#[program]
pub mod solana_config_program {
    use super::*;

    /// Admin-only: Initializes the global configuration account
    /// and sets the initial protocol fee.
    pub fn initialize_global(ctx: Context<InitializeGlobal>, fee_bps: u16) -> Result<()> {
        instructions::admin::initialize_global(ctx, fee_bps)
    }
    /// Admin-only: Updates global configuration parameters,
    /// such as the protocol fee.
    pub fn update_global(ctx: Context<UpdateGlobal>, new_fee_bps: u16) -> Result<()> {
        instructions::admin::update_global(ctx, new_fee_bps)
    }
    /// Admin-only: Freezes the global configuration,
    /// disabling further state-changing operations.
    pub fn freeze_global(ctx: Context<FreezeGlobal>) -> Result<()> {
        instructions::admin::freeze_global(ctx)
    }
    /// Admin-only: Updates a user account configuration,
    /// including daily limits and enabled status.
    pub fn update_user_by_admin(
        ctx: Context<UpdateUserByAdmin>,
        new_daily_limit: u64,
        enabled: bool,
    ) -> Result<()> {
        instructions::admin::update_user_by_admin(ctx, new_daily_limit, enabled)
    }

    /// Initializes a user-specific configuration account (PDA)
    /// for the calling wallet.
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        instructions::user::initialize_user(ctx)
    }
}
