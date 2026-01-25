// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// ERC20 implementation composed from OpenZeppelin extensions.
/// Includes capped supply, burn support, pause control, and owner-gated minting.
contract OZERC20 is ERC20, ERC20Capped, ERC20Burnable, Pausable, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 cap_
    )
        ERC20(name_, symbol_)
        ERC20Capped(cap_ * 10 ** decimals())
        Ownable(msg.sender)
    {
        require(initialSupply_ <= cap_, "initial > cap");

        _mint(msg.sender, initialSupply_ * 10 ** decimals());
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10 ** decimals());
    }

    // Combines ERC20 and ERC20Capped logic and enforces pause checks
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped) whenNotPaused {
        super._update(from, to, value);
    }
}
