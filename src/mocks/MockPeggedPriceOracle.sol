// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IStETHLike {
    function pooledEthPerShare() external view returns (uint256);
}

interface IWstETHLike {
    function getStETHByWstETH(uint256 wstAmount) external view returns (uint256);
}

/**
 * @title MockPeggedPriceOracle
 * @notice Oracle that maintains proper pegging relationships:
 * - Uses Pyth for ETH/USD and USDC/USD
 * - stETH pegged close to ETH (0.98-1.02x)
 * - wstETH always above stETH due to staking rewards
 */
contract MockPeggedPriceOracle is Ownable {
    IPyth public immutable pyth;
    IStETHLike public immutable stETH;
    IWstETHLike public immutable wstETH;
    
    // Pyth price feed IDs (confirmed working on Sepolia)
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    bytes32 public constant USDC_USD_PRICE_ID = 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a;
    
    // Pegging parameters (in basis points, 10000 = 100%)
    uint256 public stETHPegMin = 9800;  // 98% of ETH
    uint256 public stETHPegMax = 10200; // 102% of ETH
    
    // Mock token addresses to track
    address public mockUSDC;
    address public mockPYUSD;
    
    // Manual price overrides for testing (18 decimals)
    mapping(address => uint256) public manualPrices;
    mapping(address => bool) public useManualPrice;
    
    // Price age tolerance
    uint256 public maxPriceAge = 3600; // 1 hour
    
    event PriceUpdated(address indexed token, uint256 price);
    event PegParametersUpdated(uint256 stETHPegMin, uint256 stETHPegMax);
    event ManualPriceSet(address indexed token, uint256 price, bool enabled);
    
    constructor(
        address _pyth,
        address _stETH,
        address _wstETH,
        address _mockUSDC,
        address _mockPYUSD,
        address _owner
    ) Ownable(_owner) {
        pyth = IPyth(_pyth);
        stETH = IStETHLike(_stETH);
        wstETH = IWstETHLike(_wstETH);
        mockUSDC = _mockUSDC;
        mockPYUSD = _mockPYUSD;
    }
    
    /**
     * @notice Get price for any supported token in USD (18 decimals)
     */
    function getPrice(address token) external view returns (uint256 priceUSD) {
        // Check for manual price override first
        if (useManualPrice[token]) {
            return manualPrices[token];
        }
        
        // Handle ETH/WETH - use Pyth ETH/USD
        if (token == address(0) || _isWETH(token)) {
            return _getPythETHPrice();
        }
        
        // Handle USDC (real or mock) - use Pyth USDC/USD
        if (_isUSDC(token) || token == mockUSDC) {
            return _getPythUSDCPrice();
        }
        
        // Handle PYUSD (mock) - peg to USD with slight variance
        if (token == mockPYUSD) {
            return _getPythUSDCPrice(); // Use same as USDC for now
        }
        
        // Handle stETH - pegged to ETH with small variance
        if (token == address(stETH)) {
            uint256 ethPrice = _getPythETHPrice();
            uint256 stETHRate = _getStETHToETHRate();
            return (ethPrice * stETHRate) / 1e18;
        }
        
        // Handle wstETH - calculate from stETH rate
        if (token == address(wstETH)) {
            uint256 stETHPrice = this.getPrice(address(stETH));
            uint256 wstETHToStETHRate = _getWstETHToStETHRate();
            return (stETHPrice * wstETHToStETHRate) / 1e18;
        }
        
        revert("Unsupported token");
    }
    
    /**
     * @notice Get price ratio between two tokens (18 decimals)
     * @param tokenA Base token
     * @param tokenB Quote token  
     * @return ratio tokenA/tokenB ratio in 18 decimals
     */
    function getPriceRatio(address tokenA, address tokenB) external view returns (uint256 ratio) {
        uint256 priceA = this.getPrice(tokenA);
        uint256 priceB = this.getPrice(tokenB);
        return (priceA * 1e18) / priceB;
    }
    
    /**
     * @notice Get current stETH to ETH exchange rate
     */
    function _getStETHToETHRate() internal view returns (uint256) {
        // Get the current pooled ETH per share from mock stETH
        uint256 pooledEthPerShare = stETH.pooledEthPerShare();
        
        // Apply pegging bounds to simulate real stETH behavior
        uint256 peggedRate = pooledEthPerShare;
        
        // Ensure rate stays within peg bounds
        uint256 minRate = (1e18 * stETHPegMin) / 10000;
        uint256 maxRate = (1e18 * stETHPegMax) / 10000;
        
        if (peggedRate < minRate) peggedRate = minRate;
        if (peggedRate > maxRate) peggedRate = maxRate;
        
        return peggedRate;
    }
    
    /**
     * @notice Get current wstETH to stETH exchange rate
     */
    function _getWstETHToStETHRate() internal view returns (uint256) {
        // wstETH should always trade at a premium to stETH due to staking rewards
        // Use the actual conversion rate from the mock contract
        try wstETH.getStETHByWstETH(1e18) returns (uint256 stETHAmount) {
            return stETHAmount;
        } catch {
            // Fallback: assume 1.05x stETH (5% staking reward premium)
            return 1.05e18;
        }
    }
    
    /**
     * @notice Get ETH price from Pyth oracle
     */
    function _getPythETHPrice() internal view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(ETH_USD_PRICE_ID, maxPriceAge);
        
        require(price.price > 0, "Invalid ETH price");
        
        // Pyth typically uses -8 exponent (8 decimal places)
        // Convert to 18 decimals: price * 10^(18 + expo)
        uint256 scaledPrice;
        if (price.expo >= 0) {
            scaledPrice = uint256(int256(price.price)) * (10 ** (18 + uint256(int256(price.expo))));
        } else {
            // Most common case: expo = -8, so we multiply by 10^(18-8) = 10^10
            scaledPrice = uint256(int256(price.price)) * (10 ** (18 - uint256(-int256(price.expo))));
        }
        
        return scaledPrice;
    }
    
    /**
     * @notice Get USDC price from Pyth oracle
     */
    function _getPythUSDCPrice() internal view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(USDC_USD_PRICE_ID, maxPriceAge);
        
        require(price.price > 0, "Invalid USDC price");
        
        // Pyth typically uses -8 exponent (8 decimal places)
        // Convert to 18 decimals: price * 10^(18 + expo)
        uint256 scaledPrice;
        if (price.expo >= 0) {
            scaledPrice = uint256(int256(price.price)) * (10 ** (18 + uint256(int256(price.expo))));
        } else {
            // Most common case: expo = -8, so we multiply by 10^(18-8) = 10^10
            scaledPrice = uint256(int256(price.price)) * (10 ** (18 - uint256(-int256(price.expo))));
        }
        
        return scaledPrice;
    }
    
    // Helper functions to identify tokens (implement based on your token addresses)
    function _isWETH(address token) internal pure returns (bool) {
        // Add your WETH address check here
        return token == 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9; // Sepolia WETH
    }
    
    function _isUSDC(address token) internal pure returns (bool) {
        // Add your USDC address check here  
        return token == 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // Sepolia USDC
    }
    
    // Admin functions
    
    /**
     * @notice Set manual price for a token (for testing)
     */
    function setManualPrice(address token, uint256 priceUSD, bool enabled) external onlyOwner {
        manualPrices[token] = priceUSD;
        useManualPrice[token] = enabled;
        emit ManualPriceSet(token, priceUSD, enabled);
    }
    
    /**
     * @notice Update peg parameters for stETH
     */
    function setPegParameters(uint256 _stETHPegMin, uint256 _stETHPegMax) external onlyOwner {
        require(_stETHPegMin <= 10000 && _stETHPegMax >= 10000, "Invalid peg bounds");
        require(_stETHPegMin < _stETHPegMax, "Min must be < max");
        
        stETHPegMin = _stETHPegMin;
        stETHPegMax = _stETHPegMax;
        
        emit PegParametersUpdated(_stETHPegMin, _stETHPegMax);
    }
    
    /**
     * @notice Update maximum price age tolerance
     */
    function setMaxPriceAge(uint256 _maxPriceAge) external onlyOwner {
        maxPriceAge = _maxPriceAge;
    }
}