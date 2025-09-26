// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

interface IPriceAdapter {
    function readPriceX18(bytes32 id) external view returns (uint256 priceX18, uint256 confX18, uint256 publishTime);
}