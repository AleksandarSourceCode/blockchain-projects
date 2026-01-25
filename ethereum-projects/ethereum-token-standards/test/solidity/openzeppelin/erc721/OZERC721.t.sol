// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../../../../contracts/openzeppelin/erc721/OZERC721.sol";

contract OZERC721Test is Test {
    OZERC721 nft;

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

    string constant URI_1 = "ipfs://example/1.json";
    string constant URI_2 = "ipfs://example/2.json";

    uint96 constant ROYALTY_FEE = 500;

    function setUp() public {
        nft = new OZERC721("OZ NFT", "OZNFT", owner, ROYALTY_FEE);
    }

    function testInitialState() public {
        assertEq(nft.name(), "OZ NFT");
        assertEq(nft.symbol(), "OZNFT");
        assertEq(nft.owner(), owner);
    }

    function testMintByOwnerSetsURI() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        assertEq(nft.ownerOf(TOKEN_ID), user1);
        assertEq(nft.tokenURI(TOKEN_ID), URI_1);
    }

    function testMintOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        nft.mint(user1, TOKEN_ID, URI_1);
    }

    function testMintEmitsTransfer() public {
        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), user1, TOKEN_ID);

        nft.mint(user1, TOKEN_ID, URI_1);
    }

    function testCannotMintSameTokenTwice() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.expectRevert();
        nft.mint(user1, TOKEN_ID, URI_2);
    }

    function testTransferKeepsURI() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.prank(user1);
        nft.transferFrom(user1, user2, TOKEN_ID);

        assertEq(nft.ownerOf(TOKEN_ID), user2);
        assertEq(nft.tokenURI(TOKEN_ID), URI_1);
    }

    function testBurnDeletesToken() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        vm.prank(user1);
        nft.burn(TOKEN_ID);

        vm.expectRevert();
        nft.ownerOf(TOKEN_ID);

        vm.expectRevert();
        nft.tokenURI(TOKEN_ID);
    }

    function testRoyaltyInfo() public {
        nft.mint(user1, TOKEN_ID, URI_1);

        (address receiver, uint256 amount) = nft.royaltyInfo(TOKEN_ID, 1 ether);

        assertEq(receiver, owner);
        assertEq(amount, 0.05 ether);
    }

    function testSupportsInterfaces() public {
        assertTrue(nft.supportsInterface(0x80ac58cd));
        assertTrue(nft.supportsInterface(0x2a55205a));
    }
}
