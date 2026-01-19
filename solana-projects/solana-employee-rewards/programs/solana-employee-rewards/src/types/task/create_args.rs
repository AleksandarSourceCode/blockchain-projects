use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
/// Arguments for creating a task definition.
pub struct CreateTaskArgs {
    pub task_id: u32,
    pub description: String,
    pub spec_url: String,
    pub points: u64,
}
