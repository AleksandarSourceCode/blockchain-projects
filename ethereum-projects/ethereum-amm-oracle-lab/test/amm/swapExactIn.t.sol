// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import "../../contracts/amm/Amm.sol";
import "../../contracts/tokens/SimpleERC20.sol";
import "../../contracts/amm/AmmErrors.sol";

contract SwapExactInTest is Test {
    SimpleERC20 token0;
    SimpleERC20 token1;
    Amm amm;

    address provider = address(0x1);
    address trader = address(0x2);

    function setUp() public {
        token0 = new SimpleERC20("Token0", "T0", 18);
        token1 = new SimpleERC20("Token1", "T1", 18);

        amm = new Amm(address(token0), address(token1), 30);

        token0.mint(provider, 1_000 ether);
        token1.mint(provider, 1_000 ether);

        token0.mint(trader, 100 ether);
        token1.mint(trader, 100 ether);

        vm.startPrank(provider);
        token0.approve(address(amm), type(uint256).max);
        token1.approve(address(amm), type(uint256).max);
        amm.addLiquidity(500 ether, 500 ether);
        vm.stopPrank();

        vm.startPrank(trader);
        token0.approve(address(amm), type(uint256).max);
        token1.approve(address(amm), type(uint256).max);
        vm.stopPrank();
    }

    function test_swapExactIn_token0ToToken1() public {
        vm.startPrank(trader);

        uint256 amountOut = amm.swapExactIn(address(token0), 10 ether, 0);

        vm.stopPrank();

        require(amountOut > 0);

        (uint256 r0, uint256 r1) = amm.reserves();
        require(r0 > 500 ether);
        require(r1 < 500 ether);
    }

    function test_swapExactIn_zeroAmount_reverts() public {
        vm.startPrank(trader);
        vm.expectRevert(ZeroAmount.selector);
        amm.swapExactIn(address(token0), 0, 0);
        vm.stopPrank();
    }

    function test_swapExactIn_invalidToken_reverts() public {
        vm.startPrank(trader);
        vm.expectRevert(InvalidToken.selector);
        amm.swapExactIn(address(0xdead), 10 ether, 0);
        vm.stopPrank();
    }

    function test_swapExactIn_slippageExceeded_reverts() public {
        vm.startPrank(trader);

        vm.expectRevert(SlippageExceeded.selector);
        amm.swapExactIn(address(token0), 10 ether, type(uint256).max);

        vm.stopPrank();
    }
}
