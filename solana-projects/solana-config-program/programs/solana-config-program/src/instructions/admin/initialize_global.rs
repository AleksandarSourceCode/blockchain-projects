use anchor_lang::prelude::*;
use crate::{
    constants::GLOBAL_CONFIG_SEED, 
    state::global_config::*
};


#[derive(Accounts)]
pub struct InitializeGlobal<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + GlobalConfig::INIT_SPACE, 
        seeds = [GLOBAL_CONFIG_SEED],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    pub system_program: Program<'info, System>,
}


pub fn initialize_global(ctx: Context<InitializeGlobal>, fee_bps: u16) -> Result<()> {
    msg!("initialize_global instruction invoked by {}", ctx.accounts.payer.key());

    *ctx.accounts.global_config = GlobalConfig { 
        admin: ctx.accounts.payer.key(), 
        status: Status::Active, 
        fee_bps,
        bump: ctx.bumps.global_config
    };

    msg!("GlobalConfig initialized successfully: admin={}, fee_bps={}, status={:?}", 
        ctx.accounts.global_config.admin, 
        ctx.accounts.global_config.fee_bps, 
        ctx.accounts.global_config.status
    );
    
    Ok(())
}
