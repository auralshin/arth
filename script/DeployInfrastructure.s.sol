// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";

import {BaseIndex} from "../src/oracles/BaseIndex.sol";
import {PythOracleAdapter} from "../src/oracles/PythOracleAdapter.sol";
import {WstETHRateSource} from "../src/oracles/WstETHRateSource.sol";
import {ArthPoolFactory} from "../src/factory/ArthPoolFactory.sol";
import {ArthLiquidityCaps} from "../src/risk/ArthLiquidityCaps.sol";
import {ArthV4Router} from "../src/periphery/ArthV4Router.sol";
import {ArthReceipts} from "../src/periphery/ArthReceipts.sol";
import {ArthController} from "../src/governance/ArthController.sol";
import {IWETH9} from "../src/interfaces/IWETH.sol";

import {RiskEngine} from "../src/risk/RiskEngine.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

// Mock contracts for testing
import {MockStETH} from "../src/mocks/mockstETH.sol";
import {MockWstETH} from "../src/mocks/mockwstETH.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {MockPeggedPriceOracle} from "../src/mocks/MockPeggedPriceOracle.sol";

contract DeployInfrastructure is Script {
    using Strings for uint256;

    function _envAddress(string memory key) internal view returns (address a) {
        try vm.envAddress(key) returns (address v) {
            require(v != address(0), string.concat("Zero env: ", key));
            a = v;
        } catch {
            revert(string.concat("Missing env: ", key));
        }
    }

    function _envAddressOrZero(string memory key) internal view returns (address a) {
        try vm.envAddress(key) returns (address v) {
            a = v;
        } catch {
            a = address(0);
        }
    }

    function _getPythContract() internal view returns (address) {
        uint256 chainId = block.chainid;
        
        if (chainId == 1) {
            return 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
        } else if (chainId == 11155111) {
            return 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21; // Sepolia Pyth Oracle
        } else if (chainId == 42161) {
            return 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        } else if (chainId == 421614) {
            return 0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF;
        } else if (chainId == 10) {
            return 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        } else if (chainId == 137) {
            return 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
        } else if (chainId == 8453) {
            return 0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a;
        } else {
            address envPyth = _envAddressOrZero("PYTH_CONTRACT");
            require(envPyth != address(0), "Unknown network and PYTH_CONTRACT not set");
            return envPyth;
        }
    }

    function _resolvePoolManager() internal view returns (address pm) {
        pm = _envAddressOrZero("POOL_MANAGER");
        if (pm != address(0)) return pm;

        string memory cidKey = string.concat(
            "POOL_MANAGER_",
            block.chainid.toString()
        );
        pm = _envAddressOrZero(cidKey);
        if (pm != address(0)) return pm;

        if (block.chainid == 1) pm = _envAddressOrZero("POOL_MANAGER_MAINNET");
        else if (block.chainid == 11155111)
            pm = _envAddressOrZero("POOL_MANAGER_SEPOLIA");
        else if (block.chainid == 8453)
            pm = _envAddressOrZero("POOL_MANAGER_BASE");
        else if (block.chainid == 84532)
            pm = _envAddressOrZero("POOL_MANAGER_BASE_SEPOLIA");
        else if (block.chainid == 42161)
            pm = _envAddressOrZero("POOL_MANAGER_ARBITRUM");
        else if (block.chainid == 421614)
            pm = _envAddressOrZero("POOL_MANAGER_ARBITRUM_SEPOLIA");
        else if (block.chainid == 10)
            pm = _envAddressOrZero("POOL_MANAGER_OPTIMISM");
        else if (block.chainid == 137)
            pm = _envAddressOrZero("POOL_MANAGER_POLYGON");

        require(
            pm != address(0),
            string.concat(
                "PoolManager not set. Provide POOL_MANAGER or ",
                cidKey,
                " (or a network alias env var). chainId=",
                block.chainid.toString()
            )
        );
    }

    function run() external {
        address pmAddr = _resolvePoolManager();
        address wethAddr = _envAddress("WETH");
        address uiWallet = _envAddress("UI_WALLET");

        vm.startBroadcast();

        console2.log("=== Arth IRS Infrastructure Deployment ===");
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", msg.sender);
        
        // Deploy or use existing PoolManager
        if (pmAddr == address(0)) {
            PoolManager pm = new PoolManager(msg.sender);
            pmAddr = address(pm);
            console2.log("Deployed local PoolManager:", pmAddr);
        } else {
            console2.log("Using existing PoolManager:", pmAddr);
        }

        IPoolManager manager = IPoolManager(pmAddr);

        console2.log("\n=== Deploying Governance ===");
        
        // Deploy governance
        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = msg.sender;
        executors[0] = msg.sender;
        TimelockController timelock = new TimelockController(
            1 days, 
            proposers,
            executors,
            msg.sender 
        );
        console2.log("TimelockController deployed at:", address(timelock));

        console2.log("\n=== Deploying Mock Tokens ===");
        
        // Deploy mock tokens
        MockStETH mockStETH = new MockStETH();
        console2.log("MockStETH deployed at:", address(mockStETH));
        
        MockWstETH mockWstETH = new MockWstETH(address(mockStETH));
        console2.log("MockWstETH deployed at:", address(mockWstETH));
        
        MockERC20 mockUSDC = new MockERC20("Mock USDC", "mUSDC");
        console2.log("MockUSDC deployed at:", address(mockUSDC));
        
        MockERC20 mockPYUSD = new MockERC20("Mock PYUSD", "mPYUSD");
        console2.log("MockPYUSD deployed at:", address(mockPYUSD));
        
        // Mint 100K tokens to deployer
        uint256 mintAmount = 100000 * 1e18;
        mockStETH.mintPooledEth(msg.sender, mintAmount);
        mockUSDC.mint(msg.sender, mintAmount);
        mockPYUSD.mint(msg.sender, mintAmount);
        console2.log("Minted 100K of each token to deployer:", msg.sender);

        console2.log("\n=== Deploying Oracles ===");
        
        // Deploy BaseIndex
        BaseIndex base = new BaseIndex(
            msg.sender, 
            wethAddr, 
            200_000, // baseFeeX6 
            200_000, // maxFeeX6
            1 hours, // minInterval
            new address[](0) // initialSources
        );
        console2.log("BaseIndex deployed at:", address(base));
        
        // Deploy WstETH Rate Source
        WstETHRateSource wstETHRateSource = new WstETHRateSource(
            address(mockWstETH),
            msg.sender, // admin
            1 hours,    // min update interval
            5e15        // max rate per second (0.5% per second)
        );
        console2.log("WstETHRateSource deployed at:", address(wstETHRateSource));
        
        // Add WstETH rate source to BaseIndex
        base.addSource(address(wstETHRateSource));
        console2.log("Added WstETHRateSource to BaseIndex");
        
        // Deploy PythOracleAdapter
        address pythContract = _getPythContract();
        console2.log("Using Pyth contract:", pythContract);
        PythOracleAdapter pythAdapter = new PythOracleAdapter(
            pythContract,
            12 hours // maxAge
        );
        console2.log("PythOracleAdapter deployed at:", address(pythAdapter));
        
        // Deploy MockPeggedPriceOracle for comprehensive price coverage
        MockPeggedPriceOracle priceOracle = new MockPeggedPriceOracle(
            pythContract,
            address(mockStETH),
            address(mockWstETH),
            address(mockUSDC),
            address(mockPYUSD),
            msg.sender
        );
        console2.log("MockPeggedPriceOracle deployed at:", address(priceOracle));
        
        console2.log("\n=== Deploying Risk Engine ===");
        
        // Deploy RiskEngine
        RiskEngine risk = new RiskEngine(msg.sender);
        console2.log("RiskEngine deployed at:", address(risk));
        
        // Configure RiskEngine with collateral assets
        RiskEngine.PriceSource memory wstETHPriceSource = RiskEngine.PriceSource({
            adapter: address(priceOracle),
            pythId: bytes32(0),
            maxAge: 0,
            minConfBps: 0,
            denom: 0,
            manualPriceX18: 0,
            useAdapter: true
        });
        
        risk.upsertCollateral(
            address(mockWstETH),
            1000, // 10% haircut
            true, // enabled
            wstETHPriceSource
        );
        console2.log("Configured wstETH as collateral in RiskEngine");

        console2.log("\n=== Deploying Core Contracts ===");
        
        // Deploy factory and other core contracts
        ArthPoolFactory factory = new ArthPoolFactory(manager, msg.sender);
        console2.log("ArthPoolFactory deployed at:", address(factory));

        ArthController controller = new ArthController(msg.sender, timelock);
        console2.log("ArthController deployed at:", address(controller));

        ArthLiquidityCaps caps = new ArthLiquidityCaps(msg.sender);
        console2.log("ArthLiquidityCaps deployed at:", address(caps));
        
        ArthV4Router router = new ArthV4Router(
            manager,
            IWETH9(wethAddr),
            caps,
            pythAdapter,
            msg.sender
        );
        console2.log("ArthV4Router deployed at:", address(router));
        
        ArthReceipts receipts = new ArthReceipts(msg.sender, address(router));
        console2.log("ArthReceipts deployed at:", address(receipts));

        console2.log("\n=== Final Configuration ===");
        
        // Set UI wallet as LP
        caps.setLP(uiWallet, true);
        console2.log("Set UI wallet as LP:", uiWallet);
        
        // Transfer governance (but keep admin rights for pool creation)
        base.setController(address(controller));
        // Note: Don't transfer ownership yet, we need it for pool creation
        console2.log("Set BaseIndex controller to:", address(controller));

        vm.stopBroadcast();

        console2.log("\n=== Infrastructure Deployment Summary ===");
        console2.log("Chain ID:", block.chainid);
        console2.log("PoolManager:", pmAddr);
        console2.log("WETH:", wethAddr);
        
        console2.log("\n=== Mock Tokens ===");
        console2.log("MockStETH:", address(mockStETH));
        console2.log("MockWstETH:", address(mockWstETH));
        console2.log("MockUSDC:", address(mockUSDC));
        console2.log("MockPYUSD:", address(mockPYUSD));
        
        console2.log("\n=== Core Infrastructure ===");
        console2.log("BaseIndex:", address(base));
        console2.log("RiskEngine:", address(risk));
        console2.log("ArthPoolFactory:", address(factory));
        console2.log("ArthController:", address(controller));
        console2.log("TimelockController:", address(timelock));
        console2.log("ArthLiquidityCaps:", address(caps));
        console2.log("ArthV4Router:", address(router));
        console2.log("ArthReceipts:", address(receipts));
        console2.log("PythOracleAdapter:", address(pythAdapter));
        console2.log("MockPeggedPriceOracle:", address(priceOracle));
        
        console2.log("\n=== Next Steps ===");
        console2.log("Infrastructure deployed successfully!");
        console2.log("Now deploy individual pools using:");
        console2.log("- DeployPool1.s.sol (wstETH/USDC 1M)");
        console2.log("- DeployPool2.s.sol (wstETH/USDC 3M)");
        console2.log("- DeployPool3.s.sol (wstETH/PYUSD 1M)");
        console2.log("- DeployPool4.s.sol (wstETH/PYUSD 3M)");
        
        console2.log("\n=== Token Balances ===");
        console2.log("Deployer stETH balance:", mockStETH.balanceOf(msg.sender) / 1e18, "tokens");
        console2.log("Deployer USDC balance:", mockUSDC.balanceOf(msg.sender) / 1e18, "tokens");
        console2.log("Deployer PYUSD balance:", mockPYUSD.balanceOf(msg.sender) / 1e18, "tokens");
    }
}