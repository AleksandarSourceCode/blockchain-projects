// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {VotingTypes} from "../../types/VotingTypes.sol";
import {VotingErrors} from "../../errors/VotingErrors.sol";
import {VotingEvents} from "../../events/VotingEvents.sol";
import {ChoiceVotingStorage} from "./ChoiceVotingStorage.sol";

/// @title ChoiceProposalManager
/// @notice Handles creation and lifecycle of choice-based proposals
abstract contract ChoiceProposalManager is Ownable, ChoiceVotingStorage {
    function _createProposal(
        uint256 startTime,
        uint256 endTime,
        bytes32[] calldata options
    ) internal returns (uint256 proposalId) {
        if (startTime >= endTime) revert VotingErrors.InvalidTimeWindow();
        if (endTime <= block.timestamp) revert VotingErrors.VotingPeriodEnded();
        if (options.length < 2) revert VotingErrors.InvalidOptions();

        proposalId = ++_nextProposalId;

        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];
        proposal.id = proposalId;
        proposal.state = VotingTypes.ProposalState.CREATED;
        proposal.startTime = startTime;
        proposal.endTime = endTime;

        for (uint256 i = 0; i < options.length; i++) {
            if (options[i] == bytes32(0)) revert VotingErrors.InvalidOptions();
            proposal.options.push(options[i]);
        }

        emit VotingEvents.ChoiceProposalCreated(
            proposalId,
            startTime,
            endTime,
            options
        );
    }

    function _syncProposalState(uint256 proposalId) internal {
        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];

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
            emit VotingEvents.ChoiceProposalClosed(proposalId);
        }
    }

    function getProposalMeta(
        uint256 proposalId
    )
        public
        view
        returns (
            uint256 id,
            VotingTypes.ProposalState state,
            uint256 startTime,
            uint256 endTime,
            bytes32[] memory options
        )
    {
        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];

        if (proposal.endTime == 0) revert VotingErrors.InvalidProposal();

        return (
            proposal.id,
            proposal.state,
            proposal.startTime,
            proposal.endTime,
            proposal.options
        );
    }
}
