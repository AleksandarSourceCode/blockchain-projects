// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {VotingTypes} from "../../types/VotingTypes.sol";
import {VotingErrors} from "../../errors/VotingErrors.sol";
import {VotingEvents} from "../../events/VotingEvents.sol";

import {
    BinaryProposalManager
} from "../../core/binary/BinaryProposalManager.sol";
import {TokenStaking} from "../../staking/TokenStaking.sol";
import {IEmployeeRegistry} from "../../interfaces/IEmployeeRegistry.sol";
import {IVoting} from "../../interfaces/IVoting.sol";

/// @title WeightedBinaryVoting
/// @notice Stake-weighted employee voting
contract WeightedBinaryVoting is BinaryProposalManager, TokenStaking, IVoting {
    IEmployeeRegistry public immutable employeeRegistry;

    // WEIGHTED CONSTRAINT
    uint256 private _activeWeightedProposalId; // 0 = none

    constructor(
        address admin,
        IEmployeeRegistry registry,
        IERC20 stakingToken,
        uint256 minStake,
        uint256 maxStake
    ) Ownable(admin) TokenStaking(stakingToken, minStake, maxStake) {
        employeeRegistry = registry;
    }

    // PROPOSAL LIFECYCLE
    function createProposal(
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256 proposalId) {
        if (_activeWeightedProposalId != 0)
            revert VotingErrors.WeightedProposalAlreadyActive();

        proposalId = _createProposal(
            VotingTypes.VotingMode.WEIGHTED,
            startTime,
            endTime
        );

        _activeWeightedProposalId = proposalId;
    }

    // VOTING
    function vote(uint256 proposalId, bool support) external override {
        if (!employeeRegistry.isEmployee(msg.sender))
            revert VotingErrors.NotEmployee();

        _syncWeightedProposal();

        VotingTypes.BinaryProposal storage proposal = _proposals[proposalId];

        if (proposal.mode != VotingTypes.VotingMode.WEIGHTED)
            revert VotingErrors.InvalidVotingMode();

        if (proposal.state != VotingTypes.ProposalState.ACTIVE)
            revert VotingErrors.ProposalNotActive();

        if (_hasVoted[proposalId][msg.sender])
            revert VotingErrors.AlreadyVoted();

        uint256 stakeAmount = _stakedAmount[msg.sender];
        if (stakeAmount < minStake || stakeAmount > maxStake)
            revert VotingErrors.InvalidStakeAmount();

        _stakeSnapshots[proposalId][msg.sender] = VotingTypes.StakeSnapshot({
            amount: stakeAmount,
            exists: true
        });

        _hasVoted[proposalId][msg.sender] = true;

        _lockStake(msg.sender);

        if (support) {
            proposal.yesVotes += stakeAmount;
        } else {
            proposal.noVotes += stakeAmount;
        }

        emit VotingEvents.VoteCast(
            proposalId,
            msg.sender,
            support,
            stakeAmount
        );
    }

    function _syncWeightedProposal() internal {
        if (_activeWeightedProposalId == 0) return;

        _syncProposalState(_activeWeightedProposalId);

        if (
            _proposals[_activeWeightedProposalId].state ==
            VotingTypes.ProposalState.CLOSED
        ) {
            _activeWeightedProposalId = 0;
        }
    }

    function unlockStake() external {
        _syncWeightedProposal();

        if (_activeWeightedProposalId != 0) revert VotingErrors.StakeLocked();

        _unlockStake(msg.sender);
    }
}
