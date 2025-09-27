import { useReadContract, useReadContracts, useChainId } from "wagmi";
import { useCallback } from "react";
import { keccak256 } from 'viem';
import {
  DEPLOYED_ADDRESSES,
  POOLS,
  getPoolById,
  getTokenInfo,
} from "../deployed-addresses";
import {
  BaseIndexABI,
  RiskEngineABI,
  ArthHookABI,
  ERC20ABI,
} from "../abi";

export function useContractAddresses() {
  const chainId = useChainId();
  
  // Check if we're on supported network
  const isSupported = chainId === 11155111; // Sepolia
  
  if (!isSupported) {
    console.warn(`Chain ${chainId} not supported. Please switch to Sepolia testnet (11155111)`);
  }
  
  return {
    ...DEPLOYED_ADDRESSES,
    isSupported,
    chainId,
  };
}

export function useBaseIndex() {
  const addresses = useContractAddresses();

  const { data: ratePerSecond } = useReadContract({
    address: addresses.BASE_INDEX,
    abi: BaseIndexABI,
    functionName: "ratePerSecond",
    query: { enabled: !!addresses.BASE_INDEX },
  });

  const { data: cumulative } = useReadContract({
    address: addresses.BASE_INDEX,
    abi: BaseIndexABI,
    functionName: "cumulative",
    query: { enabled: !!addresses.BASE_INDEX },
  });

  const { data: lastUpdate } = useReadContract({
    address: addresses.BASE_INDEX,
    abi: BaseIndexABI,
    functionName: "lastUpdate",
    query: { enabled: !!addresses.BASE_INDEX },
  });

  const { data: frozen } = useReadContract({
    address: addresses.BASE_INDEX,
    abi: BaseIndexABI,
    functionName: "frozen",
    query: { enabled: !!addresses.BASE_INDEX },
  });

  const { data: underlying } = useReadContract({
    address: addresses.BASE_INDEX,
    abi: BaseIndexABI,
    functionName: "underlying",
    query: { enabled: !!addresses.BASE_INDEX },
  });

  return {
    ratePerSecond: ratePerSecond as bigint | undefined,
    cumulative: cumulative as bigint | undefined,
    lastUpdate: lastUpdate as bigint | undefined,
    frozen: frozen as boolean | undefined,
    underlying: underlying as `0x${string}` | undefined,
    isLive: !frozen && !!ratePerSecond,
  };
}

// Keep backward compatibility alias
export const useEthBaseIndex = useBaseIndex;

// Type for position data from RiskEngine
type Position = {
  poolId: string;
  size: bigint;
  entryFundingRate: bigint;
  // Add other position properties as needed
};

// Enhanced position type that matches demo Position interface
export type EnhancedPosition = {
  key: string;
  poolId: string;
  L: number;
  kappa: number;
  maturity: number;
  fundingOwed: number;
  hf: number;
  im: number;
  mm: number;
  isReal?: boolean;
};

export function useRiskEngine(userAddress?: `0x${string}`) {
  const addresses = useContractAddresses();

  const { data: positions } = useReadContract({
    address: addresses.RISK_ENGINE,
    abi: RiskEngineABI,
    functionName: "getPositions",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!addresses.RISK_ENGINE && !!userAddress },
  });

  const { data: margin } = useReadContract({
    address: addresses.RISK_ENGINE,
    abi: RiskEngineABI,
    functionName: "getMargin",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!addresses.RISK_ENGINE && !!userAddress },
  });

  return {
    positions: positions as Position[] | undefined,
    margin: margin as bigint | undefined,
  };
}

export function useTokenBalances(
  userAddress?: `0x${string}`,
  tokenAddresses?: `0x${string}`[]
) {
  const addresses = useContractAddresses();

  // Use provided token addresses or default to common tokens
  const tokens = tokenAddresses || [
    addresses.MOCK_WSTETH,
    addresses.MOCK_USDC,
    addresses.MOCK_PYUSD,
  ];

  const contracts = userAddress && addresses.isSupported ? tokens.map((address) => ({
    address: address as `0x${string}`,
    abi: ERC20ABI,
    functionName: "balanceOf" as const,
    args: [userAddress] as const,
  })) : [];

  const { data, error, isLoading } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: contracts as any,
    query: { 
      enabled: !!userAddress && contracts.length > 0 && addresses.isSupported,
      refetchInterval: 15000, // Refetch every 15 seconds
      retry: 3, // Retry failed requests
      retryDelay: 1000, // Wait 1 second between retries
    },
  });

  return {
    balances:
      data?.map((result, index) => ({
        address: tokens[index],
        balance: result?.result as bigint | undefined,
        tokenInfo: getTokenInfo(tokens[index]),
        error: result?.error,
        loading: isLoading,
      })) || [],
    wstETHBalance: data?.find(
      (_, index) => tokens[index] === addresses.MOCK_WSTETH
    )?.result as bigint | undefined,
    usdcBalance: data?.find((_, index) => tokens[index] === addresses.MOCK_USDC)
      ?.result as bigint | undefined,
    pyusdBalance: data?.find(
      (_, index) => tokens[index] === addresses.MOCK_PYUSD
    )?.result as bigint | undefined,
    isLoading,
    error,
  };
}

// ArthHook integration with actual contract functions
// Each pool has its own ArthHook instance

export function usePoolMeta(poolId: `0x${string}`, hookAddress: `0x${string}`) {
  const { data: poolMeta } = useReadContract({
    address: hookAddress,
    abi: ArthHookABI,
    functionName: "poolMeta",
    args: [poolId],
    query: { enabled: !!poolId && !!hookAddress },
  });

  // Type the returned tuple
  const typedMeta = poolMeta as readonly [bigint, bigint, bigint, bigint, bigint, boolean] | undefined;

  return {
    maturity: typedMeta?.[0],
    lastTs: typedMeta?.[1], 
    lastCumIdx: typedMeta?.[2],
    fundingGrowthGlobalX128: typedMeta?.[3],
    totalLiquidity: typedMeta?.[4],
    frozen: typedMeta?.[5],
  };
}

export function useUserPosition(positionKey: `0x${string}`, hookAddress: `0x${string}`) {
  const { data: position } = useReadContract({
    address: hookAddress,
    abi: ArthHookABI,
    functionName: "positions",
    args: [positionKey],
    query: { enabled: !!positionKey && !!hookAddress },
  });

  // Type the returned tuple
  const typedPosition = position as readonly [bigint, bigint, bigint] | undefined;

  return {
    liquidity: typedPosition?.[0],
    fundingGrowthSnapshotX128: typedPosition?.[1],
    fundingOwedToken1: typedPosition?.[2],
  };
}

export function useFundingOwed(
  hookAddress: `0x${string}`,
  userAddress: `0x${string}`,
  poolKey: {
    currency0: `0x${string}`;
    currency1: `0x${string}`;
    fee: number;
    tickSpacing: number;
    hooks: `0x${string}`;
  },
  tickLower: number,
  tickUpper: number,
  salt: `0x${string}`
) {
  const { data: fundingOwed } = useReadContract({
    address: hookAddress,
    abi: ArthHookABI,
    functionName: "fundingOwedToken1",
    args: [userAddress, poolKey, tickLower, tickUpper, salt],
    query: { enabled: !!userAddress && !!poolKey && !!hookAddress },
  });

  return {
    fundingOwed: fundingOwed as bigint | undefined,
  };
}

export function usePool(poolId: string) {
  const pool = getPoolById(poolId);
  const poolIdBytes = pool?.poolId as `0x${string}`;
  const hookAddress = pool?.hook as `0x${string}`;
  
  const { maturity, lastTs, lastCumIdx, fundingGrowthGlobalX128, totalLiquidity, frozen } = 
    usePoolMeta(poolIdBytes, hookAddress);

  if (!pool) {
    return { pool: null, error: "Pool not found" };
  }

  // Calculate current funding rate from fundingGrowthGlobalX128 and time
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  let fundingRate: bigint | undefined;
  
  if (fundingGrowthGlobalX128 && lastTs) {
    const timeDiff = currentTime - lastTs;
    if (timeDiff > 0n) {
      // Simple approximation - in practice, this would involve more complex calculations
      fundingRate = fundingGrowthGlobalX128 / timeDiff;
    }
  }

  return {
    pool,
    maturity,
    lastUpdate: lastTs,
    lastCumIndex: lastCumIdx,
    fundingGrowthGlobal: fundingGrowthGlobalX128,
    totalLiquidity,
    frozen,
    fundingRate,
    isExpired: maturity ? Number(maturity) * 1000 < Date.now() : false,
    daysToMaturity: maturity ? Math.max(0, Math.ceil((Number(maturity) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
  };
}

// Pool metadata type from ArthHook.poolMeta function
type PoolMetadata = readonly [bigint, bigint, bigint, bigint, bigint, boolean]; // [maturity, lastTs, lastCumIdx, fundingGrowthGlobalX128, totalLiquidity, frozen]

export function useAllPools() {
  // Get pool metadata for each pool using their individual ArthHook contracts
  const poolContracts = POOLS.map((pool) => ({
    address: pool.hook as `0x${string}`,
    abi: ArthHookABI,
    functionName: "poolMeta",
    args: [pool.poolId as `0x${string}`],
  }));

  const { data: poolMetaData } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: poolContracts as any,
  });

  return {
    pools: POOLS.map((pool, index) => {
      const result = poolMetaData?.[index]?.result;
      const metadata = result as PoolMetadata | undefined;
      const maturity = metadata?.[0];
      const totalLiquidity = metadata?.[4];
      const frozen = metadata?.[5];
      
      const isExpired = maturity ? Number(maturity) * 1000 < Date.now() : Date.now() > pool.maturityDate.getTime();
      const daysToMaturity = maturity 
        ? Math.max(0, Math.ceil((Number(maturity) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
        : Math.max(0, Math.ceil((pool.maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      return {
        ...pool,
        maturity,
        totalLiquidity,
        frozen,
        liquidity: totalLiquidity, // Backward compatibility
        isExpired,
        daysToMaturity,
        fundingGrowthGlobal: metadata?.[3],
        lastUpdate: metadata?.[1],
        lastCumIndex: metadata?.[2],
      };
    }),
  };
}

export function useUserPositions(userAddress?: `0x${string}`) {
  const { positions } = useRiskEngine(userAddress);

  // Convert RiskEngine positions to EnhancedPosition format
  const enhancedPositions: EnhancedPosition[] = positions?.map((position, index) => {
    const pool = POOLS.find((p) => p.poolId === position.poolId);
    return {
      key: `pos-${index}`,
      poolId: position.poolId,
      L: Number(position.size) / 1e18, // Convert bigint to number
      kappa: 1.0, // Default leverage
      maturity: pool?.maturity || 0,
      fundingOwed: Number(position.entryFundingRate) / 1e18, // Convert bigint to number
      hf: 1.25, // Mock health factor
      im: 1000, // Mock initial margin
      mm: 500, // Mock maintenance margin  
      isReal: true,
    };
  }) || [];

  // Fallback to demo positions if no real positions
  const demoPositions: EnhancedPosition[] = userAddress && enhancedPositions.length === 0 ? [{
    key: "demo-pos-1",
    poolId: POOLS[0]?.poolId || "pool-1",
    L: 1200,
    kappa: 1.0,
    maturity: POOLS[0]?.maturity || Date.now() + 90 * 24 * 60 * 60,
    fundingOwed: 312.42,
    hf: 1.34,
    im: 860.0,
    mm: 620.0,
    isReal: false,
  }] : [];

  const displayPositions = enhancedPositions.length > 0 ? enhancedPositions : demoPositions;

  return {
    positions: displayPositions,
    totalPositions: displayPositions.length,
    hasRealPositions: enhancedPositions.length > 0,
  };
}

export function useProtocolStats() {
  const { pools } = useAllPools();

  // Calculate total liquidity across all pools
  const totalLiquidity = pools.reduce((sum, pool) => {
    if (pool.liquidity) {
      return sum + Number(pool.liquidity);
    }
    return sum;
  }, 0);

  const activePools = pools.filter((p) => !p.isExpired).length;
  const avgDays = pools.filter((p) => !p.isExpired).reduce((sum, p) => sum + p.daysToMaturity, 0) / activePools || 0;

  return {
    // Legacy properties for backward compatibility
    totalLiquidity: totalLiquidity.toString(),
    activePools,
    totalPools: pools.length,
    averageDaysToMaturity: avgDays,
    // New properties expected by Dashboard
    totalNotional: `${(totalLiquidity / 1000000).toFixed(2)}M`, // Convert to millions
    openPositions: activePools, // Use active pools as proxy for open positions
    healthFactor: 1.25 // Mock health factor - replace with actual calculation
  };
}

// Hook for getting real LP positions from contracts
export function useUserLPPositions(userAddress?: `0x${string}`) {
  const { pools } = useAllPools();
  
  console.log('useUserLPPositions called with:', { userAddress, poolsCount: pools.length });
  
  interface LPPosition {
    id: string;
    poolId: string;
    poolName: string;
    liquidity: bigint;
    token0Amount: bigint;
    token1Amount: bigint;
    feesEarned: bigint;
    apy: number;
    token0Symbol: string;
    token1Symbol: string;
    maturityDate: Date;
    isExpired: boolean;
    tickLower: number;
    tickUpper: number;
    createdAt: Date;
    source: 'localStorage' | 'contract';
  }

  // Common tick ranges to check for positions
  const commonTickRanges = [
    { lower: -23040, upper: 23040 }, // Most common range used
    { lower: -11520, upper: 11520 },
    { lower: -46080, upper: 46080 },
    { lower: -60, upper: 60 },
    { lower: -120, upper: 120 },
  ];

  // Common salt values to check
  const commonSalts = [
    '0x0000000000000000000000000000000000000000000000000000000000000000', // Default salt
    '0x0000000000000000000000000000000000000000000000000000000000000001', // Salt 1
    '0x0000000000000000000000000000000000000000000000000000000000000002', // Salt 2
    '0x1111111111111111111111111111111111111111111111111111111111111111', // Common pattern
  ];

  // Generate position keys exactly matching ArthHook contract assembly implementation
  const generatePositionKey = (owner: string, poolId: string, tickLower: number, tickUpper: number, salt = '0x0000000000000000000000000000000000000000000000000000000000000000') => {
    try {
      // Match the contract's assembly implementation exactly:
      // Assembly stores: owner(32), poolId(32), tickLower_as_uint256(32), tickUpper_as_uint256(32), salt(32)
      // Total: 160 bytes (0xa0)
      
      // Owner address is stored as 32 bytes (left-padded with zeros)
      const ownerBytes32 = owner.toLowerCase().slice(2).padStart(64, '0'); // Remove 0x and pad to 64 chars (32 bytes)
      
      // Pool ID as bytes32
      const poolIdBytes32 = poolId.startsWith('0x') ? poolId.slice(2) : poolId;
      
      // Convert int24 to uint256 (exactly as contract does: uint256 tl = uint256(int256(tickLower)))
      const tickLowerUint256 = tickLower < 0 
        ? (BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') + BigInt(tickLower) + 1n).toString(16).padStart(64, '0')
        : tickLower.toString(16).padStart(64, '0');
      
      const tickUpperUint256 = tickUpper < 0
        ? (BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') + BigInt(tickUpper) + 1n).toString(16).padStart(64, '0')
        : tickUpper.toString(16).padStart(64, '0');
      
      // Salt as bytes32
      const saltBytes32 = salt.startsWith('0x') ? salt.slice(2) : salt;
      
      // Concatenate exactly as assembly does: 160 bytes total
      const concatenated = `${ownerBytes32}${poolIdBytes32}${tickLowerUint256}${tickUpperUint256}${saltBytes32}`;
      const hash = keccak256(`0x${concatenated}` as `0x${string}`);
      
      console.log(`Generated position key for ${owner}:`);
      console.log(`  Pool: ${poolId}, Ticks: [${tickLower}, ${tickUpper}], Salt: ${salt.slice(0, 10)}...`);
      console.log(`  Key: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error generating position key:', error);
      // Simple fallback
      const simple = keccak256(`0x${owner.slice(2).padStart(64, '0')}${poolId.slice(2)}${tickLower.toString(16).padStart(64, '0')}${tickUpper.toString(16).padStart(64, '0')}${salt.slice(2)}` as `0x${string}`);
      return simple;
    }
  };

  // Create contracts array for batch reading positions
  const positionContracts = userAddress && pools.length > 0 ? 
    pools.flatMap(pool =>
      commonTickRanges.flatMap(ticks =>
        commonSalts.map(salt => ({
          address: pool.hook as `0x${string}`,
          abi: ArthHookABI,
          functionName: 'positions' as const,
          args: [generatePositionKey(userAddress, pool.poolId, ticks.lower, ticks.upper, salt)],
        }))
      )
    ) : [];

  console.log('Position contracts to query:', { 
    contractsCount: positionContracts.length, 
    userAddress, 
    poolsCount: pools.length,
    sampleContract: positionContracts[0] 
  });

  const { data: positionsData, isLoading, error } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: positionContracts as readonly any[],
    query: { 
      enabled: !!userAddress && positionContracts.length > 0,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    },
  });

  console.log('Contract query results:', { 
    positionsDataLength: positionsData?.length, 
    isLoading, 
    error,
    enabled: !!userAddress && positionContracts.length > 0,
  });
  
  // Log individual contract responses
  if (positionsData) {
    positionsData.forEach((result, index) => {
      const contractsPerPool = commonTickRanges.length * commonSalts.length;
      const poolIndex = Math.floor(index / contractsPerPool);
      const remainder = index % contractsPerPool;
      const tickRangeIndex = Math.floor(remainder / commonSalts.length);
      const saltIndex = remainder % commonSalts.length;
      
      const pool = pools[poolIndex];
      const tickRange = commonTickRanges[tickRangeIndex];
      const salt = commonSalts[saltIndex];
      
      if (result?.result) {
        const [liquidity, , fundingOwed] = result.result as [bigint, bigint, bigint];
        console.log(`Contract response ${index} - Pool: ${pool?.name}, Ticks: [${tickRange?.lower}, ${tickRange?.upper}], Salt: ${salt.slice(0, 10)}..., Liquidity: ${liquidity}, FundingOwed: ${fundingOwed}`);
      } else {
        console.log(`Contract response ${index} - Pool: ${pool?.name}, Ticks: [${tickRange?.lower}, ${tickRange?.upper}], Salt: ${salt?.slice(0, 10)}... - NO RESULT:`, result);
      }
    });
  }

  // Parse contract results into positions
  const positions: LPPosition[] = [];
  
  if (positionsData && userAddress) {
    positionsData.forEach((result, index) => {
      if (result?.result) {
        const [liquidity, , fundingOwed] = result.result as [bigint, bigint, bigint];
        
        // Only include positions with actual liquidity
        if (liquidity > 0n) {
          const contractsPerPool = commonTickRanges.length * commonSalts.length;
          const poolIndex = Math.floor(index / contractsPerPool);
          const remainder = index % contractsPerPool;
          const tickRangeIndex = Math.floor(remainder / commonSalts.length);
          const saltIndex = remainder % commonSalts.length;
          
          const pool = pools[poolIndex];
          const tickRange = commonTickRanges[tickRangeIndex];
          // const salt = commonSalts[saltIndex]; // Used for debugging
          
          if (pool) {
            positions.push({
              id: `${pool.poolId}_${tickRange.lower}_${tickRange.upper}_${saltIndex}`,
              poolId: pool.poolId,
              poolName: pool.name,
              liquidity,
              token0Amount: BigInt(0), // Calculate from liquidity if needed
              token1Amount: BigInt(0), // Calculate from liquidity if needed
              feesEarned: fundingOwed > 0n ? BigInt(fundingOwed) : BigInt(0),
              apy: 8.5, // Would be calculated from pool data
              token0Symbol: pool.token0Symbol,
              token1Symbol: pool.token1Symbol,
              maturityDate: pool.maturityDate,
              isExpired: pool.isExpired || pool.maturityDate < new Date(),
              tickLower: tickRange.lower,
              tickUpper: tickRange.upper,
              createdAt: new Date(), // Would track from events in production
              source: 'contract' as const,
            });
          }
        }
      }
    });
  }

  

  console.log(`Found ${positions.length} LP positions for user:`, userAddress, positions.length > 0 ? 'with positions' : 'no positions found');

  // Debug: Test specific position for the user
  if (userAddress?.toLowerCase() === '0x46a70eac801FCBd6F6C336dE1F0fBb9E570f17aa'.toLowerCase() && pools.length > 0) {
    const testPool = pools[0]; // First pool
    const testKey = generatePositionKey(userAddress, testPool.poolId, -23040, 23040, '0x0000000000000000000000000000000000000000000000000000000000000000');
    console.log('🔍 DEBUG: Testing specific position for user address');
    console.log(`Pool: ${testPool.name} (${testPool.poolId})`);
    console.log(`Hook: ${testPool.hook}`);
    console.log(`Test position key: ${testKey}`);
    console.log(`Tick range: [-23040, 23040]`);
    
    // Find this specific test in the results
    if (positionsData) {
      const found = positionsData.find(result => {
        if (result?.result) {
          const [liquidity] = result.result as [bigint, bigint, bigint];
          return liquidity > 0n;
        }
        return false;
      });
      
      if (found) {
        console.log('✅ Found a position with liquidity > 0!', found);
      } else {
        console.log('❌ No positions found with liquidity > 0 in any of the queries');
      }
    }
  }

  // Calculate aggregated stats
  const totalLiquidityValue = positions.reduce((sum: number, pos) => 
    sum + Number(pos.liquidity) / 1e18, 0
  );

  const totalFeesEarned = positions.reduce((sum: number, pos) => 
    sum + Number(pos.feesEarned || 0n) / 1e18, 0
  );

  const averageAPY = positions.length > 0 
    ? positions.reduce((sum: number, pos) => sum + (pos.apy || 0), 0) / positions.length 
    : 0;

  // Simple addPosition function (positions are now fetched from contracts automatically)
  const addPosition = useCallback(() => {
    // Positions are automatically refetched from contracts
    console.log('Position will be detected automatically from contract state');
  }, []);

  return {
    positions: userAddress ? positions : [],
    totalLiquidityValue,
    totalFeesEarned,
    averageAPY,
    positionCount: positions.length,
    isLoading,
    error: null,
    hasRealPositions: positions.length > 0,
    addPosition, // Simplified - positions are fetched from contracts
  };
}
