// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// OpenZeppelin ERC721 with URI storage, burn support, and ERC2981 royalties.
contract OZERC721 is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    ERC2981,
    Ownable
{
    constructor(
        string memory name_,
        string memory symbol_,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        // ERC2981 provides royalty information only; enforcement is marketplace-dependent
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    function mint(
        address to,
        uint256 tokenId,
        string memory uri
    ) external onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
