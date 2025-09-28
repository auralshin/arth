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
    // Hook flag constants
    uint16 constant HOOK_PREFIX = 0x4000;        // 0100_0000_0000_0000 (isHook bit)
    uint16 constant FLAGS_ONLY_MASK = 0x3FFF;    // lower 14 bits (strip prefix)
    
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
        uint160 expectedNoPrefix = flags & uint160(0xFFFF);
        uint160 expectedWithHookBit = (flags & uint160(FLAGS_ONLY_MASK)) | uint160(HOOK_PREFIX);

        console.log("Address lower 16 bits:", addressLower16);
        console.log("Flags lower 16 bits:", expectedNoPrefix);
        console.log("Expected with hook bit:", expectedWithHookBit);

        bool matchesExact = addressLower16 == expectedNoPrefix;          // some miners return plain flags
        bool matchesHook  = addressLower16 == expectedWithHookBit;       // most v4 miners set the 0x4000 hook bit
        require(matchesExact || matchesHook, "Flag mismatch");
        
        ArthHook hook = new ArthHook{salt: salt}(manager, address(factory));
        console.log("Successfully deployed hook at:", address(hook));
        require(address(hook) == predictedAddress, "Address mismatch");
    }
}