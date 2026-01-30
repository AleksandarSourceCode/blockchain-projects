// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {VotingTypes} from "../../types/VotingTypes.sol";
import {VotingErrors} from "../../errors/VotingErrors.sol";
import {VotingEvents} from "../../events/VotingEvents.sol";
import {
    BinaryProposalManager
} from "../../core/binary/BinaryProposalManager.sol";
import {IEmployeeRegistry} from "../../interfaces/IEmployeeRegistry.sol";
import {IVoting} from "../../interfaces/IVoting.sol";

/// @title SimpleBinaryVoting
/// @notice One-employee-one-vote voting implementation
contract SimpleBinaryVoting is BinaryProposalManager, IVoting {
    IEmployeeRegistry public immutable employeeRegistry;

    constructor(address admin, IEmployeeRegistry registry) Ownable(admin) {
        employeeRegistry = registry;
    }

    // PROPOSAL LIFECYCLE
    function createProposal(
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        return
            _createProposal(VotingTypes.VotingMode.SIMPLE, startTime, endTime);
    }

    // VOTING
    function vote(uint256 proposalId, bool support) external override {
        if (!employeeRegistry.isEmployee(msg.sender))
            revert VotingErrors.NotEmployee();

        _syncProposalState(proposalId);

        VotingTypes.BinaryProposal storage proposal = _proposals[proposalId];

        if (proposal.mode != VotingTypes.VotingMode.SIMPLE)
            revert VotingErrors.InvalidVotingMode();

        if (proposal.state != VotingTypes.ProposalState.ACTIVE)
            revert VotingErrors.ProposalNotActive();

        if (_hasVoted[proposalId][msg.sender])
            revert VotingErrors.AlreadyVoted();

        _hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }

        emit VotingEvents.VoteCast(proposalId, msg.sender, support, 1);
    }
}
