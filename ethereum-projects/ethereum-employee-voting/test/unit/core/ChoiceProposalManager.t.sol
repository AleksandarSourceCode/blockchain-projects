// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {
    ChoiceProposalManager
} from "../../../contracts/core/choice/ChoiceProposalManager.sol";
import {VotingTypes} from "../../../contracts/types/VotingTypes.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Test-only adapter exposing internal ChoiceProposalManager logic
contract ChoiceProposalManagerTestable is ChoiceProposalManager {
    constructor(address admin) Ownable(admin) {}

    function createProposal(
        uint256 startTime,
        uint256 endTime,
        bytes32[] calldata options
    ) external returns (uint256) {
        return _createProposal(startTime, endTime, options);
    }

    function sync(uint256 proposalId) external {
        _syncProposalState(proposalId);
    }
}

contract ChoiceProposalManagerTest is Test {
    ChoiceProposalManagerTestable manager;

    address admin = address(0x1);
    bytes32 option1 = bytes32(uint256(0x11));
    bytes32 option2 = bytes32(uint256(0x12));
    bytes32 option3 = bytes32(uint256(0x13));

    function setUp() public {
        manager = new ChoiceProposalManagerTestable(admin);
    }

    function _options() internal view returns (bytes32[] memory opts) {
        opts = new bytes32[](3);
        opts[0] = option1;
        opts[1] = option2;
        opts[2] = option3;
    }

    function test_CreateProposal_Success() public {
        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        bytes32[] memory opts = _options();

        vm.expectEmit(true, false, false, true);
        emit VotingEvents.ChoiceProposalCreated(1, start, end, opts);

        uint256 id = manager.createProposal(start, end, opts);

        assertEq(id, 1);

        (
            uint256 pid,
            VotingTypes.ProposalState state,
            uint256 startTime,
            uint256 endTime,
            bytes32[] memory storedOptions
        ) = manager.getProposalMeta(id);

        assertEq(pid, 1);
        assertEq(uint8(state), uint8(VotingTypes.ProposalState.CREATED));
        assertEq(startTime, start);
        assertEq(endTime, end);
        assertEq(storedOptions.length, 3);
        assertEq(storedOptions[0], option1);
        assertEq(storedOptions[1], option2);
        assertEq(storedOptions[2], option3);
    }

    function test_Revert_InvalidTimeWindow_StartAfterEnd() public {
        vm.expectRevert(VotingErrors.InvalidTimeWindow.selector);
        manager.createProposal(
            block.timestamp + 100,
            block.timestamp + 50,
            _options()
        );
    }

    function test_Revert_InvalidTimeWindow_EqualTimes() public {
        vm.expectRevert(VotingErrors.InvalidTimeWindow.selector);
        manager.createProposal(
            block.timestamp + 100,
            block.timestamp + 100,
            _options()
        );
    }

    function test_Revert_VotingPeriodAlreadyEnded() public {
        uint256 end = block.timestamp;
        uint256 start = end - 1;

        vm.expectRevert(VotingErrors.VotingPeriodEnded.selector);
        manager.createProposal(start, end, _options());
    }

    function test_Revert_InvalidOptions_TooFew() public {
        bytes32[] memory opts = new bytes32[](1);
        opts[0] = option1;

        vm.expectRevert(VotingErrors.InvalidOptions.selector);
        manager.createProposal(
            block.timestamp + 10,
            block.timestamp + 20,
            opts
        );
    }

    function test_StateTransition_CreatedToActive() public {
        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        uint256 id = manager.createProposal(start, end, _options());

        vm.warp(start);
        manager.sync(id);

        (, VotingTypes.ProposalState state, , , ) = manager.getProposalMeta(id);

        assertEq(uint8(state), uint8(VotingTypes.ProposalState.ACTIVE));
    }

    function test_StateTransition_ActiveToClosed() public {
        uint256 start = block.timestamp + 10;
        uint256 end = start + 1 days;

        uint256 id = manager.createProposal(start, end, _options());

        vm.warp(start);
        manager.sync(id);

        vm.warp(end + 1);

        vm.expectEmit(true, false, false, false);
        emit VotingEvents.ChoiceProposalClosed(id);

        manager.sync(id);

        (, VotingTypes.ProposalState state, , , ) = manager.getProposalMeta(id);

        assertEq(uint8(state), uint8(VotingTypes.ProposalState.CLOSED));
    }

    function test_NoTransition_IfCalledTooEarly() public {
        uint256 start = block.timestamp + 100;
        uint256 end = start + 1 days;

        uint256 id = manager.createProposal(start, end, _options());

        manager.sync(id);

        (, VotingTypes.ProposalState state, , , ) = manager.getProposalMeta(id);

        assertEq(uint8(state), uint8(VotingTypes.ProposalState.CREATED));
    }

    function test_Revert_GetInvalidProposal() public {
        vm.expectRevert(VotingErrors.InvalidProposal.selector);
        manager.getProposalMeta(999);
    }

    function test_Revert_SyncInvalidProposal() public {
        vm.expectRevert(VotingErrors.InvalidProposal.selector);
        manager.sync(999);
    }
}
