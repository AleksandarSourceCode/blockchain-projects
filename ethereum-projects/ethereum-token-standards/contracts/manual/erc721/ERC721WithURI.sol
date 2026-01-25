// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SimpleERC721} from "./SimpleERC721.sol";

/// ERC721 extension adding per-token metadata URIs.
contract ERC721WithURI is SimpleERC721 {
    mapping(uint256 => string) private _tokenURIs;

    constructor(
        string memory name_,
        string memory symbol_
    ) SimpleERC721(name_, symbol_) {}

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        ownerOf(tokenId);
        return _tokenURIs[tokenId];
    }

    function mint(
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyOwner {
        super.mint(to, tokenId);
        _tokenURIs[tokenId] = uri;
    }

    function burn(uint256 tokenId) public override {
        super.burn(tokenId);
        delete _tokenURIs[tokenId];
    }
}
