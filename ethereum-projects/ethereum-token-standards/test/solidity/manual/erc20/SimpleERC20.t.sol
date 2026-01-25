// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {SimpleERC20} from "../../../../contracts/manual/erc20/SimpleERC20.sol";

contract SimpleERC20Test is Test {
    SimpleERC20 token;

    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    uint256 constant INITIAL_SUPPLY = 1_000;
    uint256 constant ONE_TOKEN = 1e18;

    function setUp() public {
        token = new SimpleERC20("Simple Token", "SIM", INITIAL_SUPPLY);
    }

    function testInitialState() public view {
        assertEq(token.name(), "Simple Token");
        assertEq(token.symbol(), "SIM");
        assertEq(token.decimals(), 18);

        assertEq(token.totalSupply(), INITIAL_SUPPLY * ONE_TOKEN);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY * ONE_TOKEN);
    }

    function testTransfer() public {
        token.transfer(user1, 100 * ONE_TOKEN);

        assertEq(token.balanceOf(user1), 100 * ONE_TOKEN);
        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY - 100) * ONE_TOKEN);
    }

    function testTransferFailsIfInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert("insufficient balance");
        token.transfer(user2, ONE_TOKEN);
    }

    function testApproveAndTransferFrom() public {
        token.approve(user1, 200 * ONE_TOKEN);

        vm.prank(user1);
        token.transferFrom(owner, user2, 50 * ONE_TOKEN);

        assertEq(token.balanceOf(user2), 50 * ONE_TOKEN);
        assertEq(token.allowance(owner, user1), 150 * ONE_TOKEN);
    }

    function testTransferFromFailsIfAllowanceTooLow() public {
        token.approve(user1, 10 * ONE_TOKEN);

        vm.prank(user1);
        vm.expectRevert("allowance too low");
        token.transferFrom(owner, user2, 20 * ONE_TOKEN);
    }

    function testMintByOwner() public {
        token.mint(user1, 500);

        assertEq(token.balanceOf(user1), 500 * ONE_TOKEN);
        assertEq(token.totalSupply(), (INITIAL_SUPPLY + 500) * ONE_TOKEN);
    }

    function testMintFailsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert("not owner");
        token.mint(user1, 100);
    }

    function testBurn() public {
        token.burn(200);

        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY - 200) * ONE_TOKEN);
        assertEq(token.totalSupply(), (INITIAL_SUPPLY - 200) * ONE_TOKEN);
    }

    function testBurnFailsIfInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert("insufficient balance");
        token.burn(1);
    }

    function testBurnFrom() public {
        token.approve(user1, 100 * ONE_TOKEN);

        vm.prank(user1);
        token.burnFrom(owner, 40);

        assertEq(token.balanceOf(owner), (INITIAL_SUPPLY - 40) * ONE_TOKEN);
        assertEq(token.totalSupply(), (INITIAL_SUPPLY - 40) * ONE_TOKEN);
        assertEq(token.allowance(owner, user1), 60 * ONE_TOKEN);
    }

    function testBurnFromFailsIfAllowanceTooLow() public {
        token.approve(user1, 10 * ONE_TOKEN);

        vm.prank(user1);
        vm.expectRevert("allowance too low");
        token.burnFrom(owner, 20);
    }
}
