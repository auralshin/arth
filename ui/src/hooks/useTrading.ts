import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { ArthV4RouterABI, ERC20ABI } from '../abi';
import { useContractAddresses } from './useContracts';
import { parseUnits, encodeAbiParameters } from 'viem';
import { useNotifications } from './useNotifications';
import { useEffect, useRef } from 'react';

export function useOpenIRSPosition() {
  const addresses = useContractAddresses();
  const { address: userAddress } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const openPosition = async (params: {
    poolKey: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    };
    positionParams: {
      tickLower: number;
      tickUpper: number;
      liquidityDelta: bigint;
    };
  }) => {
    if (!addresses.ROUTER) return;
    if (!userAddress) {
      throw new Error('Please connect your wallet');
    }

    // Properly encode hookData with user address (required by ArthHook)
    const hookData = encodeAbiParameters(
      [{ type: 'address' }],
      [userAddress]
    );

    await writeContract({
      address: addresses.ROUTER,
      abi: ArthV4RouterABI,
      functionName: 'openIRSPosition',
      args: [params.poolKey, params.positionParams, hookData],
    });
  };

  return {
    openPosition,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useTokenApproval() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const addresses = useContractAddresses();

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: string) => {
    if (!addresses.isSupported) {
      throw new Error('Please switch to Sepolia testnet');
    }
    
    await writeContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [spender, parseUnits(amount, 18)], // Assuming 18 decimals for simplicity
    });
  };

  return {
    approve,
    hash,
    error,
    isPending,
  };
}

export function useTokenAllowance(tokenAddress: `0x${string}` | undefined, owner: `0x${string}` | undefined, spender: `0x${string}` | undefined) {
  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [owner, spender],
    query: { enabled: !!tokenAddress && !!owner && !!spender },
  });

  return {
    allowance: allowance as bigint | undefined,
  };
}

export function useAddLiquidity() {
  const addresses = useContractAddresses();
  const { address: userAddress } = useAccount();
  const { addNotification, updateNotification } = useNotifications();
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const addLiquidity = async (params: {
    poolKey: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    };
    tickLower: number;
    tickUpper: number;
    liquidityDelta: bigint;
    amount0: string;
    amount1: string;
    salt?: string;
  }) => {
    if (!addresses.isSupported) {
      throw new Error('Please switch to Sepolia testnet');
    }
    if (!addresses.ROUTER) {
      throw new Error('Router contract not found');
    }
    if (!userAddress) {
      throw new Error('Please connect your wallet');
    }

    // Show pending notification
    const notificationId = addNotification({
      type: 'pending',
      title: 'Adding Liquidity',
      message: 'Preparing transaction...',
      autoClose: false,
    });

    try {
      // Ensure ticks are properly aligned to tickSpacing
      const alignedTickLower = Math.floor(params.tickLower / params.poolKey.tickSpacing) * params.poolKey.tickSpacing;
      const alignedTickUpper = Math.ceil(params.tickUpper / params.poolKey.tickSpacing) * params.poolKey.tickSpacing;

      // Properly encode hookData with user address (required by ArthHook)
      const hookData = encodeAbiParameters(
        [{ type: 'address' }],
        [userAddress]
      );

      // Use more reasonable amount limits and smaller liquidity for testing
      const liquidityDelta = params.liquidityDelta > BigInt(1e18) ? BigInt(1e18) : params.liquidityDelta;
      const maxAmount0 = parseUnits('1000', 18); // Max 1000 tokens
      const maxAmount1 = parseUnits('100', 18);  // Max 100 tokens

      const addLiqParams = {
        key: params.poolKey,
        params: {
          tickLower: alignedTickLower,
          tickUpper: alignedTickUpper,
          liquidityDelta: liquidityDelta,
          salt: params.salt ? params.salt as `0x${string}` : '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        },
        hookData: hookData,
        amount0: maxAmount0,
        amount1: maxAmount1,
        useNative0: false,
        useNative1: false,
      };

      updateNotification(notificationId, {
        message: 'Sending transaction...',
      });

      // Store params for position tracking
      lastAddLiquidityParams.current = {
        poolKey: params.poolKey,
        liquidityDelta,
        tickLower: alignedTickLower,
        tickUpper: alignedTickUpper,
      };

      await writeContract({
        address: addresses.ROUTER,
        abi: ArthV4RouterABI,
        functionName: 'addLiquidity',
        args: [addLiqParams],
      });

    } catch (error) {
      updateNotification(notificationId, {
        type: 'error',
        title: 'Transaction Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        autoClose: true,
      });
      throw error;
    }
  };

  // Track transaction states and update notifications
  const pendingNotificationId = useRef<string | null>(null);
  const lastAddLiquidityParams = useRef<{
    poolKey: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    };
    liquidityDelta: bigint;
    tickLower: number;
    tickUpper: number;
  } | null>(null);

  useEffect(() => {
    if (hash && !pendingNotificationId.current) {
      pendingNotificationId.current = addNotification({
        type: 'pending',
        title: 'Transaction Submitted',
        message: 'Waiting for confirmation...',
        txHash: hash,
        autoClose: false,
      });
    }
  }, [hash, addNotification]);

  useEffect(() => {
    if (isSuccess && pendingNotificationId.current) {
      updateNotification(pendingNotificationId.current, {
        type: 'success',
        title: 'Liquidity Added Successfully!',
        message: 'Your liquidity has been added to the pool.',
        autoClose: true,
      });

      // Add position to user tracking
      if (typeof window !== 'undefined' && 
          (window as { addUserLPPosition?: (hookAddress: string, liquidityAmount: bigint, tickLower: number, tickUpper: number) => void }).addUserLPPosition && 
          lastAddLiquidityParams.current) {
        const { poolKey, liquidityDelta, tickLower, tickUpper } = lastAddLiquidityParams.current;
        // Use the hook address as identifier since that's unique per pool
        (window as unknown as { addUserLPPosition: (hookAddress: string, liquidityAmount: bigint, tickLower: number, tickUpper: number) => void }).addUserLPPosition(poolKey.hooks, liquidityDelta, tickLower, tickUpper);
      }

      pendingNotificationId.current = null;
      lastAddLiquidityParams.current = null;
    }
  }, [isSuccess, updateNotification]);

  useEffect(() => {
    if (error && pendingNotificationId.current) {
      updateNotification(pendingNotificationId.current, {
        type: 'error',
        title: 'Transaction Failed',
        message: error.message || 'Unknown error occurred',
        autoClose: true,
      });
      pendingNotificationId.current = null;
    }
  }, [error, updateNotification]);

  return {
    addLiquidity,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useRemoveLiquidity() {
  const addresses = useContractAddresses();
  const { address: userAddress } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const removeLiquidity = async (params: {
    poolKey: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    };
    tickLower: number;
    tickUpper: number;
    liquidityDelta: bigint;
    to: `0x${string}`;
    salt?: string;
  }) => {
    if (!addresses.isSupported) {
      throw new Error('Please switch to Sepolia testnet');
    }
    if (!addresses.ROUTER) {
      throw new Error('Router contract not found');
    }
    if (!userAddress) {
      throw new Error('Please connect your wallet');
    }

    // Ensure ticks are properly aligned to tickSpacing
    const alignedTickLower = Math.floor(params.tickLower / params.poolKey.tickSpacing) * params.poolKey.tickSpacing;
    const alignedTickUpper = Math.ceil(params.tickUpper / params.poolKey.tickSpacing) * params.poolKey.tickSpacing;

    // Properly encode hookData with user address (required by ArthHook)
    const hookData = encodeAbiParameters(
      [{ type: 'address' }],
      [userAddress]
    );

    const removeLiqParams = {
      key: params.poolKey,
      params: {
        tickLower: alignedTickLower,
        tickUpper: alignedTickUpper,
        liquidityDelta: -params.liquidityDelta, // Negative for removal
        salt: params.salt ? params.salt as `0x${string}` : '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
      },
      hookData: hookData,
      to: params.to,
    };

    await writeContract({
      address: addresses.ROUTER,
      abi: ArthV4RouterABI,
      functionName: 'removeLiquidity',
      args: [removeLiqParams],
    });
  };

  return {
    removeLiquidity,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useSwap() {
  const addresses = useContractAddresses();
  const { address: userAddress } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const swap = async (params: {
    poolKey: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    };
    zeroForOne: boolean;
    amountSpecified: bigint;
    sqrtPriceLimitX96: bigint;
  }) => {
    if (!addresses.isSupported) {
      throw new Error('Please switch to Sepolia testnet');
    }
    if (!addresses.ROUTER) {
      throw new Error('Router contract not found');
    }
    if (!userAddress) {
      throw new Error('Please connect your wallet');
    }

    // Properly encode hookData with user address (required by ArthHook)
    const hookData = encodeAbiParameters(
      [{ type: 'address' }],
      [userAddress]
    );

    const swapParams = {
      key: params.poolKey,
      params: {
        zeroForOne: params.zeroForOne,
        amountSpecified: params.amountSpecified,
        sqrtPriceLimitX96: params.sqrtPriceLimitX96,
      },
      hookData: hookData,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
    };

    await writeContract({
      address: addresses.ROUTER,
      abi: ArthV4RouterABI,
      functionName: 'swap',
      args: [swapParams],
    });
  };

  return {
    swap,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

export function useSwapQuote(amountIn: string) {
  const quote = {
    amountOut: amountIn ? (parseFloat(amountIn) * 0.998).toString() : '0',
    priceImpact: 0.002,
    gasEstimate: BigInt(150000),
  };

  return {
    quote,
    isLoading: false,
    error: null,
  };
}