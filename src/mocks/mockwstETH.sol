// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IStETHLike {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function getSharesByPooledEth(uint256 tokenAmount) external view returns (uint256);
    function getPooledEthByShares(uint256 sharesAmount) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract MockWstETH {
    string public name = "Mock wstETH";
    string public symbol = "wstETH";
    uint8 public constant decimals = 18;

    IStETHLike public immutable stETH;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(address _stETH) {
        stETH = IStETHLike(_stETH);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        if (a != type(uint256).max) {
            require(a >= amount, "allowance");
            allowance[from][msg.sender] = a - amount;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "to=0");
        require(balanceOf[from] >= amount, "balance");
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }

    function wrap(uint256 stAmount) external returns (uint256 wstMinted) {
        require(stETH.transferFrom(msg.sender, address(this), stAmount), "transferFrom stETH");
        // Convert stETH amount to shares -> mint that many wstETH
        wstMinted = stETH.getSharesByPooledEth(stAmount);
        _mint(msg.sender, wstMinted);
    }

    function unwrap(uint256 wstAmount) external returns (uint256 stReturned) {
        _burn(msg.sender, wstAmount);
        stReturned = stETH.getPooledEthByShares(wstAmount);
        require(stETH.transfer(msg.sender, stReturned), "transfer stETH");
    }

    function getWstETHByStETH(uint256 stAmount) external view returns (uint256) {
        return stETH.getSharesByPooledEth(stAmount);
    }

    function getStETHByWstETH(uint256 wstAmount) external view returns (uint256) {
        return stETH.getPooledEthByShares(wstAmount);
    }

    function _mint(address to, uint256 amt) internal {
        require(to != address(0), "to=0");
        totalSupply += amt;
        balanceOf[to] += amt;
        emit Transfer(address(0), to, amt);
    }

    function _burn(address from, uint256 amt) internal {
        require(balanceOf[from] >= amt, "balance");
        unchecked {
            balanceOf[from] -= amt;
            totalSupply -= amt;
        }
        emit Transfer(from, address(0), amt);
    }
}
