// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

interface IMarginManager {
    function isHealthy(address account) external view returns (bool);
}
