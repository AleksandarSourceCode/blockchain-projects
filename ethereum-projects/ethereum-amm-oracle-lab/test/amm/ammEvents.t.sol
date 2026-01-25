// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import "../../contracts/amm/Amm.sol";
import "../../contracts/amm/AmmEvents.sol";
import "../../contracts/tokens/SimpleERC20.sol";

contract AMMEventsTest is Test {
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
        vm.stopPrank();

        vm.startPrank(trader);
        token0.approve(address(amm), type(uint256).max);
        token1.approve(address(amm), type(uint256).max);
        vm.stopPrank();
    }

    function test_event_LiquidityAdded() public {
        uint256 amount0 = 100 ether;
        uint256 amount1 = 200 ether;

        vm.startPrank(provider);

        vm.expectEmit(true, false, false, true);
        emit LiquidityAdded(provider, amount0, amount1, amount0);

        amm.addLiquidity(amount0, amount1);

        vm.stopPrank();
    }

    function test_event_Swap() public {
        vm.startPrank(provider);
        amm.addLiquidity(500 ether, 500 ether);
        vm.stopPrank();

        uint256 amountIn = 10 ether;

        vm.startPrank(trader);

        (uint256 r0, uint256 r1) = amm.reserves();
        uint256 expectedOut = AmmMath.getAmountOut(
            amountIn,
            r0,
            r1,
            amm.feeBps()
        );

        vm.expectEmit(true, true, false, true);
        emit Swap(trader, address(token0), amountIn, expectedOut);

        amm.swapExactIn(address(token0), amountIn, 0);

        vm.stopPrank();
    }

    function test_event_LiquidityRemoved() public {
        vm.startPrank(provider);
        amm.addLiquidity(500 ether, 500 ether);

        uint256 liq = 100 ether;

        vm.expectEmit(true, false, false, true);
        emit LiquidityRemoved(provider, liq, liq, liq);

        amm.removeLiquidity(liq);

        vm.stopPrank();
    }
}
