// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {VotingTypes} from "../../types/VotingTypes.sol";

/// @title BinaryVotingStorage
/// @notice Shared storage for proposals, votes, and stake snapshots
abstract contract BinaryVotingStorage {
    // PROPOSALS
    uint256 internal _nextProposalId;
    mapping(uint256 => VotingTypes.BinaryProposal) internal _proposals;

    // VOTES
    mapping(uint256 => mapping(address => bool)) internal _hasVoted;

    // WEIGHTED SNAPSHOTS
    mapping(uint256 => mapping(address => VotingTypes.StakeSnapshot))
        internal _stakeSnapshots;
}
