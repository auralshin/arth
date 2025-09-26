// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBaseIndex} from "../interfaces/IBaseIndex.sol";
import {IRateSource} from "../interfaces/IRateSource.sol";
import {Errors} from "../libraries/Errors.sol";

contract BaseIndex is IBaseIndex, Ownable {
    address public controller; 
    
    address public immutable underlying;

    modifier onlyAuthorized() {
        _onlyAuthorized();
        _;
    }

    function _onlyAuthorized() internal view {
        if (msg.sender != owner() && msg.sender != controller) revert Errors.NotAuthorized();
    }

    uint256 private constant ONE_PPM = 1_000_000; 

    uint64 public override lastUpdate; 
    uint256 public override ratePerSecond; 
    uint256 public cumulative;

    uint256 public alphaPPM;
    uint256 public maxDeviationPPM;
    uint64 public maxStale;
    bool public frozen;
    uint256 public version;

    address[] public sources;
    mapping(address => bool) public isValidSource;

    bool public useManualRate;
    uint256 public manualRatePerSecond;

    event SourceAdded(address indexed source);
    event SourceRemoved(address indexed source);
    event ParamsSet(uint256 alphaPPM, uint256 maxDeviationPPM, uint64 maxStale);
    event FreezeToggled(bool frozen);
    event ManualRateSet(uint256 ratePerSecond, bool useManual);
    event RateUpdated(uint256 newRate, uint64 timestamp);

    constructor(
        address admin,
        address _underlying,
        uint256 _alphaPPM,
        uint256 _maxDeviationPPM,
        uint64 _maxStale,
        address[] memory initialSources
    ) Ownable(admin) {
        if (admin == address(0)) revert Errors.AdminZero();
        if (_alphaPPM > ONE_PPM || _maxDeviationPPM > ONE_PPM) revert Errors.InvalidPPM();
        if (_underlying == address(0)) revert Errors.InvalidSource();
        
        underlying = _underlying;
        alphaPPM = _alphaPPM;
        maxDeviationPPM = _maxDeviationPPM;
        maxStale = _maxStale;
        lastUpdate = uint64(block.timestamp);
        version = 1;

        for (uint256 i = 0; i < initialSources.length; ++i) {
            if (initialSources[i] == address(0)) revert Errors.ZeroAddress();
            sources.push(initialSources[i]);
            isValidSource[initialSources[i]] = true;
            emit SourceAdded(initialSources[i]);
        }
    }

    function setRatePerSecond(uint256 newRatePerSecond) external override onlyAuthorized {
        _updateCumulative();
        ratePerSecond = newRatePerSecond;
        useManualRate = true;
        manualRatePerSecond = newRatePerSecond;
        lastUpdate = uint64(block.timestamp);
        
        emit ManualRateSet(newRatePerSecond, true);
        emit RateUpdated(newRatePerSecond, uint64(block.timestamp));
    }

    function disableManualRate() external onlyAuthorized {
        useManualRate = false;
        emit ManualRateSet(0, false);
    }

    function cumulativeIndex() external view override returns (uint256 cum, uint64 tstamp) {
        cum = cumulative;
        tstamp = lastUpdate;
        
        if (block.timestamp > tstamp) {
            uint256 dt = block.timestamp - tstamp;
            cum += ratePerSecond * dt;
        }
    }

    function update() external {
        if (frozen) return;
        
        _updateCumulative();
        
        if (useManualRate) {
            ratePerSecond = manualRatePerSecond;
        } else {
            uint256 newRate = _guardedMedian();
            if (newRate != ratePerSecond) {
                ratePerSecond = newRate;
                emit RateUpdated(newRate, uint64(block.timestamp));
            }
        }
        
        lastUpdate = uint64(block.timestamp);
    }

    function setParams(
        uint256 _alphaPPM,
        uint256 _maxDeviationPPM,
        uint64 _maxStale
    ) external onlyAuthorized {
        if (_alphaPPM > ONE_PPM || _maxDeviationPPM > ONE_PPM) revert Errors.InvalidPPM();
        
        alphaPPM = _alphaPPM;
        maxDeviationPPM = _maxDeviationPPM;
        maxStale = _maxStale;
        version++;
        
        emit ParamsSet(_alphaPPM, _maxDeviationPPM, _maxStale);
    }

    function addSource(address source) external onlyAuthorized {
        if (source == address(0)) revert Errors.ZeroAddress();
        if (isValidSource[source]) revert Errors.SourceAlreadyExists();
        
        sources.push(source);
        isValidSource[source] = true;
        version++;
        
        emit SourceAdded(source);
    }

    function removeSource(address source) external onlyAuthorized {
        if (!isValidSource[source]) revert Errors.SourceNotRegistered();
        
        for (uint256 i = 0; i < sources.length; i++) {
            if (sources[i] == source) {
                sources[i] = sources[sources.length - 1];
                sources.pop();
                break;
            }
        }
        
        isValidSource[source] = false;
        version++;
        
        emit SourceRemoved(source);
    }

    function setFreeze(bool _frozen) external onlyAuthorized {
        frozen = _frozen;
        emit FreezeToggled(_frozen);
    }

    function setManualRate(uint256 _rate, bool _enable) external onlyAuthorized {
        manualRatePerSecond = _rate;
        useManualRate = _enable;
        
        if (_enable) {
            _updateCumulative();
            ratePerSecond = _rate;
            lastUpdate = uint64(block.timestamp);
        }
        
        emit ManualRateSet(_rate, _enable);
    }

    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }

    function ratePerSecondEffective() external view returns (uint256) {
        return useManualRate ? manualRatePerSecond : ratePerSecond;
    }

    function getSourceCount() external view returns (uint256) {
        return sources.length;
    }

    function getSource(uint256 index) external view returns (address) {
        return sources[index];
    }


    function _updateCumulative() internal {
        if (block.timestamp > lastUpdate) {
            uint256 dt = block.timestamp - lastUpdate;
            cumulative += ratePerSecond * dt;
        }
    }

    function _guardedMedian() internal view returns (uint256) {
        if (sources.length == 0) return ratePerSecond;

        uint256[] memory rates = new uint256[](sources.length);
        uint256 liveCount = 0;

        for (uint256 i = 0; i < sources.length; ++i) {
            IRateSource source = IRateSource(sources[i]);
            try source.updatedAt() returns (uint64 ts) {
                if (block.timestamp - ts <= maxStale) {
                    try source.ratePerSecond() returns (uint256 rate) {
                        rates[liveCount++] = rate;
                    } catch {
                    }
                }
            } catch {
            }
        }

        if (liveCount == 0) return ratePerSecond; 

        uint256 medianRate;
        if (liveCount == 1) {
            medianRate = rates[0];
        } else {
            for (uint256 i = 0; i < liveCount - 1; i++) {
                for (uint256 j = 0; j < liveCount - i - 1; j++) {
                    if (rates[j] > rates[j + 1]) {
                        uint256 temp = rates[j];
                        rates[j] = rates[j + 1];
                        rates[j + 1] = temp;
                    }
                }
            }
            
            if (liveCount % 2 == 0) {
                medianRate = (rates[liveCount / 2 - 1] + rates[liveCount / 2]) / 2;
            } else {
                medianRate = rates[liveCount / 2];
            }
        }

        if (ratePerSecond > 0) {
            uint256 maxDelta = (ratePerSecond * maxDeviationPPM) / ONE_PPM;
            
            if (medianRate > ratePerSecond + maxDelta) {
                medianRate = ratePerSecond + maxDelta;
            } else if (medianRate + maxDelta < ratePerSecond) {
                medianRate = ratePerSecond - maxDelta;
            }
        }

        if (ratePerSecond > 0) {
            uint256 alpha = alphaPPM;
            uint256 oneMinusAlpha = ONE_PPM - alpha;
            medianRate = (alpha * medianRate + oneMinusAlpha * ratePerSecond) / ONE_PPM;
        }

        return medianRate;
    }
}