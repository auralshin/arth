// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {ArthHook} from "../hooks/ArthHook.sol";
import {BaseIndex} from "../oracles/BaseIndex.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";

contract ArthController is AccessControl, Pausable {
    bytes32 public constant ORACLE_ADMIN = keccak256("ORACLE_ADMIN");
    
    bytes32 public constant RISK_ADMIN = keccak256("RISK_ADMIN");
    
    bytes32 public constant PAUSER = keccak256("PAUSER");

    TimelockController public immutable TIMELOCK;

    event PausedAll();
    
    event UnpausedAll();
    
    event MaturitySet(PoolId indexed id, uint64 maturity);

    constructor(address admin, TimelockController _timelock) {
        TIMELOCK = _timelock;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ORACLE_ADMIN, address(_timelock));
        _grantRole(RISK_ADMIN, address(_timelock));
        _grantRole(PAUSER, admin);
    }

    function pauseAll() external onlyRole(PAUSER) {
        _pause();
        emit PausedAll();
    }

    function unpauseAll() external onlyRole(PAUSER) {
        _unpause();
        emit UnpausedAll();
    }

    function setOracleParams(
        BaseIndex idx,
        uint256 alphaPPM,
        uint256 maxDeviationPPM,
        uint64 maxStale
    ) external onlyRole(ORACLE_ADMIN) {
        idx.setParams(alphaPPM, maxDeviationPPM, maxStale);
    }

    function setOracleFreeze(BaseIndex idx, bool frozen) external onlyRole(ORACLE_ADMIN) {
        idx.setFreeze(frozen);
    }

    function setOracleManual(BaseIndex idx, uint256 ratePerSecond, bool enable)
        external
        onlyRole(ORACLE_ADMIN)
    {
        idx.setManualRate(ratePerSecond, enable);
    }

    function setMaturity(ArthHook hook, PoolKey calldata key, uint64 maturityTs)
        external
        onlyRole(RISK_ADMIN)
    {
        hook.setMaturity(key.toId(), maturityTs);
        emit MaturitySet(key.toId(), maturityTs);
    }

    function wireIndex(BaseIndex idx) external onlyRole(ORACLE_ADMIN) {
        idx.setController(address(this));
    }
}
