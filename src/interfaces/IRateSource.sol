// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

interface IRateSource {
    function ratePerSecond() external view returns (uint256 r);
    function updatedAt() external view returns (uint64 t);
}
