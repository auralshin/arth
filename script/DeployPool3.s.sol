// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

import {BasePoolDeployment} from "./BasePoolDeployment.sol";
import {PoolId} from "@uniswap/v4-core/src/types/PoolId.sol";
import {console2} from "forge-std/console2.sol";
import {Vm} from "forge-std/Vm.sol";

contract DeployPool3 is BasePoolDeployment {
    function run() external {
        loadInfrastructureAddresses();
        
        address wstETH = _envAddress("MOCK_WSTETH");
        address pyusd = _envAddress("MOCK_PYUSD");
        
        vm.startBroadcast();
        
        // Pool 3: wstETH/PYUSD 1M maturity
        // Calculate 1 month from now
        uint64 maturity = uint64(block.timestamp + 30 days);
        
        (PoolId poolId, address hook) = deployPool(
            wstETH,
            pyusd,
            3000, // 0.30% fee
            60,   // tick spacing
            3959200290760829743920500360346095, // ~$4000 price
            maturity,
            "Pool 3: wstETH/PYUSD 1M",
            200000 // Salt start - unique for Pool 3
        );
        
        vm.stopBroadcast();
        
        console2.log("=== Pool 3 Deployment Complete ===");
        console2.log("Pool ID:", vm.toString(PoolId.unwrap(poolId)));
        console2.log("Hook Address:", hook);
        console2.log("Maturity:", maturity);
        console2.log("Tokens: wstETH/PYUSD");
        console2.log("Duration: 1 Month");
    }
}