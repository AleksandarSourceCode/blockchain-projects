// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {VotingTypes} from "../../types/VotingTypes.sol";

/// @title ChoiceVotingStorage
/// @notice Storage for choice-based proposals and votes
abstract contract ChoiceVotingStorage {
    // PROPOSALS
    uint256 internal _nextProposalId;
    mapping(uint256 => VotingTypes.ChoiceProposal) internal _proposals;

    // VOTES
    mapping(uint256 => mapping(address => bool)) internal _hasVoted;
    mapping(uint256 => mapping(bytes32 => uint256)) internal _votesForOption;
}
