// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    BinaryProposalManager
} from "../../../contracts/core/binary/BinaryProposalManager.sol";
import {VotingTypes} from "../../../contracts/types/VotingTypes.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Test-only adapter exposing internal BinaryProposalManager logic
contract ProposalManagerTestable is BinaryProposalManager {
    constructor(address admin) Ownable(admin) {}

    function createProposal(
        VotingTypes.VotingMode mode,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256) {
        return _createProposal(mode, startTime, endTime);
    }

    function sync(uint256 proposalId) external {
        _syncProposalState(proposalId);
    }
}

contract ProposalManagerTest is Test {
    ProposalManagerTestable manager;

    address admin = address(0x1);

    function setUp() public {
        manager = new ProposalManagerTestable(admin);
    }

    function test_CreateProposal_Success() public {
        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        vm.expectEmit(true, false, false, true);
        emit VotingEvents.ProposalCreated(1, start, end);

        uint256 id = manager.createProposal(
            VotingTypes.VotingMode.SIMPLE,
            start,
            end
        );

        assertEq(id, 1);

        VotingTypes.BinaryProposal memory p = manager.getProposal(id);

        assertEq(p.id, 1);
        assertEq(uint8(p.mode), uint8(VotingTypes.VotingMode.SIMPLE));
        assertEq(uint8(p.state), uint8(VotingTypes.ProposalState.CREATED));
        assertEq(p.startTime, start);
        assertEq(p.endTime, end);
    }

    function test_Revert_InvalidTimeWindow_StartAfterEnd() public {
        vm.expectRevert(VotingErrors.InvalidTimeWindow.selector);
        manager.createProposal(
            VotingTypes.VotingMode.SIMPLE,
            block.timestamp + 100,
            block.timestamp + 50
        );
    }

    function test_Revert_InvalidTimeWindow_EqualTimes() public {
        vm.expectRevert(VotingErrors.InvalidTimeWindow.selector);
        manager.createProposal(
            VotingTypes.VotingMode.SIMPLE,
            block.timestamp + 100,
            block.timestamp + 100
        );
    }

    function test_Revert_VotingPeriodAlreadyEnded() public {
        uint256 end = block.timestamp;
        uint256 start = end - 1;

        vm.expectRevert(VotingErrors.VotingPeriodEnded.selector);
        manager.createProposal(VotingTypes.VotingMode.SIMPLE, start, end);
    }

    function test_StateTransition_CreatedToActive() public {
        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        uint256 id = manager.createProposal(
            VotingTypes.VotingMode.SIMPLE,
            start,
            end
        );

        vm.warp(start);
        manager.sync(id);

        VotingTypes.BinaryProposal memory p = manager.getProposal(id);
        assertEq(uint8(p.state), uint8(VotingTypes.ProposalState.ACTIVE));
    }

    function test_StateTransition_ActiveToClosed() public {
        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        uint256 id = manager.createProposal(
            VotingTypes.VotingMode.SIMPLE,
            start,
            end
        );

        vm.warp(start);
        manager.sync(id);

        vm.warp(end + 1);

        vm.expectEmit(true, false, false, false);
        emit VotingEvents.ProposalClosed(id);

        manager.sync(id);

        VotingTypes.BinaryProposal memory p = manager.getProposal(id);
        assertEq(uint8(p.state), uint8(VotingTypes.ProposalState.CLOSED));
    }

    function test_NoTransition_IfCalledTooEarly() public {
        uint256 start = block.timestamp + 100;
        uint256 end = start + 1 days;

        uint256 id = manager.createProposal(
            VotingTypes.VotingMode.SIMPLE,
            start,
            end
        );

        manager.sync(id);

        VotingTypes.BinaryProposal memory p = manager.getProposal(id);
        assertEq(uint8(p.state), uint8(VotingTypes.ProposalState.CREATED));
    }

    function test_Revert_GetInvalidProposal() public {
        vm.expectRevert(VotingErrors.InvalidProposal.selector);
        manager.getProposal(999);
    }

    function test_Revert_SyncInvalidProposal() public {
        vm.expectRevert(VotingErrors.InvalidProposal.selector);
        manager.sync(999);
    }
}
