// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";

import {ArthHook} from "../src/hooks/ArthHook.sol";
import {ArthPoolFactory} from "../src/factory/ArthPoolFactory.sol";

contract DebugHookMiner is Test {
    function test_HookMinerDebug() public {
        address deployer = address(this);
        address owner = address(0xA);
        IPoolManager manager = new PoolManager(owner);
        ArthPoolFactory factory = new ArthPoolFactory(manager, owner);
        
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.BEFORE_ADD_LIQUIDITY_FLAG |
            Hooks.AFTER_ADD_LIQUIDITY_FLAG |
            Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG |
            Hooks.AFTER_REMOVE_LIQUIDITY_FLAG
        );
        
        console.log("Expected flags:", flags);
        console.log("Expected flags (hex):", vm.toString(abi.encodePacked(flags)));
        
        bytes memory args = abi.encode(manager, address(factory));
        
        (address predictedAddress, bytes32 salt) = HookMiner.find(
            deployer,
            flags, 
            type(ArthHook).creationCode,
            args
        );
        
        console.log("Predicted address:", predictedAddress);
        console.log("Salt:", vm.toString(abi.encodePacked(salt)));
        
        uint160 addressLower16 = uint160(predictedAddress) & uint160(0xFFFF);
        console.log("Address lower 16 bits:", addressLower16);
        console.log("Flags lower 16 bits:", flags & uint160(0xFFFF));
        
        require(addressLower16 == (flags & uint160(0xFFFF)), "Flag mismatch");
        
        ArthHook hook = new ArthHook{salt: salt}(manager, address(factory));
        console.log("Successfully deployed hook at:", address(hook));
        require(address(hook) == predictedAddress, "Address mismatch");
    }
}