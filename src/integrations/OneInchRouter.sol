// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { IUnlockCallback } from "@uniswap/v4-core/src/interfaces/callback/IUnlockCallback.sol";
import { PoolKey } from "@uniswap/v4-core/src/types/PoolKey.sol";
import { SwapParams } from "@uniswap/v4-core/src/types/PoolOperation.sol";
import { ModifyLiquidityParams } from "@uniswap/v4-core/src/types/PoolOperation.sol";
import { BalanceDelta } from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { OneInchLOPAdapter } from "./OneInchLOPAdapter.sol";
import { IOrderMixin } from "@1inch/limit-order-protocol-contract/interfaces/IOrderMixin.sol";
import { TakerTraits } from "@1inch/limit-order-protocol-contract/libraries/TakerTraitsLib.sol";

/// @title OneInchRouter
/// @notice Phase-2 Router that fills 1inch orders then executes IRS actions atomically
/// @dev Integrates OneInchLOPAdapter with Uniswap v4 PoolManager for seamless LOP->IRS flows
contract OneInchRouter is IUnlockCallback, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Errors
    error UnauthorizedCallback();
    error InvalidParameters();
    error InsufficientMakerAsset();
    error CallbackFailed();

    /// @notice Events
    event LimitOrderFilled(bytes32 indexed orderHash, uint256 making, uint256 taking);
    event IRSActionExecuted(bytes32 indexed poolId, address indexed user, string action);

    /// @notice Immutable addresses
    IPoolManager public immutable manager;
    OneInchLOPAdapter public immutable lopAdapter;
    address public immutable hook;       // ArthHook address
    IERC20 public immutable tokenIn;     // Expected maker asset for IRS operations

    /// @notice Action types for callback routing
    enum ActionType { SWAP, ADD_LIQUIDITY, REMOVE_LIQUIDITY }

    /// @notice Data structure for unlock callback
    struct CallbackData {
        ActionType actionType;
        PoolKey key;
        bytes params;        // Encoded swap/modify params
        bytes hookData;      // Data passed to hook (trader info, etc.)
        address user;        // Original caller
        uint256 minMakerAmount; // Minimum maker asset received from LOP fill
    }

    constructor(
        IPoolManager _manager,
        OneInchLOPAdapter _lopAdapter,
        address _hook,
        IERC20 _tokenIn
    ) Ownable(msg.sender) {
        if (address(_manager) == address(0) || 
            address(_lopAdapter) == address(0) || 
            _hook == address(0) || 
            address(_tokenIn) == address(0)) {
            revert InvalidParameters();
        }
        
        manager = _manager;
        lopAdapter = _lopAdapter;
        hook = _hook;
        tokenIn = _tokenIn;
    }

    /// @notice Fill 1inch limit order then execute swap on IRS pool
    /// @param order 1inch limit order structure
    /// @param signature Maker's signature
    /// @param amount Taker amount to fill
    /// @param takerTraits Encoded taker preferences and thresholds
    /// @param takerArgs Optional taker args (permit, extension, interaction)
    /// @param takerAsset Token we pay to maker
    /// @param pullFromCaller Amount of taker asset to pull from caller
    /// @param key Uniswap v4 pool key for IRS action
    /// @param swapParams Parameters for the swap
    /// @param hookData Data passed to ArthHook (encoded trader address, etc.)
    /// @param minMakerAmount Minimum maker asset amount required from LOP fill
    function lopFillThenSwap(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        uint256 amount,
        TakerTraits takerTraits,
        bytes calldata takerArgs,
        IERC20 takerAsset,
        uint256 pullFromCaller,
        PoolKey calldata key,
        SwapParams calldata swapParams,
        bytes calldata hookData,
        uint256 minMakerAmount
    ) external payable nonReentrant {
        // 1) Fill the 1inch order → adapter sweeps makerAsset to this router
        (uint256 making,,bytes32 orderHash) = lopAdapter.fillContractOrderArgs{value: msg.value}(
            order, signature, amount, takerTraits, takerArgs,
            takerAsset, pullFromCaller, tokenIn, address(this), address(this)
        );

        emit LimitOrderFilled(orderHash, making, 0); // taking logged in adapter

        // 2) Verify we received sufficient maker asset
        uint256 receivedBalance = tokenIn.balanceOf(address(this));
        if (receivedBalance < minMakerAmount) {
            revert InsufficientMakerAsset();
        }

        // 3) Enter v4 lock and execute swap
        CallbackData memory cbData = CallbackData({
            actionType: ActionType.SWAP,
            key: key,
            params: abi.encode(swapParams),
            hookData: hookData,
            user: msg.sender,
            minMakerAmount: minMakerAmount
        });

        manager.unlock(abi.encode(cbData));

        emit IRSActionExecuted(
            keccak256(abi.encode(key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks)),
            msg.sender,
            "SWAP"
        );

        // 4) Sweep any leftover tokens back to caller
        _sweepLeftovers(msg.sender);
    }

    /// @notice Fill 1inch limit order then add liquidity to IRS pool
    /// @param order 1inch limit order structure
    /// @param signature Maker's signature
    /// @param amount Taker amount to fill
    /// @param takerTraits Encoded taker preferences and thresholds
    /// @param takerArgs Optional taker args
    /// @param takerAsset Token we pay to maker
    /// @param pullFromCaller Amount of taker asset to pull from caller
    /// @param key Uniswap v4 pool key
    /// @param modifyParams Parameters for liquidity modification
    /// @param hookData Data passed to ArthHook
    /// @param minMakerAmount Minimum maker asset from LOP
    function lopFillThenAddLiquidity(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        uint256 amount,
        TakerTraits takerTraits,
        bytes calldata takerArgs,
        IERC20 takerAsset,
        uint256 pullFromCaller,
        PoolKey calldata key,
        ModifyLiquidityParams calldata modifyParams,
        bytes calldata hookData,
        uint256 minMakerAmount
    ) external payable nonReentrant {
        // Fill 1inch order
        (uint256 making,,bytes32 orderHash) = lopAdapter.fillContractOrderArgs{value: msg.value}(
            order, signature, amount, takerTraits, takerArgs,
            takerAsset, pullFromCaller, tokenIn, address(this), address(this)
        );

        emit LimitOrderFilled(orderHash, making, 0);

        // Verify sufficient maker asset
        if (tokenIn.balanceOf(address(this)) < minMakerAmount) {
            revert InsufficientMakerAsset();
        }

        // Execute add liquidity
        CallbackData memory cbData = CallbackData({
            actionType: ActionType.ADD_LIQUIDITY,
            key: key,
            params: abi.encode(modifyParams),
            hookData: hookData,
            user: msg.sender,
            minMakerAmount: minMakerAmount
        });

        manager.unlock(abi.encode(cbData));

        emit IRSActionExecuted(
            keccak256(abi.encode(key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks)),
            msg.sender,
            "ADD_LIQUIDITY"
        );

        _sweepLeftovers(msg.sender);
    }

    /// @notice Uniswap v4 unlock callback - executes the IRS action
    /// @param data Encoded CallbackData with action parameters
    /// @return abi.encode(true) to signal successful callback
    function unlockCallback(bytes calldata data) external override returns (bytes memory) {
        if (msg.sender != address(manager)) {
            revert UnauthorizedCallback();
        }

        CallbackData memory cbData = abi.decode(data, (CallbackData));

        if (cbData.actionType == ActionType.SWAP) {
            SwapParams memory swapParams = abi.decode(cbData.params, (SwapParams));
            manager.swap(cbData.key, swapParams, cbData.hookData);
            
        } else if (cbData.actionType == ActionType.ADD_LIQUIDITY) {
            ModifyLiquidityParams memory modifyParams = abi.decode(cbData.params, (ModifyLiquidityParams));
            manager.modifyLiquidity(cbData.key, modifyParams, cbData.hookData);
            
        } else if (cbData.actionType == ActionType.REMOVE_LIQUIDITY) {
            ModifyLiquidityParams memory modifyParams = abi.decode(cbData.params, (ModifyLiquidityParams));
            manager.modifyLiquidity(cbData.key, modifyParams, cbData.hookData);
        }

        return abi.encode(true);
    }

    /// @notice Sweep leftover tokens to recipient
    /// @param to Recipient address
    function _sweepLeftovers(address to) internal {
        uint256 balance = tokenIn.balanceOf(address(this));
        if (balance > 0) {
            tokenIn.safeTransfer(to, balance);
        }
    }

    /// @notice Emergency function to recover stuck tokens
    /// @param token Token to recover
    /// @param to Recipient
    /// @param amount Amount to recover
    function recoverToken(IERC20 token, address to, uint256 amount) external onlyOwner {
        token.safeTransfer(to, amount);
    }

    /// @notice Allow contract to receive ETH
    receive() external payable {}
}