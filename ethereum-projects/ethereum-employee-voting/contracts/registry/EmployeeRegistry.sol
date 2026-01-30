// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {VotingErrors} from "../errors/VotingErrors.sol";
import {VotingEvents} from "../events/VotingEvents.sol";
import {IEmployeeRegistry} from "../interfaces/IEmployeeRegistry.sol";

/// @title EmployeeRegistry
/// @notice Admin-managed registry of employees allowed to participate in voting
contract EmployeeRegistry is Ownable, IEmployeeRegistry {
    mapping(address => bool) private _isEmployee;

    constructor(address admin) Ownable(admin) {}

    function addEmployee(address employee) external onlyOwner {
        if (employee == address(0)) revert VotingErrors.ZeroAddress();

        _isEmployee[employee] = true;
        emit VotingEvents.EmployeeAdded(employee);
    }

    function removeEmployee(address employee) external onlyOwner {
        if (!_isEmployee[employee]) revert VotingErrors.NotEmployee();

        _isEmployee[employee] = false;
        emit VotingEvents.EmployeeRemoved(employee);
    }

    function isEmployee(address account) external view override returns (bool) {
        return _isEmployee[account];
    }
}
