// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title VotingErrors
/// @notice Custom errors used across the employee voting system
library VotingErrors {
    // ACCESS CONTROL
    error NotEmployee();
    error ZeroAddress();

    // PROPOSALS
    error InvalidProposal();
    error ProposalNotActive();
    error InvalidTimeWindow();
    error VotingPeriodEnded();
    error WeightedProposalAlreadyActive();
    error InvalidOptions();
    error ProposalNotClosed();
    error ProposalAlreadyFinalized();

    // VOTING
    error AlreadyVoted();
    error InvalidVotingMode();
    error InvalidOption();

    // STAKING
    error InvalidStakeAmount();
    error NoStakeFound();
    error StakeLocked();
}
