// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../../../../contracts/manual/erc721/ERC721WithURI.sol";

contract ERC721WithURITest is Test {
    ERC721WithURI nft;

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

    string constant URI_1 = "https://example.com/metadata/1.json";
    string constant URI_2 = "https://example.com/metadata/2.json";

    function setUp() public {
        nft = new ERC721WithURI("Manual NFT", "MNFT");
    }

    function testInitialState() public {
        assertEq(nft.name(), "Manual NFT");
        assertEq(nft.symbol(), "MNFT");
        assertEq(nft.owner(), owner);
    }

    function testMintSetsTokenURI() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        assertEq(nft.ownerOf(TOKEN_ID), user1);
        assertEq(nft.tokenURI(TOKEN_ID), URI_1);
    }

    function testMintOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert("not owner");
        nft.mint(user1, TOKEN_ID, URI_1);
    }

    function testMintEmitsTransfer() public {
        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), user1, TOKEN_ID);

        nft.mint(user1, TOKEN_ID, URI_1);
    }

    function testCannotMintSameTokenTwice() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.expectRevert("already minted");
        nft.mint(user1, TOKEN_ID, URI_2);
    }

    function testTokenURINonexistentToken() public {
        vm.expectRevert("nonexistent token");
        nft.tokenURI(999);
    }

    function testBurnDeletesTokenURI() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.prank(user1);
        nft.burn(TOKEN_ID);

        vm.expectRevert("nonexistent token");
        nft.ownerOf(TOKEN_ID);

        vm.expectRevert("nonexistent token");
        nft.tokenURI(TOKEN_ID);
    }

    function testBurnByApproved() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.prank(user1);
        nft.approve(user2, TOKEN_ID);

        vm.prank(user2);
        nft.burn(TOKEN_ID);

        vm.expectRevert("nonexistent token");
        nft.tokenURI(TOKEN_ID);
    }

    function testBurnUnauthorized() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.prank(user2);
        vm.expectRevert("not authorized");
        nft.burn(TOKEN_ID);
    }

    function testBurnEmitsTransfer() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.expectEmit(true, true, true, true);
        emit Transfer(user1, address(0), TOKEN_ID);

        vm.prank(user1);
        nft.burn(TOKEN_ID);
    }

    function testURIIsolationBetweenTokens() public {
        nft.mint(user1, TOKEN_ID, URI_1);
        nft.mint(user2, TOKEN_ID_2, URI_2);

        assertEq(nft.tokenURI(TOKEN_ID), URI_1);
        assertEq(nft.tokenURI(TOKEN_ID_2), URI_2);
    }
}
