// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {VotingTypes} from "../../types/VotingTypes.sol";
import {VotingErrors} from "../../errors/VotingErrors.sol";
import {VotingEvents} from "../../events/VotingEvents.sol";
import {
    ChoiceProposalManager
} from "../../core/choice/ChoiceProposalManager.sol";
import {IEmployeeRegistry} from "../../interfaces/IEmployeeRegistry.sol";
import {IWormhole} from "../../interfaces/IWormhole.sol";

/// @title ChoiceVoting
/// @notice One-of-many choice-based voting implementation
contract ChoiceVoting is ChoiceProposalManager {
    IEmployeeRegistry public immutable employeeRegistry;
    address public wormhole;
    uint8 public consistencyLevel;
    mapping(uint256 => bool) internal _finalized;

    constructor(address admin, IEmployeeRegistry registry) Ownable(admin) {
        employeeRegistry = registry;
    }

    function createProposal(
        uint256 startTime,
        uint256 endTime,
        bytes32[] calldata options
    ) external onlyOwner returns (uint256) {
        return _createProposal(startTime, endTime, options);
    }

    function voteFor(uint256 proposalId, bytes32 option) external {
        if (!employeeRegistry.isEmployee(msg.sender))
            revert VotingErrors.NotEmployee();

        _syncProposalState(proposalId);

        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];

        if (proposal.state != VotingTypes.ProposalState.ACTIVE)
            revert VotingErrors.ProposalNotActive();

        if (_hasVoted[proposalId][msg.sender])
            revert VotingErrors.AlreadyVoted();

        if (!_isValidOption(proposal, option))
            revert VotingErrors.InvalidOption();

        _hasVoted[proposalId][msg.sender] = true;
        _votesForOption[proposalId][option] += 1;

        emit VotingEvents.VoteCastForOption(proposalId, msg.sender, option, 1);
    }

    function configureWormhole(
        address wormhole_,
        uint8 consistencyLevel_
    ) external onlyOwner {
        consistencyLevel = consistencyLevel_;
        wormhole = wormhole_;

        emit VotingEvents.WormholeConfigured(wormhole_, consistencyLevel_);
    }

    function finalizeProposal(uint256 proposalId) external onlyOwner {
        _syncProposalState(proposalId);
        _finalizeAndPublish(proposalId);
    }

    function getVotesFor(
        uint256 proposalId,
        bytes32 option
    ) external view returns (uint256) {
        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];

        if (proposal.endTime == 0) revert VotingErrors.InvalidProposal();

        return _votesForOption[proposalId][option];
    }

    function isFinalized(uint256 proposalId) external view returns (bool) {
        return _finalized[proposalId];
    }

    function _isValidOption(
        VotingTypes.ChoiceProposal storage proposal,
        bytes32 option
    ) internal view returns (bool) {
        uint256 len = proposal.options.length;
        for (uint256 i = 0; i < len; i++) {
            if (proposal.options[i] == option) return true;
        }
        return false;
    }

    function _resolveWinner(
        uint256 proposalId
    ) internal view returns (bytes32 winner, uint256 votes) {
        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];

        uint256 len = proposal.options.length;
        uint256 maxVotes = 0;
        bytes32 leadingOption;

        for (uint256 i = 0; i < len; i++) {
            bytes32 option = proposal.options[i];
            uint256 v = _votesForOption[proposalId][option];

            if (v > maxVotes) {
                maxVotes = v;
                leadingOption = option;
            }
        }

        return (leadingOption, maxVotes);
    }

    function _finalizeAndPublish(uint256 proposalId) internal {
        VotingTypes.ChoiceProposal storage proposal = _proposals[proposalId];

        if (proposal.state != VotingTypes.ProposalState.CLOSED)
            revert VotingErrors.ProposalNotClosed();

        if (_finalized[proposalId])
            revert VotingErrors.ProposalAlreadyFinalized();

        _finalized[proposalId] = true;

        (bytes32 winner, uint256 votes) = _resolveWinner(proposalId);

        emit VotingEvents.ChoiceProposalFinalized(proposalId, winner, votes);

        if (wormhole != address(0)) {
            uint64 sequence = IWormhole(wormhole).publishMessage(
                uint32(proposalId),
                abi.encode(proposalId, winner, votes),
                consistencyLevel
            );
            emit VotingEvents.CrossChainResultPublished(proposalId, sequence);
        }
    }
}
