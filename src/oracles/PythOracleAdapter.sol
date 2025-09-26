// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract PythOracleAdapter {
    IPyth public immutable PYTH;
    uint256 public maxAge;
    address public owner;

    uint256 public maxConfidenceBps = 100;

    mapping(bytes32 => bool) public supported;

    event FeedEnabled(bytes32 indexed feedId, bool enabled);
    event MaxAgeUpdated(uint256 oldAge, uint256 newAge);
    event ConfidenceThresholdUpdated(
        uint256 oldThreshold,
        uint256 newThreshold
    );
    event PriceUpdated(
        bytes32 indexed feedId,
        uint256 price,
        uint256 confidence,
        uint64 publishTime
    );

    error NotOwner();
    error UnsupportedFeed(bytes32 feedId);
    error StalePrice(bytes32 feedId, uint64 publishTime, uint256 maxAge);
    error InsufficientFee(uint256 required, uint256 provided);
    error ConfidenceTooHigh(
        bytes32 feedId,
        uint256 confidence,
        uint256 price,
        uint256 maxBps
    );
    error InvalidPrice(bytes32 feedId, int64 price);
    error InvalidConfidence(bytes32 feedId, uint256 confidence);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert NotOwner();
    }

    constructor(address pythAddress, uint256 maxAgeSeconds) {
        owner = msg.sender;
        PYTH = IPyth(pythAddress);
        maxAge = maxAgeSeconds;
    }

    /**
     * @notice Update maximum age for price staleness checks
     * @param s New maximum age in seconds
     */
    function setMaxAge(uint256 s) external onlyOwner {
        uint256 oldAge = maxAge;
        maxAge = s;
        emit MaxAgeUpdated(oldAge, s);
    }

    /**
     * @notice Enable or disable a price feed
     * @param id Pyth price feed ID
     * @param on Whether to enable the feed
     */
    function setFeed(bytes32 id, bool on) external onlyOwner {
        supported[id] = on;
        emit FeedEnabled(id, on);
    }

    /**
     * @notice Set confidence threshold in basis points
     * @param bps Basis points (e.g., 100 = 1%)
     */
    function setConfidenceThreshold(uint256 bps) external onlyOwner {
        uint256 oldThreshold = maxConfidenceBps;
        maxConfidenceBps = bps;
        emit ConfidenceThresholdUpdated(oldThreshold, bps);
    }

    /**
     * @notice Pushes fresh Pyth updates. Overpay safely refunds.
     * @param updateData Binary update data from Hermes
     */
    function pushUpdates(bytes[] calldata updateData) external payable {
        uint256 fee = PYTH.getUpdateFee(updateData);
        if (msg.value < fee) revert InsufficientFee(fee, msg.value);

        PYTH.updatePriceFeeds{value: fee}(updateData);

        uint256 refund = msg.value - fee;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }

    function _scaleTo1e18(
        int64 price,
        int32 expo
    ) internal pure returns (uint256) {
        int256 e = int256(expo) + 18;
        uint256 p = uint256(int256(price));
        if (e >= 0) {
            return p * (10 ** uint256(e));
        } else {
            return p / (10 ** uint256(-e));
        }
    }

    function readPriceX18(
        bytes32 id
    )
        public
        view
        returns (uint256 pxX18, uint256 confX18, uint256 publishTime)
    {
        if (!supported[id]) revert UnsupportedFeed(id);
        PythStructs.Price memory p = PYTH.getPriceNoOlderThan(id, maxAge);
        if (p.price <= 0) revert InvalidPrice(id, p.price);

        pxX18 = _scaleTo1e18(p.price, p.expo);
        confX18 = _scaleTo1e18(int64(uint64(p.conf)), p.expo);
        publishTime = p.publishTime;

        // conf/price <= maxConfidenceBps / 10_000
        if (confX18 > Math.mulDiv(pxX18, maxConfidenceBps, 10_000)) {
            revert ConfidenceTooHigh(id, confX18, pxX18, maxConfidenceBps);
        }
    }

    /**
     * @notice Read price without confidence checks (for informational purposes)
     * @param id Pyth price feed ID
     * @return pxX18 Price scaled to 1e18
     * @return confX18 Confidence interval scaled to 1e18
     * @return publishTime Unix timestamp of price publication
     */
    function readPriceX18Unsafe(
        bytes32 id
    )
        external
        view
        returns (uint256 pxX18, uint256 confX18, uint256 publishTime)
    {
        if (!supported[id]) revert UnsupportedFeed(id);

        PythStructs.Price memory p = PYTH.getPriceNoOlderThan(id, maxAge);

        if (p.price <= 0) revert InvalidPrice(id, p.price);
        if (p.conf < 0) revert InvalidConfidence(id, p.conf);

        int256 expo = int256(p.expo);
        uint256 scale;

        if (expo >= 0) {
            scale = 10 ** (uint256(expo) + 18);
        } else {
            scale = 10 ** (18 - uint256(-expo));
        }

        pxX18 = uint256(int256(p.price)) * scale;
        confX18 = uint256(p.conf) * scale;
        publishTime = p.publishTime;
    }

    /**
     * @notice Get the current update fee for given update data
     * @param updateData Binary update data from Hermes
     * @return fee Required fee in wei
     */
    function getUpdateFee(
        bytes[] calldata updateData
    ) external view returns (uint256 fee) {
        return PYTH.getUpdateFee(updateData);
    }

    /**
     * @notice Check if a feed is supported and fresh
     * @param id Pyth price feed ID
     * @return isSupported Whether the feed is enabled
     * @return isFresh Whether the feed is within maxAge
     */
    function checkFeed(
        bytes32 id
    ) external view returns (bool isSupported, bool isFresh) {
        isSupported = supported[id];
        if (!isSupported) return (false, false);

        try PYTH.getPriceNoOlderThan(id, maxAge) returns (
            PythStructs.Price memory
        ) {
            isFresh = true;
        } catch {
            isFresh = false;
        }
    }

    /**
     * @notice Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }
}
