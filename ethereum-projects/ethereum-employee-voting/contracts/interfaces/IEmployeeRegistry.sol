// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IEmployeeRegistry
/// @notice Interface for employee access control
interface IEmployeeRegistry {
    function isEmployee(address account) external view returns (bool);
}
