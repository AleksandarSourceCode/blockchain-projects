use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
pub struct LogCpi<'info> {
    #[account(mut)]
    pub from: Signer<'info>,

    /// Destination system account that receives lamports via System Program CPI
    pub to: SystemAccount<'info>,

    /// System Program used for lamport transfer CPI
    pub system_program: Program<'info, System>,
}

pub fn log_cpi(ctx: Context<LogCpi>, lamports: u64) -> Result<()> {
    // Log emitted before performing the CPI call
    msg!("CPI_LOG: before transfer");

    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
            },
        ),
        lamports,
    )?;

    // Log emitted after successful CPI execution
    msg!("CPI_LOG: after transfer");

    Ok(())
}
