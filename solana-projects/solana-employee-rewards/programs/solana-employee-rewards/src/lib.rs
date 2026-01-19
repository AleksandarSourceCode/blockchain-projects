use anchor_lang::prelude::*;
declare_id!("SER4X8igXrXB87CcHjH7GTeFTRCEEsiDbeXvNeJXVx5");

mod constants;
mod errors;
mod events;
mod helpers;
mod instructions;
mod state;
mod types;

use instructions::*;
use state::employee::EmployeeStatus;
use types::{AssetMetadata, CreateTaskArgs, RankDefinition};

/// Employee rewards and recognition program.
///
/// Manages task-based scoring, yearly settlements,
/// fungible reward tokens, and member status NFTs.
#[program]
pub mod employee_rewards {

    use super::*;

    // ───────────────
    // Global config
    // ───────────────

    /// Initializes global configuration and admin authority.
    pub fn init_global(ctx: Context<InitGlobal>) -> Result<()> {
        global::init_global(ctx)
    }

    /// Updates global administrative parameters.
    pub fn update_global(
        ctx: Context<UpdateGlobal>,
        new_admin: Option<Pubkey>,
        paused: Option<bool>,
        new_payout_mint: Option<Pubkey>,
    ) -> Result<()> {
        global::update_global(ctx, new_admin, paused, new_payout_mint)
    }

    // ───────────────
    // Year lifecycle
    // ───────────────

    /// Opens a new reward year and initializes rank definitions.
    pub fn open_year(ctx: Context<OpenYear>, year: u16, ranks: Vec<RankDefinition>) -> Result<()> {
        year::open_year(ctx, year, ranks)
    }

    /// Closes task earning for a year.
    pub fn close_year(ctx: Context<CloseYear>, year: u16) -> Result<()> {
        year::close_year(ctx, year)
    }

    /// Computes settlement data for a single employee and year.
    pub fn settle_employee_year(ctx: Context<SettleEmployeeYear>, year: u16) -> Result<()> {
        year::settle_employee_year(ctx, year)
    }

    // ───────────────
    // Task policy
    // ───────────────

    /// Creates a task definition.
    pub fn create_task(ctx: Context<CreateTask>, args: CreateTaskArgs) -> Result<()> {
        task::create_task(ctx, args)
    }

    /// Permanently disables a task to prevent further assignments.
    pub fn deactivate_task(ctx: Context<DeactivateTask>, task_id: u32) -> Result<()> {
        task::deactivate_task(ctx, task_id)
    }

    // ───────────────
    // Task execution
    // ───────────────

    /// Assigns a task to an employee for a given year.
    pub fn start_task(ctx: Context<StartTask>, task_id: u32, year: u16) -> Result<()> {
        task::start_task(ctx, task_id, year)
    }

    /// Marks a task as submitted.
    pub fn submit_task(ctx: Context<SubmitTask>, task_id: u32, year: u16) -> Result<()> {
        task::submit_task(ctx, task_id, year)
    }

    /// Rejects a submitted task and frees the assignment.
    pub fn reject_task(ctx: Context<RejectTask>, task_id: u32, year: u16) -> Result<()> {
        task::reject_task(ctx, task_id, year)
    }

    /// Approves a submitted task and records completion.
    pub fn approve_task(ctx: Context<ApproveTask>, task_id: u32, year: u16) -> Result<()> {
        task::approve_task(ctx, task_id, year)
    }

    // ───────────────
    // Employees
    // ───────────────

    /// Registers an employee for a specific year.
    pub fn register_employee(ctx: Context<RegisterEmployee>, year: u16) -> Result<()> {
        employee::register_employee(ctx, year)
    }

    /// Updates employee administrative fields.
    pub fn update_employee(
        ctx: Context<UpdateEmployee>,
        year: u16,
        new_status: EmployeeStatus,
    ) -> Result<()> {
        employee::update_employee(ctx, year, new_status)
    }

    /// Claims points for a completed task.
    pub fn claim_points(ctx: Context<ClaimPoints>, task_id: u32, year: u16) -> Result<()> {
        employee::claim_points(ctx, task_id, year)
    }

    // ───────────────
    // Reward tokens
    // ───────────────

    /// Initializes the yearly reward token mint.
    pub fn init_reward_token_mint(
        ctx: Context<InitRewardTokenMint>,
        year: u16,
        args: AssetMetadata,
    ) -> Result<()> {
        reward::init_reward_token_mint(ctx, year, args)
    }

    /// Mints reward tokens based on annual settlement.
    pub fn mint_reward_tokens(ctx: Context<MintRewardTokens>, year: u16) -> Result<()> {
        reward::mint_reward_tokens(ctx, year)
    }

    /// Redeems reward tokens for payout assets from the treasury.
    pub fn redeem_reward_tokens(
        ctx: Context<RedeemRewardTokens>,
        year: u16,
        amount: u64,
    ) -> Result<()> {
        reward::reward_token::redeem_reward_tokens(ctx, year, amount)
    }

    // ───────────────
    // Member Status NFTs
    // ───────────────

    /// Initializes the yearly member status NFT collection.
    pub fn init_member_status_collection(
        ctx: Context<InitMemberStatusCollection>,
        year: u16,
        args: AssetMetadata,
    ) -> Result<()> {
        reward::init_member_status_collection(ctx, year, args)
    }

    /// Mints a member status NFT for an employee.
    pub fn mint_member_status_nft(ctx: Context<MintMemberStatusNft>, year: u16) -> Result<()> {
        reward::mint_member_status_nft(ctx, year)
    }

    /// Verifies an employee member status NFT.
    pub fn verify_member_status_nft(ctx: Context<VerifyMemberStatusNft>, year: u16) -> Result<()> {
        reward::verify_member_status_nft(ctx, year)
    }

    // ───────────────
    // Special rewards
    // ───────────────

    /// Initializes the special reward token mint.
    ///
    /// Used for exceptional rewards and compensation cases.
    /// Tokens may be granted to any wallet and are not
    /// limited to registered employees.
    pub fn init_special_token_mint(
        ctx: Context<InitSpecialTokenMint>,
        args: AssetMetadata,
    ) -> Result<()> {
        reward::special_token::init_special_token_mint(ctx, args)
    }

    /// Mints special reward tokens to a recipient wallet.
    ///
    /// Can be used for discretionary grants or compensation,
    /// and does not require employee registration.
    pub fn mint_special_tokens(ctx: Context<MintSpecialTokens>, amount: u64) -> Result<()> {
        reward::special_token::mint_special_tokens(ctx, amount)
    }

    /// Redeems special tokens for payout assets from the treasury.
    pub fn redeem_special_tokens(ctx: Context<RedeemSpecialTokens>, amount: u64) -> Result<()> {
        reward::special_token::redeem_special_tokens(ctx, amount)
    }
}
