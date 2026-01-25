// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import "../../../../contracts/openzeppelin/erc20/OZERC20.sol";

contract OZERC20Test is Test {
    OZERC20 token;

    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    uint256 constant INITIAL_SUPPLY = 1_000;
    uint256 constant CAP = 2_000;
    uint256 constant ONE = 1e18;

    function setUp() public {
        token = new OZERC20("OZ Token", "OZT", INITIAL_SUPPLY, CAP);
    }

    function testInitialState() public view {
        assertEq(token.name(), "OZ Token");
        assertEq(token.symbol(), "OZT");
        assertEq(token.decimals(), 18);

        assertEq(token.totalSupply(), INITIAL_SUPPLY * ONE);
        assertEq(token.cap(), CAP * ONE);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY * ONE);
    }

    function testTransfer() public {
        token.transfer(user1, 100 * ONE);

        assertEq(token.balanceOf(user1), 100 * ONE);
        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY - 100) * ONE);
    }

    function testTransferBlockedWhenPaused() public {
        token.pause();

        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        token.transfer(user1, ONE);
    }

    function testMintByOwner() public {
        token.mint(user1, 500);

        assertEq(token.balanceOf(user1), 500 * ONE);
        assertEq(token.totalSupply(), 1_500 * ONE);
    }

    function testMintRespectsCap() public {
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC20ExceededCap(uint256,uint256)",
                (INITIAL_SUPPLY + 1500) * ONE,
                CAP * ONE
            )
        );
        token.mint(user1, 1500);
    }

    function testMintBlockedWhenPaused() public {
        token.pause();

        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        token.mint(user1, 1);
    }

    function testBurn() public {
        token.burn(200 * ONE);

        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY * ONE) - 200 * ONE);
        assertEq(token.totalSupply(), (INITIAL_SUPPLY * ONE) - 200 * ONE);
    }

    function testBurnFrom() public {
        token.approve(user1, 100 * ONE);

        vm.prank(user1);
        token.burnFrom(owner, 40 * ONE);

        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY * ONE) - 40 * ONE);
    }

    function testBurnBlockedWhenPaused() public {
        token.pause();

        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        token.burn(1);
    }

    function testPauseAndUnpause() public {
        token.pause();
        assertTrue(token.paused());

        token.unpause();
        assertFalse(token.paused());
    }

    function testOnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        token.pause();
    }
}
