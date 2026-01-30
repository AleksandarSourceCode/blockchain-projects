// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title VotingEvents
/// @notice Events emitted across the employee voting system
library VotingEvents {
    // REGISTRY
    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);

    // PROPOSALS
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 startTime,
        uint256 endTime
    );
    event ProposalClosed(uint256 indexed proposalId);
    event ChoiceProposalCreated(
        uint256 indexed proposalId,
        uint256 startTime,
        uint256 endTime,
        bytes32[] options
    );
    event ChoiceProposalClosed(uint256 indexed proposalId);
    event ChoiceProposalFinalized(
        uint256 indexed proposalId,
        bytes32 winner,
        uint256 votes
    );

    // VOTING
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    event VoteCastForOption(
        uint256 indexed proposalId,
        address indexed voter,
        bytes32 indexed option,
        uint256 weight
    );

    // STAKING
    event TokensStaked(address indexed staker, uint256 amount);
    event TokensUnstaked(address indexed staker, uint256 amount);

    // WORMHOLE
    event WormholeConfigured(address wormhole, uint8 consistencyLevel);
    event CrossChainResultPublished(
        uint256 indexed proposalId,
        uint64 sequence
    );
}
