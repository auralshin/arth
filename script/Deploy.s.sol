// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {ArthHook} from "src/hooks/ArthHook.sol";
import {ArthPoolFactory} from "src/factory/ArthPoolFactory.sol";
import {RiskEngine} from "src/risk/RiskEngine.sol";
import {IRiskEngine} from "src/interfaces/IRiskEngine.sol";
import {BaseIndex} from "src/oracles/BaseIndex.sol";
import {IBaseIndex} from "src/interfaces/IBaseIndex.sol";
import {PythOracleAdapter} from "src/oracles/PythOracleAdapter.sol";
import {WstETHRateSource} from "src/oracles/WstETHRateSource.sol";

contract Deploy_ArthPools is Script {
    // Different fees and tick spacings for each maturity to create unique PoolKeys
    uint24  constant POOL_FEE_1M      = 3000;  // 0.30% for 1M maturity
    uint24  constant POOL_FEE_3M      = 500;   // 0.05% for 3M maturity  
    uint24  constant POOL_FEE_9M      = 10000; // 1.00% for 9M maturity
    
    int24   constant TICK_SPACING_1M  = 60;    // Standard spacing for 1M
    int24   constant TICK_SPACING_3M  = 10;    // Tighter spacing for 3M
    int24   constant TICK_SPACING_9M  = 200;   // Wider spacing for 9M

    uint160 constant SQRT_PRICE_X96_1to1 = 79228162514264337593543950336;
    
    // CREATE2 Deployer Proxy (standard across most chains)
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    // Hook flags for mining
    uint160 constant FLAGS = uint160(
          Hooks.AFTER_INITIALIZE_FLAG
        | Hooks.BEFORE_SWAP_FLAG
        | Hooks.BEFORE_ADD_LIQUIDITY_FLAG
        | Hooks.AFTER_ADD_LIQUIDITY_FLAG
        | Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG
        | Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
    );

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        require(pk != 0, "PRIVATE_KEY missing");
        address DEPLOYER = vm.addr(pk);   // the EOA that's broadcasting
        
        // --- Env: core addresses (flexible for different networks) ---
        address POOL_MANAGER = vm.envOr("POOL_MANAGER", vm.envAddress("POOL_MANAGER_11155111"));
        address WSTETH       = vm.envOr("WSTETH", vm.envAddress("MOCK_WSTETH"));
        address USDC         = vm.envOr("USDC", vm.envAddress("MOCK_USDC"));

        // Pyth Oracle configuration
        address PYTH_CONTRACT_ADDR = vm.envAddress("PYTH_CONTRACT");
        uint256 PYTH_MAX_AGE = vm.envOr("PYTH_MAX_AGE", uint256(300)); // 5 minutes default

        // --- Env: WstETHRateSource params (with safe defaults) ---
        // How often we allow the source to update (seconds)
        uint64 WSTETH_MIN_UPDATE    = uint64(vm.envOr("WSTETH_MIN_UPDATE", uint256(15 minutes)));
        // Cap for instantaneous per-second rate (1e18-scale). Tune for your risk params.
        uint256 WSTETH_MAX_RATE_PER_SEC = vm.envOr("WSTETH_MAX_RATE_PER_SEC", uint256(1e14)); // 0.0001 * 1e18 per sec

        vm.startBroadcast(pk);

        IPoolManager poolManager = IPoolManager(POOL_MANAGER);
        console2.log("PoolManager:", address(poolManager));

        ArthPoolFactory factory = new ArthPoolFactory(poolManager, DEPLOYER);
        console2.log("ArthPoolFactory:", address(factory));

        RiskEngine riskEngine = new RiskEngine(DEPLOYER);
        console2.log("RiskEngine:", address(riskEngine));

        // --- Deploy & register rate sources ---
        WstETHRateSource wstSource = new WstETHRateSource(
            WSTETH,
            DEPLOYER,                   // admin/owner
            WSTETH_MIN_UPDATE,
            WSTETH_MAX_RATE_PER_SEC
        );
        console2.log("WstETHRateSource:", address(wstSource));

        address[] memory initialSources = new address[](1);
        initialSources[0] = address(wstSource);

        // --- Deploy BaseIndex with sources (underlying = wstETH) ---
        BaseIndex baseIndex = new BaseIndex(
            DEPLOYER,                   // admin
            WSTETH,                     // underlying
            500_000,                    // alphaPPM (50%)
            100_000,                    // maxDeviationPPM (10%)
            3600,                       // maxStale (1 hour)
            initialSources
        );
        console2.log("BaseIndex:", address(baseIndex));

        // ---- Hook mining and deployment (official pattern) ----
        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(poolManager, address(factory));
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_DEPLOYER, FLAGS, type(ArthHook).creationCode, constructorArgs);
        
        console2.log("Mined hook address:", hookAddress);
        console2.log("Salt:", vm.toString(salt));

        // Deploy the hook using CREATE2
        ArthHook hook = new ArthHook{salt: salt}(poolManager, address(factory));
        require(address(hook) == hookAddress, "Deploy_ArthPools: hook address mismatch");
        
        console2.log("ArthHook deployed:", address(hook));
        console2.log("Broadcaster / owner (DEPLOYER):", DEPLOYER);
        console2.log("Factory owner (should match DEPLOYER):", factory.owner());
        
        // Verify the hook address has correct flags in lower 16 bits
        uint16 lower16 = uint16(uint160(address(hook)));
        uint16 flags14 = uint16(FLAGS) & 0x3FFF;
        
        // HookMiner can return any of these 4 valid prefix variants:
        uint16 p0 = flags14;                  // 0x0000 | flags (0x1F80)
        uint16 p4 = 0x4000 | flags14;         // 0x4000 | flags (0x5F80) 
        uint16 p8 = 0x8000 | flags14;         // 0x8000 | flags (0x9F80)
        uint16 pC = 0xC000 | flags14;         // 0xC000 | flags (0xDF80)
        
        console2.log("Hook lower16:", lower16);
        console2.log("Expected flags (14-bit):", flags14);
        console2.log("Valid p0 (0x0000|flags):", p0);
        console2.log("Valid p4 (0x4000|flags):", p4);
        console2.log("Valid p8 (0x8000|flags):", p8);
        console2.log("Valid pC (0xC000|flags):", pC);
        
        // Accept any of the 4 valid prefix variants
        bool validVariant = (lower16 == p0 || lower16 == p4 || lower16 == p8 || lower16 == pC);
        require(validVariant, "Hook address has invalid flag suffix");
        
        console2.log("[OK] Hook address validation passed with variant:", lower16);

        factory.setHook(address(hook));
        console2.log("[OK] Hook set successfully in factory");

        // --- Deploy PythOracleAdapter ---
        PythOracleAdapter pythAdapter = new PythOracleAdapter(
            PYTH_CONTRACT_ADDR,
            PYTH_MAX_AGE
        );
        console2.log("PythOracleAdapter:", address(pythAdapter));
        
        // Note: PythOracleAdapter owner is automatically set to msg.sender in constructor

        // --- Determine token ordering for pool keys ---
        Currency c0;
        Currency c1;
        if (USDC < WSTETH) {
            c0 = Currency.wrap(USDC);
            c1 = Currency.wrap(WSTETH);
        } else {
            c0 = Currency.wrap(WSTETH);
            c1 = Currency.wrap(USDC);
        }

        uint64 nowTs = uint64(block.timestamp);
        uint64 mat1M = nowTs + uint64(30 days);
        uint64 mat3M = nowTs + uint64(90 days);
        uint64 mat9M = nowTs + uint64(270 days);

        // --- Setup roles and permissions ---
        console2.log("==============================");
        console2.log("Setting up roles and permissions for deployer:", DEPLOYER);
        
        // All contracts are already deployed with DEPLOYER as owner/admin:
        // - ArthPoolFactory: DEPLOYER is owner (set in constructor)
        // - RiskEngine: DEPLOYER is owner (set in constructor)  
        // - WstETHRateSource: DEPLOYER is owner (set in constructor)
        // - BaseIndex: DEPLOYER is admin (set in constructor)
        // - PythOracleAdapter: msg.sender is owner (set in constructor) - NOTE: needs fix
                console2.log("[OK] All contracts deployed with deployer as admin/owner");

        // --- Create pools ---
        console2.log("==============================");
        console2.log("Creating IRS pools with unique PoolKeys...");
        _createPool(factory, c0, c1, POOL_FEE_1M, TICK_SPACING_1M, mat1M, IBaseIndex(address(baseIndex)), IRiskEngine(address(riskEngine)), pythAdapter, "wstETH/USDC 1M (0.30% fee)");
        _createPool(factory, c0, c1, POOL_FEE_3M, TICK_SPACING_3M, mat3M, IBaseIndex(address(baseIndex)), IRiskEngine(address(riskEngine)), pythAdapter, "wstETH/USDC 3M (0.05% fee)");
        _createPool(factory, c0, c1, POOL_FEE_9M, TICK_SPACING_9M, mat9M, IBaseIndex(address(baseIndex)), IRiskEngine(address(riskEngine)), pythAdapter, "wstETH/USDC 9M (1.00% fee)");

        console2.log("==============================");
                console2.log("[SUCCESS] Deployment completed successfully!");
        console2.log("Deployer has admin/owner access to all contracts.");
        
        vm.stopBroadcast();
    }

    function _createPool(
        ArthPoolFactory factory,
        Currency c0,
        Currency c1,
        uint24 fee,
        int24 tickSpacing,
        uint64 maturity,
        IBaseIndex baseIndex,
        IRiskEngine riskEngine,
        PythOracleAdapter pythAdapter,
        string memory label_
    ) internal {
        (PoolId poolId, address hookAddr) = factory.createPool(
            c0,
            c1,
            fee,
            tickSpacing,
            SQRT_PRICE_X96_1to1,
            maturity,
            baseIndex,
            riskEngine,
            pythAdapter
        );

        console2.log("------------------------------");
        console2.log(label_);
        console2.log("PoolId:", vm.toString(abi.encodePacked(poolId)));
        console2.log("Hook  :", hookAddr);
        console2.log("Fee   :", fee);
        console2.log("TickSpacing:", uint256(int256(tickSpacing)));
        console2.log("Maturity (secs):", maturity);
    }
}
