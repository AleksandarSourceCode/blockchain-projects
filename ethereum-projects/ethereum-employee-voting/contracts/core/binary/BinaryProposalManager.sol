// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {VotingTypes} from "../../types/VotingTypes.sol";
import {VotingErrors} from "../../errors/VotingErrors.sol";
import {VotingEvents} from "../../events/VotingEvents.sol";
import {BinaryVotingStorage} from "./BinaryVotingStorage.sol";

/// @title BinaryProposalManager
/// @notice Handles proposal creation and lifecycle management
abstract contract BinaryProposalManager is Ownable, BinaryVotingStorage {
    function _createProposal(
        VotingTypes.VotingMode mode,
        uint256 startTime,
        uint256 endTime
    ) internal returns (uint256 proposalId) {
        if (startTime >= endTime) revert VotingErrors.InvalidTimeWindow();

        // Prevent creating proposals that already ended
        if (endTime <= block.timestamp) revert VotingErrors.VotingPeriodEnded();

        proposalId = ++_nextProposalId;

        VotingTypes.BinaryProposal storage proposal = _proposals[proposalId];
        proposal.id = proposalId;
        proposal.mode = mode;
        proposal.state = VotingTypes.ProposalState.CREATED;
        proposal.startTime = startTime;
        proposal.endTime = endTime;

        emit VotingEvents.ProposalCreated(proposalId, startTime, endTime);
    }

    function _syncProposalState(uint256 proposalId) internal {
        VotingTypes.BinaryProposal storage proposal = _proposals[proposalId];

        if (proposal.endTime == 0) revert VotingErrors.InvalidProposal();

        if (
            proposal.state == VotingTypes.ProposalState.CREATED &&
            block.timestamp >= proposal.startTime &&
            block.timestamp <= proposal.endTime
        ) {
            proposal.state = VotingTypes.ProposalState.ACTIVE;
        }

        if (
            proposal.state == VotingTypes.ProposalState.ACTIVE &&
            block.timestamp > proposal.endTime
        ) {
            proposal.state = VotingTypes.ProposalState.CLOSED;
            emit VotingEvents.ProposalClosed(proposalId);
        }
    }

    function getProposal(
        uint256 proposalId
    ) public view returns (VotingTypes.BinaryProposal memory) {
        VotingTypes.BinaryProposal memory proposal = _proposals[proposalId];

        if (proposal.endTime == 0) revert VotingErrors.InvalidProposal();

        return proposal;
    }
}
