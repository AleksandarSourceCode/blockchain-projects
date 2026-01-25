// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Public AMM interface
interface IAMM {
    /// Returns token pair addresses
    function tokens() external view returns (address token0, address token1);

    /// Returns current reserves
    function reserves()
        external
        view
        returns (uint256 reserve0, uint256 reserve1);

    /// Returns swap fee in basis points
    function feeBps() external view returns (uint256);

    /// Adds liquidity to the pool
    function addLiquidity(
        uint256 amount0,
        uint256 amount1
    ) external returns (uint256 liquidity);

    /// Removes liquidity from the pool
    function removeLiquidity(
        uint256 liquidity
    ) external returns (uint256 amount0, uint256 amount1);

    /// Swaps exact input amount for the other token
    function swapExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut);
}
