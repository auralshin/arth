// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { PoolManager } from "@uniswap/v4-core/src/PoolManager.sol";
import { PoolKey } from "@uniswap/v4-core/src/types/PoolKey.sol";
import { Currency, CurrencyLibrary } from "@uniswap/v4-core/src/types/Currency.sol";
import { PoolId, PoolIdLibrary } from "@uniswap/v4-core/src/types/PoolId.sol";
import { SwapParams } from "@uniswap/v4-core/src/types/PoolOperation.sol";
import { ModifyLiquidityParams } from "@uniswap/v4-core/src/types/PoolOperation.sol";
import { BalanceDelta } from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import { Hooks } from "@uniswap/v4-core/src/libraries/Hooks.sol";
import { HookMiner } from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import { IUnlockCallback } from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";

import { ArthHook } from "../src/hooks/ArthHook.sol";
import { ArthPoolFactory } from "../src/factory/ArthPoolFactory.sol";
import { RiskEngine } from "../src/risk/RiskEngine.sol";
import { BaseIndex } from "../src/oracles/BaseIndex.sol";
import { IRiskEngine } from "../src/interfaces/IRiskEngine.sol";
import { IBaseIndex } from "../src/interfaces/IBaseIndex.sol";
import { OneInchLOPAdapter } from "../src/integrations/OneInchLOPAdapter.sol";
import { OneInchRouter } from "../src/integrations/OneInchRouter.sol";
import { IOrderMixin } from "@1inch/limit-order-protocol-contract/interfaces/IOrderMixin.sol";
import { TakerTraits, TakerTraitsLib } from "@1inch/limit-order-protocol-contract/libraries/TakerTraitsLib.sol";
import { Address, AddressLib } from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import { MakerTraits, MakerTraitsLib } from "@1inch/limit-order-protocol-contract/libraries/MakerTraitsLib.sol";
import { PythOracleAdapter } from "../src/oracles/PythOracleAdapter.sol";

/// @title Mock PythOracleAdapter for testing
contract MockPythOracleAdapter {
    function getPrice(bytes32) external pure returns (uint256) {
        return 1e18; // 1:1 price
    }
}

/// @title Mock ERC20 Token
contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function forceApprove(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}

/// @title Mock 1inch LOP for Integration Testing
contract MockLimitOrderProtocol {
    using SafeERC20 for IERC20;

    mapping(bytes32 => bool) public filledOrders;
    mapping(address => uint256) public nonces;

    event OrderFilled(bytes32 indexed orderHash, uint256 making, uint256 taking);

    function fillContractOrder(
        IOrderMixin.Order calldata order,
        bytes calldata /* signature */,
        uint256 amount,
        TakerTraits /* takerTraits */
    ) external returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash) {
        address maker = AddressLib.get(order.maker);
        address makerAsset = AddressLib.get(order.makerAsset);
        address takerAsset = AddressLib.get(order.takerAsset);
        
        orderHash = keccak256(abi.encode(order, nonces[maker]++));
        require(!filledOrders[orderHash], "Order already filled");
        filledOrders[orderHash] = true;

        if (amount > order.takingAmount) amount = order.takingAmount;
        takingAmount = amount;
        makingAmount = (amount * order.makingAmount) / order.takingAmount;

        IERC20(takerAsset).safeTransferFrom(msg.sender, maker, takingAmount);
        IERC20(makerAsset).safeTransferFrom(maker, msg.sender, makingAmount);

        emit OrderFilled(orderHash, makingAmount, takingAmount);
    }

    function fillContractOrderArgs(
        IOrderMixin.Order calldata order,
        bytes calldata /* signature */,
        uint256 amount,
        TakerTraits /* takerTraits */,
        bytes calldata /* args */
    ) external returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash) {
        address maker = AddressLib.get(order.maker);
        address makerAsset = AddressLib.get(order.makerAsset);
        address takerAsset = AddressLib.get(order.takerAsset);
        
        orderHash = keccak256(abi.encode(order, nonces[maker]++));
        require(!filledOrders[orderHash], "Order already filled");
        filledOrders[orderHash] = true;

        if (amount > order.takingAmount) amount = order.takingAmount;
        takingAmount = amount;
        makingAmount = (amount * order.makingAmount) / order.takingAmount;

        IERC20(takerAsset).safeTransferFrom(msg.sender, maker, takingAmount);
        IERC20(makerAsset).safeTransferFrom(maker, msg.sender, makingAmount);

        emit OrderFilled(orderHash, makingAmount, takingAmount);
    }
}

/// @title Mock Rate Source for BaseIndex
contract MockRateSource {
    uint256 public rate = 1e18; // 1:1 rate
    
    function getRate() external view returns (uint256) {
        return rate;
    }
    
    function setRate(uint256 _rate) external {
        rate = _rate;
    }
}

/// @title Full Integration Test Suite
/// @notice Tests the complete LOP→Router→ArthHook→PoolManager flow
contract OneInchIntegrationTest is Test, IUnlockCallback {
    using CurrencyLibrary for Currency;
    using PoolIdLibrary for PoolKey;
    using SafeERC20 for IERC20;

    // Core Uniswap v4 contracts
    PoolManager public poolManager;
    ArthHook public arthHook;
    ArthPoolFactory public factory;
    
    // IRS infrastructure
    RiskEngine public riskEngine;
    BaseIndex public baseIndex;
    MockRateSource public rateSource;
    MockPythOracleAdapter public pythAdapter;
    
    // 1inch integration contracts
    MockLimitOrderProtocol public mockLOP;
    OneInchLOPAdapter public lopAdapter;
    OneInchRouter public oneInchRouter;

    // Test tokens
    MockERC20 public weth;
    MockERC20 public usdc;

    // Test accounts
    address public trader = address(0x1234);
    address public maker = address(0x5678);
    address public liquidityProvider = address(0x9ABC);

    // Pool configuration
    PoolKey public testPoolKey;
    uint24 public constant POOL_FEE = 3000;
    int24 public constant TICK_SPACING = 60;

    function setUp() public {
        // Deploy test tokens
        weth = new MockERC20("Wrapped ETH", "WETH", 1000000 ether);
        usdc = new MockERC20("USD Coin", "USDC", 1000000000 * 1e6); // 1B USDC

        // Deploy core Uniswap v4
        poolManager = new PoolManager(address(this));

        // Deploy IRS infrastructure
        riskEngine = new RiskEngine(address(this));
        rateSource = new MockRateSource();
        
        address[] memory initialSources = new address[](1);
        initialSources[0] = address(rateSource);
        
        baseIndex = new BaseIndex(
            address(this), // admin
            address(weth), // underlying
            500000,        // alphaPPM (50%)
            100000,        // maxDeviationPPM (10%) 
            3600,          // maxStale (1 hour)
            initialSources
        );
        
        // Deploy mock PythOracleAdapter
        pythAdapter = new MockPythOracleAdapter();

        // Deploy ArthPoolFactory first
        factory = new ArthPoolFactory(poolManager, address(this));
        
        // Deploy ArthHook using proper address mining with HookMiner
        uint160 flags = uint160(
              Hooks.AFTER_INITIALIZE_FLAG
            | Hooks.BEFORE_SWAP_FLAG 
            | Hooks.BEFORE_ADD_LIQUIDITY_FLAG
            | Hooks.AFTER_ADD_LIQUIDITY_FLAG
            | Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG
            | Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        
        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(poolManager, address(factory));
        (address hookAddress, bytes32 salt) = HookMiner.find(
            address(this), // deployer (CREATE2_DEPLOYER in production)
            flags,
            type(ArthHook).creationCode,
            constructorArgs
        );
        
        // Deploy the hook using CREATE2
        arthHook = new ArthHook{salt: salt}(poolManager, address(factory));
        require(address(arthHook) == hookAddress, "ArthHook: hook address mismatch");
        
        // Set the hook in the factory
        factory.setHook(address(arthHook));

        // Deploy 1inch integration
        mockLOP = new MockLimitOrderProtocol();
        
        // Deploy OneInchRouter - it will create its own adapter internally
        oneInchRouter = new OneInchRouter(
            poolManager,
            address(mockLOP),
            address(weth),
            address(arthHook),
            IERC20(address(weth))
        );

        // Get the router's internal adapter for reference
        lopAdapter = oneInchRouter.lopAdapter();

        // Use factory to create pool (this handles initialization and registration)
        factory.createPool(
            Currency.wrap(address(usdc)), // currency0 (must be < currency1)
            Currency.wrap(address(weth)), // currency1
            POOL_FEE,
            TICK_SPACING,
            79228162514264337593543950336, // sqrt(1) price = 1:1
            uint64(block.timestamp + 30 days), // maturity 30 days from now
            IBaseIndex(address(baseIndex)),
            IRiskEngine(address(riskEngine)),
            PythOracleAdapter(address(pythAdapter))
        );
        
        // Update testPoolKey to match what the factory created
        testPoolKey = PoolKey({
            currency0: Currency.wrap(address(usdc)),
            currency1: Currency.wrap(address(weth)),
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            hooks: arthHook
        });

        // Fund test accounts
        _fundAccount(trader, 100 ether, 50000 * 1e6);
        _fundAccount(maker, 50 ether, 25000 * 1e6);
        _fundAccount(liquidityProvider, 200 ether, 100000 * 1e6);

        // Set up approvals for 1inch mock
        vm.startPrank(maker);
        weth.approve(address(mockLOP), type(uint256).max);
        usdc.approve(address(mockLOP), type(uint256).max);
        vm.stopPrank();

        // Set up approvals for router
        vm.startPrank(trader);
        weth.approve(address(oneInchRouter), type(uint256).max);
        usdc.approve(address(oneInchRouter), type(uint256).max);
        vm.stopPrank();

        // Configure risk engine - allow router as operator
        riskEngine.setOperator(address(oneInchRouter), true);
        
        // Set router to OneInchRouter (skip initial liquidity for now to avoid CurrencyNotSettled)
        factory.setRouter(address(arthHook), address(oneInchRouter));
    }



    /// @notice Test complete LOP fill → IRS swap flow
    function testLOPFillThenSwap() public {
        // Create 1inch limit order: Maker gives 1 WETH for 2000 USDC
        IOrderMixin.Order memory order = _createTestOrder(
            address(weth), // makerAsset
            address(usdc), // takerAsset  
            1 ether,       // makingAmount
            2000 * 1e6     // takingAmount
        );

        // Create swap params: Trader swaps the WETH they'll receive for USDC
        SwapParams memory swapParams = SwapParams({
            zeroForOne: true,           // WETH -> USDC
            amountSpecified: -0.5 ether, // Exact input: 0.5 WETH
            sqrtPriceLimitX96: 4295128740 // Min sqrt price + 1 for zeroForOne
        });

        // Encode trader info for hook
        bytes memory hookData = abi.encode(trader, uint256(block.timestamp + 1 hours));

        console.log("=== Before LOP Fill + Swap ===");
        console.log("Trader WETH:", weth.balanceOf(trader));
        console.log("Trader USDC:", usdc.balanceOf(trader));
        console.log("Maker WETH:", weth.balanceOf(maker));
        console.log("Maker USDC:", usdc.balanceOf(maker));

        // For testing, use pullFromCaller to let the adapter pull from router
        // First transfer tokens to router so it can approve the adapter
        vm.prank(trader);
        usdc.transfer(address(oneInchRouter), 1000 * 1e6);

        // Execute atomic LOP fill + IRS swap
        vm.prank(trader);
        oneInchRouter.lopFillThenSwap(
            order,
            hex"", // signature
            1000 * 1e6, // amount (fill 1000 USDC worth)
            TakerTraits.wrap(0), // takerTraits
            hex"", // takerArgs
            IERC20(address(usdc)), // takerAsset
            1000 * 1e6, // pullFromCaller - pull from router
            testPoolKey,
            swapParams,
            hookData,
            0.4 ether // minMakerAmount (expect ~0.5 WETH)
        );

        console.log("=== After LOP Fill + Swap ===");
        console.log("Trader WETH:", weth.balanceOf(trader));
        console.log("Trader USDC:", usdc.balanceOf(trader));
        console.log("Maker WETH:", weth.balanceOf(maker));
        console.log("Maker USDC:", usdc.balanceOf(maker));

        // Verify the flow worked
        assertTrue(usdc.balanceOf(maker) > 25000 * 1e6, "Maker should have received USDC from LOP");
        assertTrue(weth.balanceOf(maker) < 50 ether, "Maker should have given WETH to LOP");
        
        console.log("SUCCESS: Atomic LOP fill + IRS swap completed");
    }

    /// @notice Test LOP fill → Add Liquidity flow  
    function testLOPFillThenAddLiquidity() public {
        // Create order: Maker gives 2 WETH for 4000 USDC
        IOrderMixin.Order memory order = _createTestOrder(
            address(weth), // makerAsset
            address(usdc), // takerAsset
            2 ether,       // makingAmount  
            4000 * 1e6     // takingAmount
        );

        // Modify liquidity params
        ModifyLiquidityParams memory modifyParams = ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: 1000000000000000000, // Add liquidity
            salt: bytes32(0)
        });

        bytes memory hookData = abi.encode(trader, uint256(block.timestamp + 1 hours));

        console.log("=== Before LOP Fill + Add Liquidity ===");
        uint256 traderWethBefore = weth.balanceOf(trader);
        uint256 traderUsdcBefore = usdc.balanceOf(trader);

        // Execute atomic LOP fill + add liquidity
        vm.prank(trader);
        oneInchRouter.lopFillThenAddLiquidity(
            order,
            hex"",
            2000 * 1e6, // amount (fill 2000 USDC worth)
            TakerTraits.wrap(0),
            hex"",
            IERC20(address(usdc)), // takerAsset
            2000 * 1e6, // pullFromCaller
            testPoolKey,
            modifyParams,
            hookData,
            0.9 ether // minMakerAmount (expect ~1 WETH)
        );

        console.log("=== After LOP Fill + Add Liquidity ===");
        console.log("Trader WETH change:", int256(weth.balanceOf(trader)) - int256(traderWethBefore));
        console.log("Trader USDC change:", int256(usdc.balanceOf(trader)) - int256(traderUsdcBefore));

        // Verify liquidity was added
        assertTrue(usdc.balanceOf(trader) < traderUsdcBefore, "Trader should have spent USDC");
        
        console.log("SUCCESS: Atomic LOP fill + add liquidity completed");
    }

    /// @notice Test access control - only router can call adapter
    function testRouterAccessControl() public {
        IOrderMixin.Order memory order = _createTestOrder(
            address(weth),
            address(usdc), 
            1 ether,
            2000 * 1e6
        );

        // Direct adapter call should fail (not from router)
        vm.prank(trader);
        vm.expectRevert(OneInchLOPAdapter.NotRouter.selector);
        lopAdapter.fillContractOrder(
            order,
            hex"",
            1000 * 1e6,
            TakerTraits.wrap(0),
            IERC20(address(usdc)),
            1000 * 1e6,
            IERC20(address(weth)),
            trader,
            trader
        );

        console.log("SUCCESS: Router access control working");
    }



    /// @notice Helper to fund test accounts
    function _fundAccount(address account, uint256 wethAmount, uint256 usdcAmount) internal {
        weth.mint(account, wethAmount);
        usdc.mint(account, usdcAmount);
    }

    /// @notice Helper to create test orders
    function _createTestOrder(
        address makerAsset,
        address takerAsset,
        uint256 makingAmount,
        uint256 takingAmount
    ) internal view returns (IOrderMixin.Order memory) {
        return IOrderMixin.Order({
            salt: uint256(keccak256(abi.encode(block.timestamp, makerAsset, takerAsset))),
            maker: Address.wrap(uint256(uint160(maker))),
            receiver: Address.wrap(uint256(uint160(maker))),
            makerAsset: Address.wrap(uint256(uint160(makerAsset))),
            takerAsset: Address.wrap(uint256(uint160(takerAsset))),
            makingAmount: makingAmount,
            takingAmount: takingAmount,
            makerTraits: MakerTraits.wrap(0)
        });
    }

    /// @notice Add initial liquidity to the pool
    function _addInitialLiquidity() internal {
        vm.startPrank(liquidityProvider);
        
        // Approve pool manager
        weth.approve(address(poolManager), type(uint256).max);
        usdc.approve(address(poolManager), type(uint256).max);
        
        vm.stopPrank();

        // Add liquidity via unlock pattern (call unlock from test contract, not liquidityProvider)
        ModifyLiquidityParams memory params = ModifyLiquidityParams({
            tickLower: -120,
            tickUpper: 120,
            liquidityDelta: 10000000000000000000, // Large initial liquidity
            salt: bytes32(0)
        });

        bytes memory hookData = abi.encode(liquidityProvider, uint256(block.timestamp + 1 hours));
        
        // Use unlock pattern for modifyLiquidity
        poolManager.unlock(abi.encode(testPoolKey, params, hookData));
    }

    /// @notice Simple unlock callback for liquidity operations
    function unlockCallback(bytes calldata data) external override returns (bytes memory) {
        require(msg.sender == address(poolManager), "only PoolManager");
        (PoolKey memory key, ModifyLiquidityParams memory params, bytes memory hookData) = 
            abi.decode(data, (PoolKey, ModifyLiquidityParams, bytes));
        poolManager.modifyLiquidity(key, params, hookData);
        return "";
    }
}