use anchor_lang::prelude::*;
use anchor_spl::token_interface::spl_token_metadata_interface::state::Field;

/// Arguments for updating a single metadata field
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateFieldArgs {
    /// Metadata field to update
    pub field: AnchorField,
    /// New value for the field
    pub value: String,
}

/// Anchor-compatible metadata field representation
#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub enum AnchorField {
    /// Token name
    Name,
    /// Token symbol
    Symbol,
    /// Token URI
    Uri,
    /// Custom metadata field
    Key(String),
}

/// Convert to SPL Token Metadata field
impl AnchorField {
    pub fn to_spl_field(&self) -> Field {
        match self {
            AnchorField::Name => Field::Name,
            AnchorField::Symbol => Field::Symbol,
            AnchorField::Uri => Field::Uri,
            AnchorField::Key(s) => Field::Key(s.clone()),
        }
    }
}
