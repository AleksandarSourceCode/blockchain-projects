// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IVoting
/// @notice Common voting interface for all voting strategies
interface IVoting {
    function vote(uint256 proposalId, bool support) external;
}
