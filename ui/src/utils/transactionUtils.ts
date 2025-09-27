import { encodeAbiParameters } from 'viem';

/**
 * Utility functions for properly formatting IRS protocol transaction parameters
 */

/**
 * Encode hookData with user address (required by ArthHook contract)
 * @param userAddress - The trader's wallet address
 * @returns Properly encoded hookData
 */
export function encodeHookData(userAddress: `0x${string}`): `0x${string}` {
  return encodeAbiParameters(
    [{ type: 'address' }],
    [userAddress]
  );
}

/**
 * Align tick values to the pool's tick spacing
 * @param tick - Raw tick value
 * @param tickSpacing - Pool's tick spacing (e.g., 60)
 * @param roundUp - Whether to round up (for upper tick) or down (for lower tick)
 * @returns Aligned tick value
 */
export function alignTick(tick: number, tickSpacing: number, roundUp: boolean = false): number {
  if (roundUp) {
    return Math.ceil(tick / tickSpacing) * tickSpacing;
  } else {
    return Math.floor(tick / tickSpacing) * tickSpacing;
  }
}

/**
 * Calculate safe liquidity delta that won't cause MaxPaymentExceeded
 * @param desiredAmount - Desired liquidity amount
 * @param maxSafeLiquidity - Maximum safe liquidity (default: 1e18)
 * @returns Safe liquidity delta
 */
export function calculateSafeLiquidityDelta(
  desiredAmount: bigint, 
  maxSafeLiquidity: bigint = BigInt(1e18)
): bigint {
  return desiredAmount > maxSafeLiquidity ? maxSafeLiquidity : desiredAmount;
}

/**
 * Get reasonable tick ranges for different pool types
 * @param poolType - Type of pool ('conservative' | 'moderate' | 'wide')
 * @returns Object with tickLower and tickUpper
 */
export function getRecommendedTickRange(poolType: 'conservative' | 'moderate' | 'wide' = 'moderate') {
  switch (poolType) {
    case 'conservative':
      return { tickLower: -11520, tickUpper: 11520 }; // ~3x price movement
    case 'moderate':
      return { tickLower: -23040, tickUpper: 23040 }; // ~10x price movement (recommended)
    case 'wide':
      return { tickLower: -46080, tickUpper: 46080 }; // ~100x price movement
    default:
      return { tickLower: -23040, tickUpper: 23040 };
  }
}

/**
 * Validate transaction parameters before submission
 * @param params - Transaction parameters
 * @returns Validation result with errors if any
 */
export function validateTransactionParams(params: {
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
  liquidityDelta: bigint;
  userAddress?: `0x${string}`;
}) {
  const errors: string[] = [];
  
  // Check tick alignment
  if (params.tickLower % params.tickSpacing !== 0) {
    errors.push(`tickLower (${params.tickLower}) must be aligned to tickSpacing (${params.tickSpacing})`);
  }
  
  if (params.tickUpper % params.tickSpacing !== 0) {
    errors.push(`tickUpper (${params.tickUpper}) must be aligned to tickSpacing (${params.tickSpacing})`);
  }
  
  // Check tick order
  if (params.tickLower >= params.tickUpper) {
    errors.push('tickLower must be less than tickUpper');
  }
  
  // Check liquidity delta
  if (params.liquidityDelta <= 0n) {
    errors.push('liquidityDelta must be positive for adding liquidity');
  }
  
  // Check user address for hookData
  if (!params.userAddress) {
    errors.push('userAddress is required for hookData encoding');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get safe amount limits for addLiquidity to prevent MaxPaymentExceeded
 * @param tokenDecimals0 - Decimals of token0 (default: 18)
 * @param tokenDecimals1 - Decimals of token1 (default: 18)
 * @returns Safe amount limits
 */
export function getSafeAmountLimits(tokenDecimals0: number = 18, tokenDecimals1: number = 18) {
  return {
    maxAmount0: BigInt(1000 * (10 ** tokenDecimals0)), // 1000 tokens max
    maxAmount1: BigInt(100 * (10 ** tokenDecimals1)),   // 100 tokens max
  };
}

/**
 * Format transaction parameters for logging/debugging
 */
export function formatTransactionParams(params: {
  liquidityDelta?: bigint;
  amount0?: bigint;
  amount1?: bigint;
  hookData?: string;
  [key: string]: unknown;
}) {
  return {
    ...params,
    liquidityDelta: params.liquidityDelta?.toString(),
    amount0: params.amount0?.toString(),
    amount1: params.amount1?.toString(),
    hookData: params.hookData,
  };
}