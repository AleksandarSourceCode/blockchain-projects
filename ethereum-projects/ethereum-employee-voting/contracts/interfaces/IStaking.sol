// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IStaking
/// @notice Interface for stake-based voting power
interface IStaking {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function stakedAmount(address account) external view returns (uint256);
}
