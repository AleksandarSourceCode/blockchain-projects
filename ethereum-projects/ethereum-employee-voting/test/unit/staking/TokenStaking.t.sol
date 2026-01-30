// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {TokenStaking} from "../../../contracts/staking/TokenStaking.sol";
import {VotingErrors} from "../../../contracts/errors/VotingErrors.sol";
import {VotingEvents} from "../../../contracts/events/VotingEvents.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VotingToken} from "../../../contracts/tokens/VotingToken.sol";

// Test-only adapter exposing internal stake locking
contract TokenStakingTestable is TokenStaking {
    constructor(
        IERC20 token,
        uint256 minStake,
        uint256 maxStake
    ) TokenStaking(token, minStake, maxStake) {}

    function lock(address a) external {
        _lockStake(a);
    }
    function unlock(address a) external {
        _unlockStake(a);
    }
}

contract TokenStakingTest is Test {
    TokenStakingTestable staking;
    VotingToken token;

    address admin = address(0x1);
    address user = address(0x2);

    uint256 constant MIN = 100 ether;
    uint256 constant MAX = 1_000 ether;

    function setUp() public {
        token = new VotingToken(admin, "TestToken", "TEST");
        staking = new TokenStakingTestable(token, MIN, MAX);

        vm.prank(admin);
        token.mint(user, 2_000 ether);

        vm.prank(user);
        token.approve(address(staking), type(uint256).max);
    }

    function test_Stake_Success_MinStake() public {
        vm.prank(user);

        vm.expectEmit(true, false, false, true);
        emit VotingEvents.TokensStaked(user, MIN);

        staking.stake(MIN);

        assertEq(staking.stakedAmount(user), MIN);
    }

    function test_Stake_IncrementalStake() public {
        vm.startPrank(user);
        staking.stake(200 ether);
        staking.stake(300 ether);
        vm.stopPrank();

        assertEq(staking.stakedAmount(user), 500 ether);
    }

    function test_Revert_Stake_BelowMin() public {
        vm.prank(user);
        vm.expectRevert(VotingErrors.InvalidStakeAmount.selector);
        staking.stake(50 ether);
    }

    function test_Revert_Stake_AboveMax() public {
        vm.startPrank(user);
        staking.stake(900 ether);

        vm.expectRevert(VotingErrors.InvalidStakeAmount.selector);
        staking.stake(200 ether); // 1100 > MAX
        vm.stopPrank();
    }

    function test_Unstake_Success_ToMinStake() public {
        vm.startPrank(user);
        staking.stake(300 ether);
        staking.unstake(200 ether);
        vm.stopPrank();

        assertEq(staking.stakedAmount(user), MIN);
    }

    function test_Unstake_Success_ToZero() public {
        vm.startPrank(user);
        staking.stake(200 ether);
        staking.unstake(200 ether);
        vm.stopPrank();

        assertEq(staking.stakedAmount(user), 0);
    }

    function test_Revert_Unstake_BelowMinStake() public {
        vm.startPrank(user);
        staking.stake(200 ether);

        vm.expectRevert(VotingErrors.InvalidStakeAmount.selector);
        staking.unstake(150 ether); // remaining = 50 < MIN
        vm.stopPrank();
    }

    function test_Revert_Unstake_NoStake() public {
        vm.prank(user);
        vm.expectRevert(VotingErrors.NoStakeFound.selector);
        staking.unstake(100 ether);
    }

    function test_Revert_Unstake_WhenLocked() public {
        vm.startPrank(user);
        staking.stake(200 ether);
        vm.stopPrank();

        staking.lock(user);

        vm.prank(user);
        vm.expectRevert(VotingErrors.StakeLocked.selector);
        staking.unstake(100 ether);
    }
}
