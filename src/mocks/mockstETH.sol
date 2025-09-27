// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MockStETH {
    string public name = "Mock stETH";
    string public symbol = "stETH";
    uint8 public constant decimals = 18;

    uint256 public totalShares;
    mapping(address => uint256) internal _shares;

    mapping(address => mapping(address => uint256)) public allowance;

    uint256 public pooledEthPerShare = 1e18;

    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Rebased(uint256 newPooledEthPerShare);
    event Minted(address indexed to, uint256 tokenAmount, uint256 sharesMinted);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function totalSupply() public view returns (uint256) {
        return _toTokens(totalShares);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _toTokens(_shares[account]);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amountTokens) external returns (bool) {
        _transfer(msg.sender, to, amountTokens);
        return true;
    }

    function transferFrom(address from, address to, uint256 amountTokens) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        if (a != type(uint256).max) {
            require(a >= amountTokens, "allowance");
            allowance[from][msg.sender] = a - amountTokens;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }
        _transfer(from, to, amountTokens);
        return true;
    }

    function _transfer(address from, address to, uint256 amountTokens) internal {
        require(to != address(0), "to=0");
        uint256 shares = _toShares(amountTokens);
        require(_shares[from] >= shares, "balance");
        _shares[from] -= shares;
        _shares[to] += shares;
        emit Transfer(from, to, amountTokens);
    }

    function mintPooledEth(address to, uint256 tokenAmount) external onlyOwner returns (uint256 sharesMinted) {
        require(to != address(0), "to=0");
        sharesMinted = _toShares(tokenAmount);
        _shares[to] += sharesMinted;
        totalShares += sharesMinted;
        emit Transfer(address(0), to, tokenAmount);
        emit Minted(to, tokenAmount, sharesMinted);
    }

    function rebase(uint256 newPooledEthPerShare) external onlyOwner {
        require(newPooledEthPerShare > 0, "rate=0");
        pooledEthPerShare = newPooledEthPerShare;
        emit Rebased(newPooledEthPerShare);
    }

    function getPooledEthByShares(uint256 sharesAmount) public view returns (uint256) {
        return _toTokens(sharesAmount);
    }

    function getSharesByPooledEth(uint256 tokenAmount) public view returns (uint256) {
        return _toShares(tokenAmount);
    }

    function _toTokens(uint256 sharesAmount) internal view returns (uint256) {
        return (sharesAmount * pooledEthPerShare) / 1e18;
    }

    function _toShares(uint256 tokenAmount) internal view returns (uint256) {
        return (tokenAmount * 1e18) / pooledEthPerShare;
    }
}
