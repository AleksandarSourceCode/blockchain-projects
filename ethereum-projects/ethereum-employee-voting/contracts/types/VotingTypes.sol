// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title VotingTypes
/// @notice Shared enums and structs for the employee voting system
library VotingTypes {
    // ENUMS
    enum VotingMode {
        SIMPLE,
        WEIGHTED
    }
    enum ProposalState {
        CREATED,
        ACTIVE,
        CLOSED
    }

    // STRUCTS
    struct BinaryProposal {
        uint256 id;
        VotingMode mode;
        ProposalState state;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
    }
    struct ChoiceProposal {
        uint256 id;
        ProposalState state;
        uint256 startTime;
        uint256 endTime;
        bytes32[] options;
    }
    struct StakeSnapshot {
        uint256 amount;
        bool exists;
    }
}
