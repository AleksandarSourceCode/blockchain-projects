// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import "../../contracts/amm/Amm.sol";
import "../../contracts/tokens/SimpleERC20.sol";
import "../../contracts/amm/AmmErrors.sol";

contract RemoveLiquidityTest is Test {
    SimpleERC20 token0;
    SimpleERC20 token1;
    Amm amm;

    address provider = address(0x1);

    function setUp() public {
        token0 = new SimpleERC20("Token0", "T0", 18);
        token1 = new SimpleERC20("Token1", "T1", 18);

        amm = new Amm(address(token0), address(token1), 30);

        token0.mint(provider, 1_000 ether);
        token1.mint(provider, 1_000 ether);

        vm.startPrank(provider);
        token0.approve(address(amm), type(uint256).max);
        token1.approve(address(amm), type(uint256).max);
        amm.addLiquidity(500 ether, 500 ether);
        vm.stopPrank();
    }

    function test_removeLiquidity_partial() public {
        vm.startPrank(provider);

        (uint256 r0Before, uint256 r1Before) = amm.reserves();

        (uint256 amount0, uint256 amount1) = amm.removeLiquidity(100 ether);

        vm.stopPrank();

        require(amount0 > 0);
        require(amount1 > 0);

        (uint256 r0After, uint256 r1After) = amm.reserves();

        require(r0After < r0Before);
        require(r1After < r1Before);
    }

    function test_removeLiquidity_zero_reverts() public {
        vm.startPrank(provider);
        vm.expectRevert(ZeroAmount.selector);
        amm.removeLiquidity(0);
        vm.stopPrank();
    }

    function test_removeLiquidity_excess_reverts() public {
        vm.startPrank(provider);
        vm.expectRevert(SlippageExceeded.selector);
        amm.removeLiquidity(type(uint256).max);
        vm.stopPrank();
    }
}
