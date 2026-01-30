// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title VotingToken
/// @notice ERC20 token used for stake-weighted employee voting
contract VotingToken is ERC20, Ownable {
    constructor(
        address admin,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) Ownable(admin) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
