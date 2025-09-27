// Contract Interaction Validation Script
// This file validates that all contract addresses and ABIs are correctly configured

import { DEPLOYED_ADDRESSES, POOLS } from '../deployed-addresses';
import { ArthV4RouterABI, ERC20ABI, ArthHookABI, BaseIndexABI } from '../abi';

export const validateContractSetup = () => {
  const issues: string[] = [];

  // Check required addresses
  const requiredAddresses = [
    'ROUTER',
    'BASE_INDEX', 
    'RISK_ENGINE',
    'FACTORY',
    'CAPS',
    'MOCK_WSTETH',
    'MOCK_USDC',
    'MOCK_PYUSD'
  ];

  requiredAddresses.forEach(key => {
    if (!DEPLOYED_ADDRESSES[key as keyof typeof DEPLOYED_ADDRESSES]) {
      issues.push(`Missing address for ${key}`);
    }
  });

  // Validate pool configuration
  POOLS.forEach((pool, index) => {
    if (!pool.poolId || !pool.hook) {
      issues.push(`Pool ${index + 1} missing poolId or hook address`);
    }
    if (!pool.token0 || !pool.token1) {
      issues.push(`Pool ${index + 1} missing token addresses`);
    }
    if (pool.tickSpacing !== 60) {
      issues.push(`Pool ${index + 1} has incorrect tickSpacing: ${pool.tickSpacing}, expected: 60`);
    }
  });

  // Check ABI exports
  const requiredABIs = [ArthV4RouterABI, ERC20ABI, ArthHookABI, BaseIndexABI];
  requiredABIs.forEach((abi, index) => {
    if (!abi || !Array.isArray(abi)) {
      issues.push(`ABI ${index} is not properly exported`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    summary: {
      totalPools: POOLS.length,
      requiredAddresses: requiredAddresses.length,
      foundAddresses: requiredAddresses.filter(key => 
        DEPLOYED_ADDRESSES[key as keyof typeof DEPLOYED_ADDRESSES]
      ).length
    }
  };
};

// Network validation
export const validateNetwork = (chainId: number) => {
  const SEPOLIA_CHAIN_ID = 11155111;
  
  return {
    isSupported: chainId === SEPOLIA_CHAIN_ID,
    currentChain: chainId,
    expectedChain: SEPOLIA_CHAIN_ID,
    networkName: chainId === SEPOLIA_CHAIN_ID ? 'Sepolia' : `Chain ${chainId}`
  };
};

// Transaction parameter validation
export const validateAddLiquidityParams = (params: {
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
  amount0: string;
  amount1: string;
  liquidityDelta: bigint;
}) => {
  const issues: string[] = [];

  // Check tick alignment
  if (params.tickLower % params.tickSpacing !== 0) {
    issues.push(`tickLower (${params.tickLower}) not aligned to tickSpacing (${params.tickSpacing})`);
  }
  
  if (params.tickUpper % params.tickSpacing !== 0) {
    issues.push(`tickUpper (${params.tickUpper}) not aligned to tickSpacing (${params.tickSpacing})`);
  }

  // Check tick range
  if (params.tickLower >= params.tickUpper) {
    issues.push('tickLower must be less than tickUpper');
  }

  // Check for reasonable tick range (not too wide)
  const tickRange = params.tickUpper - params.tickLower;
  const MAX_REASONABLE_RANGE = 50000; // Reasonable max for gas optimization
  
  if (tickRange > MAX_REASONABLE_RANGE) {
    issues.push(`Tick range too wide (${tickRange}), consider narrower range for better gas efficiency`);
  }

  // Check amounts
  const amount0Num = parseFloat(params.amount0);
  const amount1Num = parseFloat(params.amount1);
  
  if (amount0Num <= 0 && amount1Num <= 0) {
    issues.push('At least one token amount must be greater than 0');
  }

  // Check liquidity delta
  if (params.liquidityDelta <= 0n) {
    issues.push('liquidityDelta must be positive');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations: [
      `Use tick range: ${params.tickLower} to ${params.tickUpper} (range: ${tickRange})`,
      `Amount0: ${params.amount0}, Amount1: ${params.amount1}`,
      `LiquidityDelta: ${params.liquidityDelta.toString()}`
    ]
  };
};

export const VALIDATION_CONFIG = {
  SEPOLIA_CHAIN_ID: 11155111,
  RECOMMENDED_TICK_RANGE: {
    lower: -23028,  // ~10x price decrease
    upper: 23028    // ~10x price increase  
  },
  TICK_SPACING: 60,
  MAX_TICK_RANGE: 50000,
  GAS_ESTIMATE: {
    addLiquidity: 200000,
    approve: 50000,
    swap: 150000
  }
};

// Export validation summary for debugging
export const getValidationSummary = (chainId?: number) => {
  const contractValidation = validateContractSetup();
  const networkValidation = chainId ? validateNetwork(chainId) : null;
  
  return {
    timestamp: new Date().toISOString(),
    contract: contractValidation,
    network: networkValidation,
    config: VALIDATION_CONFIG
  };
};