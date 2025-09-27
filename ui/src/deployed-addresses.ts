// IRS Protocol - Deployed Addresses (Sepolia Testnet)
// Generated on 2025-09-27
// Auto-generated from deployment scripts

export const CHAIN_ID = 11155111;
export const NETWORK = 'sepolia';

export const DEPLOYED_ADDRESSES = {
  // Core Infrastructure
  POOL_MANAGER: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543',
  BASE_INDEX: '0x7AB20E78801c2975702D3268bB43fc0F8BF94c69',
  RISK_ENGINE: '0xc3A5F8c72c7bCFaB253C02186046467064E5a80E',
  FACTORY: '0xbbC9fa25E3298fB2fAfd2A0537eB5a908E886334',
  CAPS: '0xd25A80039E06a94238A5869B7BB9a3C37695499a',
  PYTH_ADAPTER: '0x6bb290d1A9CF3AA86C6eFB452305543C4B53e6d3',
  ROUTER: '0x6271E1237e8f871f6c121697feB7757F8d8EB387',
  RECEIPTS: '0x3fD8C1Ad20e4F87e4c5B93FF7bC77E8A2F455f1d',
  CONTROLLER: '0x5368FEc33dB4149E02289ac0B6177192b580e8B3',
  TIMELOCK: '0xb3497d6334B096B03085169c527Cc19B9Ae31829',

  // Mock Tokens
  MOCK_STETH: '0xE276a30417F1Ff4e5c8ed5a9CCa5959Ca2A1b8f6',
  MOCK_WSTETH: '0xB03e218A95bd1a74F2A909E29036D459cD54FdD6',
  MOCK_USDC: '0x10bb9fEaE70b0644275dB3609457F1FB4bEa2F58',
  MOCK_PYUSD: '0xFE57ba5ccE4B84D8B434FF5A1b25ec9F0fBD1125',

  // Oracles
  PYTH_CONTRACT: '0xDd24F84d36BF92C65F92307595335bdFab5Bbd21',
  WSTETH_RATE_SOURCE: '0xAe8C262bBaCc62B63341eEe79da7678e32c48b89',
  PRICE_ORACLE: '0x6BB2f93B71F4274F74B5C5cA54244d36b0Beed91',
} as const;

export const POOLS = [
  {
    id: 1,
    name: 'wstETH/USDC 1M',
    poolId: '0x05b0d5045f348ab0ad325ccbadaf168addfb2199cdcac1ca09aba2ca984ad79b',
    hook: '0x89061D9ACB96Ac17fFA7BbF2cEF825bEcD721f80',
    token0: '0x10bb9fEaE70b0644275dB3609457F1FB4bEa2F58',
    token1: '0xB03e218A95bd1a74F2A909E29036D459cD54FdD6',
    token0Symbol: 'USDC',
    token1Symbol: 'wstETH',
    fee: 3000,
    tickSpacing: 60,
    maturity: 1761531132,
    maturityDate: new Date('2025-10-27T00:00:00Z'),
    duration: '1M',
    description: 'wstETH/USDC 1 Month',
  },
  {
    id: 2,
    name: 'wstETH/USDC 3M',
    poolId: '0x7600d12bd88c3969c20139cca7822bb5b995aebadb8edf8f5d00d22240cd1bac',
    hook: '0x5594d52827a7065daB361A5389aECdF6317E1f80',
    token0: '0x10bb9fEaE70b0644275dB3609457F1FB4bEa2F58',
    token1: '0xB03e218A95bd1a74F2A909E29036D459cD54FdD6',
    token0Symbol: 'USDC',
    token1Symbol: 'wstETH',
    fee: 3000,
    tickSpacing: 60,
    maturity: 1766715900,
    maturityDate: new Date('2025-12-27T00:00:00Z'),
    duration: '3M',
    description: 'wstETH/USDC 3 Month',
  },
  {
    id: 3,
    name: 'wstETH/PYUSD 1M',
    poolId: '0x28c89adadd937ec0941e66d5475bee018a568a0d1161ba1cb8096d35b1788071',
    hook: '0x481730012dAd4f0AF33C6AE6B4fa5a39779A1f80',
    token0: '0xB03e218A95bd1a74F2A909E29036D459cD54FdD6',
    token1: '0xFE57ba5ccE4B84D8B434FF5A1b25ec9F0fBD1125',
    token0Symbol: 'wstETH',
    token1Symbol: 'PYUSD',
    fee: 3000,
    tickSpacing: 60,
    maturity: 1761532044,
    maturityDate: new Date('2025-10-27T00:15:00Z'),
    duration: '1M',
    description: 'wstETH/PYUSD 1 Month',
  },
  {
    id: 4,
    name: 'wstETH/PYUSD 3M',
    poolId: '0xbce5cdd64f1bb45585bf81b546d4d24d9cdc8e639f24470d154ecc46496462ac',
    hook: '0x3583E1c89fa16d17fD43F3Be767d9d9eD5C51F80',
    token0: '0xB03e218A95bd1a74F2A909E29036D459cD54FdD6',
    token1: '0xFE57ba5ccE4B84D8B434FF5A1b25ec9F0fBD1125',
    token0Symbol: 'wstETH',
    token1Symbol: 'PYUSD',
    fee: 3000,
    tickSpacing: 60,
    maturity: 1766716128,
    maturityDate: new Date('2025-12-27T00:02:00Z'),
    duration: '3M',
    description: 'wstETH/PYUSD 3 Month',
  },
] as const;

export const TOKEN_INFO = {
  [DEPLOYED_ADDRESSES.MOCK_WSTETH]: {
    symbol: 'wstETH',
    name: 'Wrapped staked Ether',
    decimals: 18,
    address: DEPLOYED_ADDRESSES.MOCK_WSTETH,
  },
  [DEPLOYED_ADDRESSES.MOCK_USDC]: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18, // Note: Mock version uses 18 decimals
    address: DEPLOYED_ADDRESSES.MOCK_USDC,
  },
  [DEPLOYED_ADDRESSES.MOCK_PYUSD]: {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    decimals: 18,
    address: DEPLOYED_ADDRESSES.MOCK_PYUSD,
  },
  [DEPLOYED_ADDRESSES.MOCK_STETH]: {
    symbol: 'stETH',
    name: 'Staked Ether',
    decimals: 18,
    address: DEPLOYED_ADDRESSES.MOCK_STETH,
  },
} as const;

export const DEPLOYMENT_INFO = {
  network: 'sepolia',
  chainId: CHAIN_ID,
  deploymentDate: '2025-09-27',
  deployer: '0x46a70eac801fcbd6f6c336de1f0fbb9e570f17aa',
  status: 'complete',
  totalPools: 4,
  totalContracts: 23,
  gasUsed: '25,661,428',
  ethSpent: '~0.026 ETH',
  securityFeatures: [
    'ReentrancyGuard protection on all hook functions',
    'Maturity clamping to prevent funding accrual beyond expiry',
    'Mock tokens with proper pegging relationships',
    'Unlimited caps set for testing phase',
    'Router permissions configured for all hooks',
    'Comprehensive governance with TimelockController',
  ],
} as const;

// Helper functions
export const getPoolById = (poolId: string) => {
  return POOLS.find(pool => pool.poolId.toLowerCase() === poolId.toLowerCase());
};

export const getPoolByTokens = (token0: string, token1: string, duration: '1M' | '3M') => {
  return POOLS.find(pool => 
    ((pool.token0.toLowerCase() === token0.toLowerCase() && pool.token1.toLowerCase() === token1.toLowerCase()) ||
     (pool.token0.toLowerCase() === token1.toLowerCase() && pool.token1.toLowerCase() === token0.toLowerCase())) &&
    pool.duration === duration
  );
};

export const getTokenInfo = (address: string) => {
  return TOKEN_INFO[address.toLowerCase() as keyof typeof TOKEN_INFO];
};

export const isPoolExpired = (poolId: string) => {
  const pool = getPoolById(poolId);
  if (!pool) return false;
  return Date.now() > pool.maturityDate.getTime();
};

export default {
  CHAIN_ID,
  NETWORK,
  DEPLOYED_ADDRESSES,
  POOLS,
  TOKEN_INFO,
  DEPLOYMENT_INFO,
  getPoolById,
  getPoolByTokens,
  getTokenInfo,
  isPoolExpired,
};