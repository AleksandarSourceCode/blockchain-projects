// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import "../../contracts/amm/Amm.sol";
import "../../contracts/tokens/SimpleERC20.sol";
import "../../contracts/amm/AmmErrors.sol";

contract AddLiquidityTest is Test {
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
        vm.stopPrank();
    }

    function test_addLiquidity_initial() public {
        vm.startPrank(provider);

        uint256 liquidity = amm.addLiquidity(100 ether, 200 ether);

        vm.stopPrank();

        (uint256 r0, uint256 r1) = amm.reserves();

        require(r0 == 100 ether);
        require(r1 == 200 ether);
        require(liquidity > 0);
    }

    function test_addLiquidity_zeroAmount_reverts() public {
        vm.startPrank(provider);
        vm.expectRevert(ZeroAmount.selector);
        amm.addLiquidity(0, 100 ether);
        vm.stopPrank();
    }

    function test_addLiquidity_mismatchedRatio_reverts() public {
        vm.startPrank(provider);

        amm.addLiquidity(100 ether, 100 ether);

        vm.expectRevert(SlippageExceeded.selector);
        amm.addLiquidity(100 ether, 300 ether);

        vm.stopPrank();
    }
}
