// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {ChoiceVoting} from "../../../contracts/voting/choice/ChoiceVoting.sol";
import {VotingTypes} from "../../../contracts/types/VotingTypes.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";
import {
    EmployeeRegistry
} from "../../../contracts/registry/EmployeeRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Test-only adapter exposing internal proposal sync
contract ChoiceVotingTestable is ChoiceVoting {
    constructor(
        address admin,
        EmployeeRegistry registry
    ) ChoiceVoting(admin, registry) {}

    function sync(uint256 proposalId) external {
        _syncProposalState(proposalId);
    }
}

contract ChoiceVotingTest is Test {
    ChoiceVotingTestable voting;
    EmployeeRegistry registry;

    address admin = address(0x1);
    address employee1 = address(0x21);
    address employee2 = address(0x22);
    address outsider = address(0xDEAD);
    address wormHole = address(0);

    bytes32 option1 = bytes32(uint256(0xA1));
    bytes32 option2 = bytes32(uint256(0xA2));

    uint256 proposalId;

    function setUp() public {
        registry = new EmployeeRegistry(admin);
        voting = new ChoiceVotingTestable(admin, registry);

        vm.startPrank(admin);
        registry.addEmployee(employee1);
        registry.addEmployee(employee2);

        bytes32[] memory options = new bytes32[](2);
        options[0] = option1;
        options[1] = option2;

        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        proposalId = voting.createProposal(start, end, options);
        vm.stopPrank();
    }

    function test_CreateProposal_OnlyOwner() public {
        bytes32[] memory options = new bytes32[](2);
        options[0] = option1;
        options[1] = option2;

        vm.expectRevert();
        voting.createProposal(
            block.timestamp + 1,
            block.timestamp + 2,
            options
        );
    }

    function test_VoteFor_Option1() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);

        vm.expectEmit(true, true, true, true);
        emit VotingEvents.VoteCastForOption(proposalId, employee1, option1, 1);

        voting.voteFor(proposalId, option1);

        uint256 votes = voting.getVotesFor(proposalId, option1);
        assertEq(votes, 1);
    }

    function test_VoteFor_Option2() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.voteFor(proposalId, option2);

        uint256 votes1 = voting.getVotesFor(proposalId, option1);
        uint256 votes2 = voting.getVotesFor(proposalId, option2);

        assertEq(votes1, 0);
        assertEq(votes2, 1);
    }

    function test_Vote_MultipleEmployees_DifferentOptions() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.voteFor(proposalId, option1);

        vm.prank(employee2);
        voting.voteFor(proposalId, option2);

        assertEq(voting.getVotesFor(proposalId, option1), 1);
        assertEq(voting.getVotesFor(proposalId, option2), 1);
    }

    function test_Revert_NotEmployee() public {
        vm.warp(block.timestamp + 10);

        vm.prank(outsider);
        vm.expectRevert(VotingErrors.NotEmployee.selector);
        voting.voteFor(proposalId, option1);
    }

    function test_Revert_AlreadyVoted() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.voteFor(proposalId, option1);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.AlreadyVoted.selector);
        voting.voteFor(proposalId, option2);
    }

    function test_Revert_InvalidOption() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.InvalidOption.selector);
        voting.voteFor(proposalId, bytes32(uint256(0x111)));
    }

    function test_Revert_ProposalNotActive() public {
        // before start
        vm.prank(employee1);
        vm.expectRevert(VotingErrors.ProposalNotActive.selector);
        voting.voteFor(proposalId, option1);

        // after end
        vm.warp(block.timestamp + 2 days);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.ProposalNotActive.selector);
        voting.voteFor(proposalId, option1);
    }

    function test_Revert_Vote_InvalidProposal() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.InvalidProposal.selector);
        voting.voteFor(999, option1);
    }

    function test_Finalize_Success() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.voteFor(proposalId, option1);

        vm.warp(block.timestamp + 2 days);

        vm.prank(admin);
        voting.finalizeProposal(proposalId);

        assertTrue(voting.isFinalized(proposalId));
    }

    function test_Revert_Finalize_NotClosed() public {
        vm.prank(admin);
        vm.expectRevert(VotingErrors.ProposalNotClosed.selector);
        voting.finalizeProposal(proposalId);
    }

    function test_Revert_Finalize_NotOwner() public {
        vm.warp(block.timestamp + 2 days);

        vm.prank(outsider);
        vm.expectRevert();
        voting.finalizeProposal(proposalId);
    }

    function test_Revert_Finalize_Twice() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.voteFor(proposalId, option1);

        vm.warp(block.timestamp + 2 days);

        vm.prank(admin);
        voting.finalizeProposal(proposalId);

        vm.prank(admin);
        vm.expectRevert(VotingErrors.ProposalAlreadyFinalized.selector);
        voting.finalizeProposal(proposalId);
    }
}
