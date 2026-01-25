// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// ERC20 implementation extended with supply cap and pause control.
/// Includes metadata, allowance helpers, and additional mint/burn logic.
contract CappedPausableERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;

    uint256 public totalSupply;
    uint256 public immutable cap;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    // Owner is used for privileged actions (non-standard ERC20 behavior)
    address public owner;

    bool public paused;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "paused");
        _;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Paused(address account);
    event Unpaused(address account);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint256 _cap
    ) {
        require(_cap > 0, "cap is zero");
        require(_initialSupply <= _cap, "initial > cap");

        owner = msg.sender;

        name = _name;
        symbol = _symbol;
        cap = _cap * 10 ** decimals;

        uint256 supply = _initialSupply * 10 ** decimals;
        totalSupply = supply;
        balances[msg.sender] = supply;

        emit Transfer(address(0), msg.sender, supply);
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function allowance(
        address tokenOwner,
        address spender
    ) public view returns (uint256) {
        return allowances[tokenOwner][spender];
    }

    function transfer(
        address to,
        uint256 value
    ) public whenNotPaused returns (bool) {
        require(to != address(0), "transfer to zero address");
        require(balances[msg.sender] >= value, "insufficient balance");

        balances[msg.sender] -= value;
        balances[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(
        address spender,
        uint256 value
    ) public whenNotPaused returns (bool) {
        require(spender != address(0), "approve zero address");

        allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public whenNotPaused returns (bool) {
        require(to != address(0), "transfer to zero address");
        require(balances[from] >= value, "balance too low");
        require(allowances[from][msg.sender] >= value, "allowance too low");

        allowances[from][msg.sender] -= value;
        balances[from] -= value;
        balances[to] += value;

        emit Transfer(from, to, value);
        return true;
    }

    // Allowance helpers to mitigate approve race condition (non-standard)
    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) public whenNotPaused returns (bool) {
        require(spender != address(0), "zero address");

        allowances[msg.sender][spender] += addedValue;
        emit Approval(msg.sender, spender, allowances[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public whenNotPaused returns (bool) {
        require(spender != address(0), "zero address");

        uint256 current = allowances[msg.sender][spender];
        require(current >= subtractedValue, "below zero");

        allowances[msg.sender][spender] = current - subtractedValue;
        emit Approval(msg.sender, spender, allowances[msg.sender][spender]);
        return true;
    }

    // Additional ERC20 functionality (non-standard)

    function mint(
        address to,
        uint256 amount
    ) public onlyOwner whenNotPaused returns (bool) {
        require(to != address(0), "mint to zero address");

        uint256 value = amount * 10 ** decimals;
        require(totalSupply + value <= cap, "cap exceeded");

        totalSupply += value;
        balances[to] += value;

        emit Transfer(address(0), to, value);
        return true;
    }

    function burn(uint256 amount) public whenNotPaused returns (bool) {
        uint256 value = amount * 10 ** decimals;
        require(balances[msg.sender] >= value, "insufficient balance");

        balances[msg.sender] -= value;
        totalSupply -= value;

        emit Transfer(msg.sender, address(0), value);
        return true;
    }

    function burnFrom(
        address from,
        uint256 amount
    ) public whenNotPaused returns (bool) {
        uint256 value = amount * 10 ** decimals;

        require(balances[from] >= value, "balance too low");
        require(allowances[from][msg.sender] >= value, "allowance too low");

        allowances[from][msg.sender] -= value;
        balances[from] -= value;
        totalSupply -= value;

        emit Transfer(from, address(0), value);
        return true;
    }

    // Pause control is an additional safety mechanism (non-standard)
    function pause() public onlyOwner {
        require(!paused, "already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner {
        require(paused, "not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }
}
