// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// Simple ERC721 implementation for standard exploration.
/// Core ERC721 transfers and approvals with metadata fields
/// and non-standard mint, burn, and simplified safe transfers.
contract SimpleERC721 {
    string public name;
    string public symbol;

    address public owner;

    mapping(uint256 => address) private owners;
    mapping(address => uint256) private balances;
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => mapping(address => bool)) private operatorApprovals;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
        owner = msg.sender;
    }

    function balanceOf(address owner_) public view returns (uint256) {
        require(owner_ != address(0), "zero address");
        return balances[owner_];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = owners[tokenId];
        require(tokenOwner != address(0), "nonexistent token");
        return tokenOwner;
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(owners[tokenId] != address(0), "nonexistent token");
        return tokenApprovals[tokenId];
    }

    function isApprovedForAll(
        address owner_,
        address operator
    ) public view returns (bool) {
        return operatorApprovals[owner_][operator];
    }

    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);

        require(
            msg.sender == tokenOwner ||
                isApprovedForAll(tokenOwner, msg.sender),
            "not authorized"
        );

        tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "self approval");

        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);

        require(tokenOwner == from, "not owner");
        require(to != address(0), "transfer to zero");
        require(
            msg.sender == tokenOwner ||
                getApproved(tokenId) == msg.sender ||
                isApprovedForAll(tokenOwner, msg.sender),
            "not authorized"
        );

        delete tokenApprovals[tokenId];

        balances[from] -= 1;
        balances[to] += 1;
        owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // Simplified safe transfer (no IERC721Receiver check)
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public {
        data;
        transferFrom(from, to, tokenId);
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        require(to != address(0), "mint to zero");
        require(owners[tokenId] == address(0), "already minted");

        balances[to] += 1;
        owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function burn(uint256 tokenId) public virtual {
        address tokenOwner = ownerOf(tokenId);

        require(
            msg.sender == tokenOwner ||
                getApproved(tokenId) == msg.sender ||
                isApprovedForAll(tokenOwner, msg.sender),
            "not authorized"
        );

        delete tokenApprovals[tokenId];

        balances[tokenOwner] -= 1;
        delete owners[tokenId];

        emit Transfer(tokenOwner, address(0), tokenId);
    }
}
