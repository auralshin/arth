// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {IRateSource} from "../interfaces/IRateSource.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ISfrxETH {
    function pricePerShare() external view returns (uint256);
    
    function convertToAssets(uint256 shares) external view returns (uint256 assets);
}

contract SfrxETHRateSource is IRateSource, Ownable {
    ISfrxETH public immutable sfrxETH;
    
    uint64 public override updatedAt;
    
    uint256 public override ratePerSecond; 
    
    uint256 private lastPricePerShare; 
    uint64 private lastUpdateTime;     
    
    address public constant SFRXETH_ADDRESS = 0xac3E018457B222d93114458476f3E3416Abbe38F;
    
    uint64 public constant MIN_UPDATE_INTERVAL = 1 hours;
    
    uint256 public constant MAX_RATE_PER_SECOND = 5e15; 
    
    event RateUpdated(uint256 newRate, uint256 pricePerShare, uint64 timestamp);
    
    constructor(address _sfrxETH, address _admin) Ownable(_admin) {
        sfrxETH = ISfrxETH(_sfrxETH);
        
        lastPricePerShare = _readPricePerShare();
        lastUpdateTime = uint64(block.timestamp);
        updatedAt = lastUpdateTime;
        ratePerSecond = 0; 
    }
    
    function poke() external {
        uint256 currentPrice = _readPricePerShare();
        uint64 currentTime = uint64(block.timestamp);
        
        uint64 timeDelta = currentTime - lastUpdateTime;
        require(timeDelta >= MIN_UPDATE_INTERVAL, "Too frequent");
        
        if (currentPrice == 0 || lastPricePerShare == 0) {
            return;
        }
        
        if (currentPrice > lastPricePerShare) {
            
            uint256 priceDelta = currentPrice - lastPricePerShare;
            uint256 newRate = (priceDelta * 1e18) / lastPricePerShare / timeDelta;
            
            if (newRate <= MAX_RATE_PER_SECOND) {
                ratePerSecond = newRate;
            } else {
                ratePerSecond = MAX_RATE_PER_SECOND; 
            }
        } else {
            ratePerSecond = 0;
        }
        
        lastPricePerShare = currentPrice;
        lastUpdateTime = currentTime;
        updatedAt = currentTime;
        
        emit RateUpdated(ratePerSecond, currentPrice, currentTime);
    }
    
    function getPricePerShareInfo() external view returns (uint256 pricePerShare, uint64 timeSinceUpdate) {
        pricePerShare = _readPricePerShare();
        timeSinceUpdate = uint64(block.timestamp) - lastUpdateTime;
    }
    
    function getHistoricalPrice() external view returns (uint256 lastPrice, uint64 lastTime) {
        lastPrice = lastPricePerShare;
        lastTime = lastUpdateTime;
    }
    
    function isFresh(uint64 maxStaleSeconds) external view returns (bool) {
        return (block.timestamp - updatedAt) <= maxStaleSeconds;
    }
    
    function emergencyResetRate() external onlyOwner {
        ratePerSecond = 0;
        updatedAt = uint64(block.timestamp);
    }
    
    function getUnderlyingToken() external pure returns (address) {
        return SFRXETH_ADDRESS;
    }
    
    
    function _readPricePerShare() internal view returns (uint256) {
        try sfrxETH.pricePerShare() returns (uint256 price) {
            return price;
        } catch {
            try sfrxETH.convertToAssets(1e18) returns (uint256 assets) {
                return assets; 
            } catch {
                return 0; 
            }
        }
    }
}