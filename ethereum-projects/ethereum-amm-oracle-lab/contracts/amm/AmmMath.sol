// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AmmErrors.sol";

// AMM math helpers
library AmmMath {
    uint256 internal constant BPS_DENOMINATOR = 10_000;

    // Calculates swap output using constant-product formula
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 feeBps
    ) internal pure returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        if (reserveIn == 0 || reserveOut == 0) revert NoLiquidity();
        if (feeBps >= BPS_DENOMINATOR) revert InvalidFee();

        uint256 amountInWithFee = (amountIn * (BPS_DENOMINATOR - feeBps)) /
            BPS_DENOMINATOR;

        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn + amountInWithFee);
    }

    // Computes the constant-product invariant
    function invariant(
        uint256 reserve0,
        uint256 reserve1
    ) internal pure returns (uint256) {
        return reserve0 * reserve1;
    }

    // Checks invariant preservation after a swap
    function isInvariantPreserved(
        uint256 reserve0Before,
        uint256 reserve1Before,
        uint256 reserve0After,
        uint256 reserve1After
    ) internal pure returns (bool) {
        return
            invariant(reserve0After, reserve1After) >=
            invariant(reserve0Before, reserve1Before);
    }
}
