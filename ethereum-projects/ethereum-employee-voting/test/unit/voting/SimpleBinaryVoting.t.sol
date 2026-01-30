// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    SimpleBinaryVoting
} from "../../../contracts/voting/binary/SimpleBinaryVoting.sol";
import {VotingTypes} from "../../../contracts/types/VotingTypes.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";
import {
    EmployeeRegistry
} from "../../../contracts/registry/EmployeeRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Test-only adapter exposing internal proposal sync
contract SimpleBinaryVotingTestable is SimpleBinaryVoting {
    constructor(
        address admin,
        EmployeeRegistry registry
    ) SimpleBinaryVoting(admin, registry) {}

    function sync(uint256 proposalId) external {
        _syncProposalState(proposalId);
    }
}

contract SimpleBinaryVotingTest is Test {
    SimpleBinaryVotingTestable voting;
    EmployeeRegistry registry;

    address admin = address(0x1);
    address employee1 = address(0x21);
    address employee2 = address(0x22);
    address outsider = address(0xDEAD);

    uint256 proposalId;

    function setUp() public {
        registry = new EmployeeRegistry(admin);
        voting = new SimpleBinaryVotingTestable(admin, registry);

        vm.startPrank(admin);
        registry.addEmployee(employee1);
        registry.addEmployee(employee2);

        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        proposalId = voting.createProposal(start, end);
        vm.stopPrank();
    }

    function test_CreateProposal_OnlyOwner() public {
        vm.expectRevert();
        voting.createProposal(block.timestamp + 1, block.timestamp + 2);
    }

    function test_Vote_Yes() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);

        vm.expectEmit(true, true, false, true);
        emit VotingEvents.VoteCast(proposalId, employee1, true, 1);

        voting.vote(proposalId, true);

        VotingTypes.BinaryProposal memory p = voting.getProposal(proposalId);
        assertEq(p.yesVotes, 1);
        assertEq(p.noVotes, 0);
    }

    function test_Vote_No() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.vote(proposalId, false);

        VotingTypes.BinaryProposal memory p = voting.getProposal(proposalId);
        assertEq(p.yesVotes, 0);
        assertEq(p.noVotes, 1);
    }

    function test_Vote_MultipleEmployees() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.vote(proposalId, true);

        vm.prank(employee2);
        voting.vote(proposalId, false);

        VotingTypes.BinaryProposal memory p = voting.getProposal(proposalId);
        assertEq(p.yesVotes, 1);
        assertEq(p.noVotes, 1);
    }

    function test_Revert_NotEmployee() public {
        vm.warp(block.timestamp + 10);

        vm.prank(outsider);
        vm.expectRevert(VotingErrors.NotEmployee.selector);
        voting.vote(proposalId, true);
    }

    function test_Revert_AlreadyVoted() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.vote(proposalId, true);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.AlreadyVoted.selector);
        voting.vote(proposalId, false);
    }

    function test_Revert_ProposalNotActive() public {
        // before start
        vm.prank(employee1);
        vm.expectRevert(VotingErrors.ProposalNotActive.selector);
        voting.vote(proposalId, true);

        // after end
        vm.warp(block.timestamp + 2 days);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.ProposalNotActive.selector);
        voting.vote(proposalId, true);
    }

    function test_Revert_Vote_InvalidProposal() public {
        vm.warp(block.timestamp + 10);
        vm.prank(employee1);

        vm.expectRevert(VotingErrors.InvalidProposal.selector);
        voting.vote(999, true);
    }
}
