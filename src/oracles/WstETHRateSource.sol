// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IRateSource} from "../interfaces/IRateSource.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IWstETH {
    function getStETHByWstETH(uint256 _wstETHAmount) external view returns (uint256);
    
    function stEthPerToken() external view returns (uint256);
}

contract WstETHRateSource is IRateSource, Ownable {
    IWstETH public immutable wstETH;
    address public immutable WSTETH_ADDRESS;
    
    uint64 public override updatedAt;
    
    uint256 public override ratePerSecond; 
    
    uint256 private lastExchangeRate; 
    uint64 private lastUpdateTime;
    
    uint64 public immutable MIN_UPDATE_INTERVAL;
    uint256 public immutable MAX_RATE_PER_SECOND;
    
    event RateUpdated(uint256 newRate, uint256 exchangeRate, uint64 timestamp);
    
    constructor(
        address _wstETH, 
        address _admin, 
        uint64 _minUpdateInterval, 
        uint256 _maxRatePerSecond
    ) Ownable(_admin) {
        wstETH = IWstETH(_wstETH);
        WSTETH_ADDRESS = _wstETH;
        MIN_UPDATE_INTERVAL = _minUpdateInterval;
        MAX_RATE_PER_SECOND = _maxRatePerSecond;
        
        lastExchangeRate = _readExchangeRate();
        lastUpdateTime = uint64(block.timestamp);
        updatedAt = lastUpdateTime;
        ratePerSecond = 0; 
    }
    
    function poke() external {
        uint256 currentRate = _readExchangeRate();
        uint64 currentTime = uint64(block.timestamp);
        
        uint64 timeDelta = currentTime - lastUpdateTime;
        require(timeDelta >= MIN_UPDATE_INTERVAL, "Too frequent");
        
        if (currentRate == 0 || lastExchangeRate == 0) {
            return;
        }
        
        if (currentRate > lastExchangeRate) {
            
            uint256 rateDelta = currentRate - lastExchangeRate;
            uint256 newRate = (rateDelta * 1e18) / lastExchangeRate / timeDelta;
            
            if (newRate <= MAX_RATE_PER_SECOND) {
                ratePerSecond = newRate;
            } else {
                ratePerSecond = MAX_RATE_PER_SECOND; 
            }
        } else {
            ratePerSecond = 0;
        }
        
        lastExchangeRate = currentRate;
        lastUpdateTime = currentTime;
        updatedAt = currentTime;
        
        emit RateUpdated(ratePerSecond, currentRate, currentTime);
    }
    
    function getExchangeRateInfo() external view returns (uint256 exchangeRate, uint64 timeSinceUpdate) {
        exchangeRate = _readExchangeRate();
        timeSinceUpdate = uint64(block.timestamp) - lastUpdateTime;
    }
    
    function getHistoricalRate() external view returns (uint256 lastRate, uint64 lastTime) {
        lastRate = lastExchangeRate;
        lastTime = lastUpdateTime;
    }
    
    function isFresh(uint64 maxStaleSeconds) external view returns (bool) {
        return (block.timestamp - updatedAt) <= maxStaleSeconds;
    }
    
    function emergencyResetRate() external onlyOwner {
        ratePerSecond = 0;
        updatedAt = uint64(block.timestamp);
    }
    
    function getUnderlyingToken() external view returns (address) {
        return WSTETH_ADDRESS;
    }
    
    
    function _readExchangeRate() internal view returns (uint256) {
        try wstETH.stEthPerToken() returns (uint256 rate) {
            return rate;
        } catch {
            try wstETH.getStETHByWstETH(1e18) returns (uint256 stETHAmount) {
                return stETHAmount; 
            } catch {
                return 0; 
            }
        }
    }
}