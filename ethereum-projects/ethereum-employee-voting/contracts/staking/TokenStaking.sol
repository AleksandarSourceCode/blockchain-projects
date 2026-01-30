// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {VotingErrors} from "../errors/VotingErrors.sol";
import {VotingEvents} from "../events/VotingEvents.sol";
import {IStaking} from "../interfaces/IStaking.sol";

/// @title TokenStaking
/// @notice Global ERC20 token staking for weighted voting
abstract contract TokenStaking is IStaking {
    using SafeERC20 for IERC20;
    IERC20 public immutable stakingToken;

    uint256 public immutable minStake;
    uint256 public immutable maxStake;

    mapping(address => uint256) internal _stakedAmount;
    mapping(address => bool) internal _stakeLocked;

    constructor(IERC20 token, uint256 minAmount, uint256 maxAmount) {
        if (address(token) == address(0))
            revert VotingErrors.InvalidStakeAmount();
        if (minAmount == 0 || minAmount > maxAmount)
            revert VotingErrors.InvalidStakeAmount();

        stakingToken = token;
        minStake = minAmount;
        maxStake = maxAmount;
    }

    // STAKING
    function stake(uint256 amount) external override {
        uint256 newTotal = _stakedAmount[msg.sender] + amount;

        if (newTotal < minStake || newTotal > maxStake)
            revert VotingErrors.InvalidStakeAmount();

        _stakedAmount[msg.sender] = newTotal;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit VotingEvents.TokensStaked(msg.sender, amount);
    }
    function unstake(uint256 amount) external override {
        if (_stakeLocked[msg.sender]) revert VotingErrors.StakeLocked();

        uint256 staked = _stakedAmount[msg.sender];
        if (staked == 0 || amount > staked) revert VotingErrors.NoStakeFound();

        uint256 remaining = staked - amount;

        if (remaining != 0 && remaining < minStake)
            revert VotingErrors.InvalidStakeAmount();

        _stakedAmount[msg.sender] = remaining;

        stakingToken.safeTransfer(msg.sender, amount);

        emit VotingEvents.TokensUnstaked(msg.sender, amount);
    }

    // INTERNAL
    function _lockStake(address staker) internal {
        _stakeLocked[staker] = true;
    }
    function _unlockStake(address staker) internal {
        _stakeLocked[staker] = false;
    }

    // VIEWS
    function stakedAmount(
        address account
    ) public view override returns (uint256) {
        return _stakedAmount[account];
    }
}
