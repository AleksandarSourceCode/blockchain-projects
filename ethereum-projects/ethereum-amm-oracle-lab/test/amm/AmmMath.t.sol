// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import "../../contracts/amm/AmmMath.sol";

/// Test-only wrapper for AmmMath
contract AmmMathWrapper {
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 feeBps
    ) external pure returns (uint256) {
        return AmmMath.getAmountOut(amountIn, reserveIn, reserveOut, feeBps);
    }
}

contract AmmMathTest is Test {
    AmmMathWrapper ammMath;

    uint256 constant FEE_BPS = 30; // 0.30%

    function setUp() public {
        ammMath = new AmmMathWrapper();
    }

    function test_getAmountOut_basicSwap() public {
        uint256 amountOut = ammMath.getAmountOut(100, 1_000, 1_000, FEE_BPS);

        require(amountOut > 0);
        require(amountOut < 1_000);
    }

    function test_getAmountOut_feeApplied() public {
        uint256 outNoFee = ammMath.getAmountOut(
            10_000,
            1_000_000,
            1_000_000,
            0
        );

        uint256 outWithFee = ammMath.getAmountOut(
            10_000,
            1_000_000,
            1_000_000,
            FEE_BPS
        );

        require(outWithFee < outNoFee);
    }

    function test_getAmountOut_zeroInput_reverts() public {
        vm.expectRevert(ZeroAmount.selector);
        ammMath.getAmountOut(0, 1_000, 1_000, FEE_BPS);
    }

    function test_getAmountOut_noLiquidity_reverts() public {
        vm.expectRevert(NoLiquidity.selector);
        ammMath.getAmountOut(100, 0, 1_000, FEE_BPS);
    }

    function test_getAmountOut_invalidFee_reverts() public {
        vm.expectRevert(InvalidFee.selector);
        ammMath.getAmountOut(100, 1_000, 1_000, 10_000);
    }
}
