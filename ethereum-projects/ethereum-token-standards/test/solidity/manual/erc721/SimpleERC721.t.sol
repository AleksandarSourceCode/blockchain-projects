// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../../../../contracts/manual/erc721/SimpleERC721.sol";

contract SimpleERC721Test is Test {
    SimpleERC721 nft;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    uint256 constant TOKEN_ID = 1;
    uint256 constant TOKEN_ID_2 = 2;

    function setUp() public {
        nft = new SimpleERC721("Simple NFT", "SNFT");
    }

    function testInitialState() public {
        assertEq(nft.name(), "Simple NFT");
        assertEq(nft.symbol(), "SNFT");
        assertEq(nft.owner(), owner);
        assertEq(nft.balanceOf(owner), 0);
    }

    function testMintByOwner() public {
        nft.mint(user1, TOKEN_ID);

        assertEq(nft.ownerOf(TOKEN_ID), user1);
        assertEq(nft.balanceOf(user1), 1);
    }

    function testMintOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert("not owner");
        nft.mint(user1, TOKEN_ID);
    }

    function testMintEmitsTransfer() public {
        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), user1, TOKEN_ID);

        nft.mint(user1, TOKEN_ID);
    }

    function testCannotMintSameTokenTwice() public {
        nft.mint(user1, TOKEN_ID);

        vm.expectRevert("already minted");
        nft.mint(user1, TOKEN_ID);
    }

    function testApprove() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user1);
        nft.approve(user2, TOKEN_ID);

        assertEq(nft.getApproved(TOKEN_ID), user2);
    }

    function testApproveOnlyOwnerOrOperator() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user2);
        vm.expectRevert("not authorized");
        nft.approve(user2, TOKEN_ID);
    }

    function testSetApprovalForAll() public {
        vm.prank(user1);
        nft.setApprovalForAll(user2, true);

        assertTrue(nft.isApprovedForAll(user1, user2));
    }

    function testTransferByOwner() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user1);
        nft.transferFrom(user1, user2, TOKEN_ID);

        assertEq(nft.ownerOf(TOKEN_ID), user2);
        assertEq(nft.balanceOf(user1), 0);
        assertEq(nft.balanceOf(user2), 1);
    }

    function testTransferByApproved() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user1);
        nft.approve(user2, TOKEN_ID);

        vm.prank(user2);
        nft.transferFrom(user1, user2, TOKEN_ID);

        assertEq(nft.ownerOf(TOKEN_ID), user2);
    }

    function testTransferClearsApproval() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user1);
        nft.approve(user2, TOKEN_ID);

        vm.prank(user1);
        nft.transferFrom(user1, user2, TOKEN_ID);

        assertEq(nft.getApproved(TOKEN_ID), address(0));
    }

    function testTransferUnauthorized() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user2);
        vm.expectRevert("not authorized");
        nft.transferFrom(user1, user2, TOKEN_ID);
    }

    function testBurnByOwner() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user1);
        nft.burn(TOKEN_ID);

        vm.expectRevert("nonexistent token");
        nft.ownerOf(TOKEN_ID);

        assertEq(nft.balanceOf(user1), 0);
    }

    function testBurnByApproved() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user1);
        nft.approve(user2, TOKEN_ID);

        vm.prank(user2);
        nft.burn(TOKEN_ID);

        vm.expectRevert("nonexistent token");
        nft.ownerOf(TOKEN_ID);
    }

    function testBurnUnauthorized() public {
        nft.mint(user1, TOKEN_ID);

        vm.prank(user2);
        vm.expectRevert("not authorized");
        nft.burn(TOKEN_ID);
    }

    function testBurnEmitsTransfer() public {
        nft.mint(user1, TOKEN_ID);

        vm.expectEmit(true, true, true, true);
        emit Transfer(user1, address(0), TOKEN_ID);

        vm.prank(user1);
        nft.burn(TOKEN_ID);
    }

    function testOwnerOfNonexistentToken() public {
        vm.expectRevert("nonexistent token");
        nft.ownerOf(999);
    }

    function testBalanceOfZeroAddress() public {
        vm.expectRevert("zero address");
        nft.balanceOf(address(0));
    }
}
