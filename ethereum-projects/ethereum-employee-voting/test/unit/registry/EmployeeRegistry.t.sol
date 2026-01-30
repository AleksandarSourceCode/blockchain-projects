// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    EmployeeRegistry
} from "../../../contracts/registry/EmployeeRegistry.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";

contract EmployeeRegistryTest is Test {
    EmployeeRegistry registry;

    address admin = address(0x1);
    address employee = address(0x2);
    address outsider = address(0xDEAD);

    function setUp() public {
        registry = new EmployeeRegistry(admin);
    }

    function test_AddEmployee_Success() public {
        vm.prank(admin);

        vm.expectEmit(true, false, false, false);
        emit VotingEvents.EmployeeAdded(employee);

        registry.addEmployee(employee);

        assertTrue(registry.isEmployee(employee));
    }

    function test_Revert_AddEmployee_NotOwner() public {
        vm.prank(outsider);
        vm.expectRevert();
        registry.addEmployee(employee);
    }

    function test_Revert_AddEmployee_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(VotingErrors.ZeroAddress.selector);
        registry.addEmployee(address(0));
    }

    function test_RemoveEmployee_Success() public {
        vm.startPrank(admin);
        registry.addEmployee(employee);

        vm.expectEmit(true, false, false, false);
        emit VotingEvents.EmployeeRemoved(employee);

        registry.removeEmployee(employee);
        vm.stopPrank();

        assertFalse(registry.isEmployee(employee));
    }

    function test_Revert_RemoveEmployee_NotOwner() public {
        vm.startPrank(admin);
        registry.addEmployee(employee);
        vm.stopPrank();

        vm.prank(outsider);
        vm.expectRevert();
        registry.removeEmployee(employee);
    }

    function test_Revert_RemoveEmployee_NotRegistered() public {
        vm.prank(admin);
        vm.expectRevert(VotingErrors.NotEmployee.selector);
        registry.removeEmployee(employee);
    }

    function test_IsEmployee_DefaultFalse() public {
        assertFalse(registry.isEmployee(employee));
    }
}
