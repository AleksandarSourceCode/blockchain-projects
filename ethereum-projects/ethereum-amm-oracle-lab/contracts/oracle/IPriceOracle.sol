// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// Price oracle interface
interface IPriceOracle {
    /// Returns price of tokenIn denominated in tokenOut (1e18 scaled)
    function getPrice(
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 price);
}
