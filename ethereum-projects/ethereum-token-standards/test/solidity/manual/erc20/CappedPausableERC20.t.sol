// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import "../../../../contracts/manual/erc20/CappedPausableERC20.sol";

contract CappedPausableERC20Test is Test {
    CappedPausableERC20 token;

    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    uint256 constant INITIAL_SUPPLY = 1_000;
    uint256 constant CAP = 2_000;
    uint256 constant ONE = 1e18;

    function setUp() public {
        token = new CappedPausableERC20(
            "Capped Token",
            "CAP",
            INITIAL_SUPPLY,
            CAP
        );
    }

    function testInitialSupplyAndCap() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY * ONE);
        assertEq(token.cap(), CAP * ONE);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY * ONE);
    }

    function testMintRespectsCap() public {
        token.mint(owner, 500);
        assertEq(token.totalSupply(), 1_500 * ONE);

        vm.expectRevert("cap exceeded");
        token.mint(owner, 600);
        assertEq(token.totalSupply(), 1_500 * ONE);
    }

    function testPauseAndUnpause() public {
        token.pause();
        assertTrue(token.paused());

        token.unpause();
        assertFalse(token.paused());
    }

    function testOnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert("not owner");
        token.pause();
    }

    function testPausedBlocksTransfer() public {
        token.pause();

        vm.expectRevert("paused");
        token.transfer(user1, ONE);
    }

    function testPausedBlocksApprove() public {
        token.pause();

        vm.expectRevert("paused");
        token.approve(user1, ONE);
    }

    function testPausedBlocksTransferFrom() public {
        token.approve(user1, ONE);
        token.pause();

        vm.prank(user1);
        vm.expectRevert("paused");
        token.transferFrom(owner, user2, ONE);
    }

    function testPausedBlocksMint() public {
        token.pause();

        vm.expectRevert("paused");
        token.mint(owner, 1);
    }

    function testPausedBlocksBurn() public {
        token.pause();

        vm.expectRevert("paused");
        token.burn(1);
    }

    function testPausedBlocksBurnFrom() public {
        token.approve(user1, ONE);
        token.pause();

        vm.prank(user1);
        vm.expectRevert("paused");
        token.burnFrom(owner, 1);
    }

    function testIncreaseAllowance() public {
        token.increaseAllowance(user1, 100 * ONE);

        assertEq(token.allowance(owner, user1), 100 * ONE);
    }

    function testDecreaseAllowance() public {
        token.increaseAllowance(user1, 100 * ONE);
        token.decreaseAllowance(user1, 40 * ONE);

        assertEq(token.allowance(owner, user1), 60 * ONE);
    }

    function testDecreaseAllowanceBelowZeroReverts() public {
        token.increaseAllowance(user1, 10 * ONE);

        vm.expectRevert("below zero");
        token.decreaseAllowance(user1, 20 * ONE);
    }

    function testMintByOwner() public {
        token.mint(user1, 200);

        assertEq(token.balanceOf(user1), 200 * ONE);
        assertEq(token.totalSupply(), 1_200 * ONE);
    }

    function testMintByNonOwnerFails() public {
        vm.prank(user1);
        vm.expectRevert("not owner");
        token.mint(user1, 1);
    }

    function testBurn() public {
        token.burn(100);

        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY - 100) * ONE);
        assertEq(token.totalSupply(), (INITIAL_SUPPLY - 100) * ONE);
    }

    function testBurnFrom() public {
        token.approve(user1, 100 * ONE);

        vm.prank(user1);
        token.burnFrom(owner, 40);

        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY - 40) * ONE);
        assertEq(token.allowance(owner, user1), 60 * ONE);
    }
}
