// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import "../../contracts/amm/Amm.sol";
import "../../contracts/tokens/SimpleERC20.sol";
import "../../contracts/oracle/MockOracle.sol";
import "../../contracts/amm/AmmErrors.sol";

contract SwapExactInOracleTest is Test {
    SimpleERC20 token0;
    SimpleERC20 token1;
    Amm amm;
    MockOracle oracle;

    address provider = address(0x1);
    address trader = address(0x2);

    function setUp() public {
        token0 = new SimpleERC20("Token0", "T0", 18);
        token1 = new SimpleERC20("Token1", "T1", 18);

        amm = new Amm(address(token0), address(token1), 30);
        oracle = new MockOracle();

        amm.setOracle(address(oracle));

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

    function test_swap_passes_when_price_matches_oracle() public {
        // Oracle price 1:1
        oracle.setPrice(address(token0), address(token1), 1e18);

        vm.startPrank(trader);

        uint256 amountOut = amm.swapExactIn(address(token0), 10 ether, 0);

        vm.stopPrank();

        require(amountOut > 0);
    }

    function test_swap_reverts_when_price_deviates_from_oracle() public {
        // Oracle says token0 is worth much more than AMM price
        oracle.setPrice(address(token0), address(token1), 2e18);

        vm.startPrank(trader);

        vm.expectRevert(SlippageExceeded.selector);
        amm.swapExactIn(address(token0), 10 ether, 0);

        vm.stopPrank();
    }

    function test_swap_without_oracle_skips_check() public {
        amm.setOracle(address(0));

        vm.startPrank(trader);

        uint256 amountOut = amm.swapExactIn(address(token0), 10 ether, 0);

        vm.stopPrank();

        require(amountOut > 0);
    }
}
