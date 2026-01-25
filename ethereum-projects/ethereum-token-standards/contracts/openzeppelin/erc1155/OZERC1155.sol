// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// OpenZeppelin ERC1155 with owner-gated minting and burn support
contract OZERC1155 is ERC1155, ERC1155Burnable, Ownable {
    constructor(string memory baseUri) ERC1155(baseUri) Ownable(msg.sender) {}

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyOwner {
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}
