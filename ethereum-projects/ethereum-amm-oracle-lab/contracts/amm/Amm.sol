// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IAMM.sol";
import "./AmmMath.sol";
import "./AmmErrors.sol";
import "./AmmEvents.sol";
import "../tokens/SimpleERC20.sol";
import "../oracle/IPriceOracle.sol";

// Constant-product AMM for a fixed token pair
contract Amm is IAMM {
    using AmmMath for uint256;

    address public immutable token0;
    address public immutable token1;

    uint256 internal reserve0;
    uint256 internal reserve1;

    uint256 public immutable override feeBps;

    mapping(address => uint256) public liquidityOf;
    uint256 public totalLiquidity;

    IPriceOracle public oracle;
    uint256 public constant MAX_DEVIATION_BPS = 500; // 5%

    address public owner;
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _token0, address _token1, uint256 _feeBps) {
        if (_token0 == address(0) || _token1 == address(0)) {
            revert InvalidToken();
        }
        if (_token0 == _token1) {
            revert InvalidToken();
        }
        if (_feeBps >= 10_000) {
            revert InvalidFee();
        }

        token0 = _token0;
        token1 = _token1;
        feeBps = _feeBps;

        owner = msg.sender;
    }

    function tokens() external view override returns (address, address) {
        return (token0, token1);
    }

    function reserves() external view override returns (uint256, uint256) {
        return (reserve0, reserve1);
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = IPriceOracle(_oracle);
    }

    function addLiquidity(
        uint256 amount0,
        uint256 amount1
    ) external override returns (uint256 liquidity) {
        if (amount0 == 0 || amount1 == 0) {
            revert ZeroAmount();
        }

        if (reserve0 == 0 && reserve1 == 0) {
            SimpleERC20(token0).transferFrom(
                msg.sender,
                address(this),
                amount0
            );
            SimpleERC20(token1).transferFrom(
                msg.sender,
                address(this),
                amount1
            );

            _updateReserves(amount0, amount1);

            liquidity = amount0;
            liquidityOf[msg.sender] += liquidity;
            totalLiquidity += liquidity;

            emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);

            return liquidity;
        }

        // Enforce pool ratio
        if (amount0 * reserve1 != amount1 * reserve0) {
            revert SlippageExceeded();
        }

        SimpleERC20(token0).transferFrom(msg.sender, address(this), amount0);
        SimpleERC20(token1).transferFrom(msg.sender, address(this), amount1);

        reserve0 += amount0;
        reserve1 += amount1;

        liquidity = amount0;
        liquidityOf[msg.sender] += liquidity;
        totalLiquidity += liquidity;

        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);

        return liquidity;
    }

    function removeLiquidity(
        uint256 liquidity
    ) external override returns (uint256 amount0, uint256 amount1) {
        if (liquidity == 0) {
            revert ZeroAmount();
        }
        if (totalLiquidity == 0) {
            revert NoLiquidity();
        }

        uint256 userLiquidity = liquidityOf[msg.sender];
        if (liquidity > userLiquidity) {
            revert SlippageExceeded();
        }

        // Proportional withdrawal
        amount0 = (reserve0 * liquidity) / totalLiquidity;
        amount1 = (reserve1 * liquidity) / totalLiquidity;

        liquidityOf[msg.sender] -= liquidity;
        totalLiquidity -= liquidity;

        _updateReserves(reserve0 - amount0, reserve1 - amount1);

        SimpleERC20(token0).transfer(msg.sender, amount0);
        SimpleERC20(token1).transfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1, liquidity);
    }

    function swapExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external override returns (uint256 amountOut) {
        if (amountIn == 0) {
            revert ZeroAmount();
        }

        bool zeroForOne;

        if (tokenIn == token0) {
            zeroForOne = true;
        } else if (tokenIn == token1) {
            zeroForOne = false;
        } else {
            revert InvalidToken();
        }

        uint256 reserveIn = zeroForOne ? reserve0 : reserve1;
        uint256 reserveOut = zeroForOne ? reserve1 : reserve0;

        amountOut = AmmMath.getAmountOut(
            amountIn,
            reserveIn,
            reserveOut,
            feeBps
        );

        if (amountOut < minAmountOut) {
            revert SlippageExceeded();
        }

        address tokenOut;

        if (address(oracle) != address(0)) {
            tokenOut = zeroForOne ? token1 : token0;

            uint256 oraclePrice = oracle.getPrice(tokenIn, tokenOut);
            if (oraclePrice == 0) {
                revert OraclePriceMissing();
            }

            uint256 ammPrice = (amountOut * 1e18) / amountIn;

            uint256 diff = ammPrice > oraclePrice
                ? ammPrice - oraclePrice
                : oraclePrice - ammPrice;

            uint256 diffBps = (diff * 10_000) / oraclePrice;

            if (diffBps > MAX_DEVIATION_BPS) {
                revert SlippageExceeded();
            }
        }

        SimpleERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        tokenOut = zeroForOne ? token1 : token0;
        SimpleERC20(tokenOut).transfer(msg.sender, amountOut);

        if (zeroForOne) {
            _updateReserves(reserve0 + amountIn, reserve1 - amountOut);
        } else {
            _updateReserves(reserve0 - amountOut, reserve1 + amountIn);
        }

        emit Swap(msg.sender, tokenIn, amountIn, amountOut);

        return amountOut;
    }

    function _updateReserves(uint256 newReserve0, uint256 newReserve1) private {
        reserve0 = newReserve0;
        reserve1 = newReserve1;
    }
}
