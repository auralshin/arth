// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

interface IBaseIndex {
    function underlying() external view returns (address);
    function ratePerSecond() external view returns (uint256);
    function lastUpdate() external view returns (uint64);
    function setRatePerSecond(uint256 newRatePerSecond) external;
    function cumulativeIndex() external view returns (uint256 cum, uint64 tstamp);
}