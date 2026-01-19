use anchor_lang::prelude::*;

use crate::{constants::GLOBAL_SEED, errors::ErrorCode, state::GlobalConfig};

#[derive(Accounts)]
pub struct UpdateGlobal<'info> {
    /// Current admin authority.
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_SEED],
        bump = global_config.bump,
        has_one = admin
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

/// Updates global administrative fields (admin authority, pause state or payout mint).
pub fn update_global(
    ctx: Context<UpdateGlobal>,
    new_admin: Option<Pubkey>,
    paused: Option<bool>,
    new_payout_mint: Option<Pubkey>,
) -> Result<()> {
    let global = &mut ctx.accounts.global_config;

    require!(
        new_admin.is_some() || paused.is_some() || new_payout_mint.is_some(),
        ErrorCode::InvalidUpdate
    );

    if let Some(admin) = new_admin {
        global.admin = admin;
    }

    if let Some(paused) = paused {
        global.paused = paused;
    }

    if let Some(new_payout_mint) = new_payout_mint {
        global.payout_mint = new_payout_mint;
    }

    Ok(())
}
