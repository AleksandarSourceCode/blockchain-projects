use anchor_lang::prelude::*;

use crate::errors::VerifierError;

#[derive(Accounts)]
pub struct CloseVerifiedMessage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Unchecked account. Devnet-only helper, not safe for production.
    #[account(mut)]
    pub verified_message: UncheckedAccount<'info>,
}

/// TEST-ONLY.
/// Unsafe helper used exclusively for devnet testing to reset program state.
/// Must NOT be enabled in production.
pub fn close_verified_message(ctx: Context<CloseVerifiedMessage>) -> Result<()> {
    require!(
        cfg!(feature = "test-mode"),
        VerifierError::InstructionDisabled
    );

    let verified = &ctx.accounts.verified_message;
    let payer = &ctx.accounts.payer;

    **payer.lamports.borrow_mut() += verified.lamports();
    **verified.lamports.borrow_mut() = 0;

    let mut data = verified.try_borrow_mut_data()?;
    data.fill(0);

    Ok(())
}
