// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IPriceOracle.sol";

/// Simple manually controlled oracle for testing
contract MockOracle is IPriceOracle {
    // price[tokenIn][tokenOut] => price (1e18 scaled)
    mapping(address => mapping(address => uint256)) public prices;

    /// Sets price of tokenIn denominated in tokenOut
    function setPrice(
        address tokenIn,
        address tokenOut,
        uint256 price
    ) external {
        prices[tokenIn][tokenOut] = price;
    }

    /// @inheritdoc IPriceOracle
    function getPrice(
        address tokenIn,
        address tokenOut
    ) external view returns (uint256) {
        return prices[tokenIn][tokenOut];
    }
}
