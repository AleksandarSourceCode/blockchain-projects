// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";

import "../../contracts/amm/Amm.sol";
import "../../contracts/tokens/SimpleERC20.sol";
import "../../contracts/oracle/MockOracle.sol";
import "../../contracts/amm/AmmErrors.sol";

contract AccessControlTest is Test {
    SimpleERC20 token0;
    SimpleERC20 token1;
    Amm amm;
    MockOracle oracle;

    address owner = address(0x1);
    address user1 = address(0x2);
    address user2 = address(0x3);

    function setUp() public {
        vm.startPrank(owner);

        token0 = new SimpleERC20("Token0", "TK0", 18);
        token1 = new SimpleERC20("Token1", "TK1", 18);

        amm = new Amm(address(token0), address(token1), 30);
        oracle = new MockOracle();

        token0.mint(user1, 1_000 ether);
        token1.mint(user1, 1_000 ether);

        token0.mint(user2, 1_000 ether);
        token1.mint(user2, 1_000 ether);

        vm.stopPrank();
    }

    function test_onlyOwnerCanSetOracle() public {
        vm.prank(user1);
        vm.expectRevert(NotOwner.selector);
        amm.setOracle(address(oracle));

        vm.prank(owner);
        amm.setOracle(address(oracle));

        assertEq(address(amm.oracle()), address(oracle));
    }

    function test_cannotWithdrawLiquidityOfAnotherLP() public {
        vm.startPrank(user1);
        token0.approve(address(amm), 100 ether);
        token1.approve(address(amm), 100 ether);
        amm.addLiquidity(100 ether, 100 ether);
        vm.stopPrank();

        vm.prank(user2);
        vm.expectRevert(SlippageExceeded.selector);
        amm.removeLiquidity(10 ether);
    }
}
