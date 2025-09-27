// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {BasePoolDeployment} from "./BasePoolDeployment.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {console2} from "forge-std/console2.sol";
import {Vm} from "forge-std/Vm.sol";

contract DeployPool2 is BasePoolDeployment {
    function run() external {
        loadInfrastructureAddresses();
        
        address wstETH = _envAddress("MOCK_WSTETH");
        address usdc = _envAddress("MOCK_USDC");
        
        vm.startBroadcast();
        
        // Pool 2: wstETH/USDC 3M maturity
        // Calculate 3 months from now
        uint64 maturity = uint64(block.timestamp + 90 days);
        
        (PoolId poolId, address hook) = deployPool(
            wstETH,
            usdc,
            3000, // 0.30% fee
            60,   // tick spacing
            3959200290760829743920500360346095, // ~$4000 price
            maturity,
            "Pool 2: wstETH/USDC 3M",
            100000 // Salt start - unique for Pool 2
        );
        
        vm.stopBroadcast();
        
        console2.log("=== Pool 2 Deployment Complete ===");
        console2.log("Pool ID:", vm.toString(PoolId.unwrap(poolId)));
        console2.log("Hook Address:", hook);
        console2.log("Maturity:", maturity);
        console2.log("Tokens: wstETH/USDC");
        console2.log("Duration: 3 Months");
    }
}