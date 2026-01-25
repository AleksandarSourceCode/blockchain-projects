// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// Emitted when liquidity is added
event LiquidityAdded(
    address indexed provider,
    uint256 amount0,
    uint256 amount1,
    uint256 liquidity
);

/// Emitted when liquidity is removed
event LiquidityRemoved(
    address indexed provider,
    uint256 amount0,
    uint256 amount1,
    uint256 liquidity
);

/// Emitted on successful swap
event Swap(
    address indexed trader,
    address indexed tokenIn,
    uint256 amountIn,
    uint256 amountOut
);
