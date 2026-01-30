// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    WeightedBinaryVoting
} from "../../../contracts/voting/binary/WeightedBinaryVoting.sol";
import {VotingTypes} from "../../../contracts/types/VotingTypes.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";
import {
    IEmployeeRegistry
} from "../../../contracts/interfaces/IEmployeeRegistry.sol";
import {
    EmployeeRegistry
} from "../../../contracts/registry/EmployeeRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VotingToken} from "../../../contracts/tokens/VotingToken.sol";

// Test-only adapter exposing internal proposal sync
contract WeightedBinaryVotingTestable is WeightedBinaryVoting {
    constructor(
        address admin,
        IEmployeeRegistry registry,
        IERC20 token,
        uint256 minStake,
        uint256 maxStake
    ) WeightedBinaryVoting(admin, registry, token, minStake, maxStake) {}

    function sync(uint256 proposalId) external {
        _syncProposalState(proposalId);
    }
}

contract WeightedBinaryVotingTest is Test {
    WeightedBinaryVotingTestable voting;
    EmployeeRegistry registry;
    VotingToken token;

    address admin = address(0x1);
    address employee1 = address(0x21);
    address employee2 = address(0x22);
    address outsider = address(0xDEAD);

    uint256 proposalId;

    uint256 constant MIN = 100 ether;
    uint256 constant MAX = 1_000 ether;

    function setUp() public {
        registry = new EmployeeRegistry(admin);
        token = new VotingToken(admin, "TestToken", "TEST");

        voting = new WeightedBinaryVotingTestable(
            admin,
            registry,
            token,
            MIN,
            MAX
        );

        vm.startPrank(admin);
        registry.addEmployee(employee1);
        registry.addEmployee(employee2);

        token.mint(employee1, 500 ether);
        token.mint(employee2, 300 ether);

        vm.startPrank(employee1);
        token.approve(address(voting), type(uint256).max);
        voting.stake(500 ether);
        vm.stopPrank();

        vm.startPrank(employee2);
        token.approve(address(voting), type(uint256).max);
        voting.stake(300 ether);
        vm.stopPrank();

        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        vm.prank(admin);
        proposalId = voting.createProposal(start, end);
    }

    function test_Revert_OnlyOneActiveWeightedProposal() public {
        vm.prank(admin);
        vm.expectRevert(VotingErrors.WeightedProposalAlreadyActive.selector);
        voting.createProposal(block.timestamp + 1, block.timestamp + 2);
    }

    function test_Vote_WeightedYes() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);

        vm.expectEmit(true, true, true, true);
        emit VotingEvents.VoteCast(proposalId, employee1, true, 500 ether);

        voting.vote(proposalId, true);

        VotingTypes.BinaryProposal memory p = voting.getProposal(proposalId);
        assertEq(p.yesVotes, 500 ether);
        assertEq(p.noVotes, 0);
    }

    function test_Vote_WeightedNo() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee2);
        voting.vote(proposalId, false);

        VotingTypes.BinaryProposal memory p = voting.getProposal(proposalId);
        assertEq(p.yesVotes, 0);
        assertEq(p.noVotes, 300 ether);
    }

    function test_Vote_MultipleEmployees() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.vote(proposalId, true);

        vm.prank(employee2);
        voting.vote(proposalId, false);

        VotingTypes.BinaryProposal memory p = voting.getProposal(proposalId);
        assertEq(p.yesVotes, 500 ether);
        assertEq(p.noVotes, 300 ether);
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
        voting.vote(proposalId, true);
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

    function test_StakeLockedUntilProposalEnds() public {
        vm.warp(block.timestamp + 10);

        vm.prank(employee1);
        voting.vote(proposalId, true);

        vm.prank(employee1);
        vm.expectRevert(VotingErrors.StakeLocked.selector);
        voting.unlockStake();

        vm.warp(block.timestamp + 2 days);

        vm.prank(employee1);
        voting.unlockStake();
    }
}
