import ArthV4RouterABI from './abi/ArthV4Router.json'
import BaseIndexABI from './abi/BaseIndex.json'
import RiskEngineABI from './abi/RiskEngine.json'
import ArthHookABI from './abi/ArthHook.json'
import ArthControllerABI from './abi/ArthController.json'
import ArthReceiptsABI from './abi/ArthReceipts.json'
import ArthPoolFactoryABI from './abi/ArthPoolFactory.json'
import ArthLiquidityCapsABI from './abi/ArthLiquidityCaps.json'
import TimelockControllerABI from './abi/TimelockController.json'
import ERC20ABI from './abi/ERC20.json'
import WETHABI from './abi/WETH.json'

export const ChainId = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  ARBITRUM: 42161,
  ARBITRUM_SEPOLIA: 421614,
  OPTIMISM: 10,
  POLYGON: 137,
  LOCALHOST: 31337,
} as const

export type ChainId = typeof ChainId[keyof typeof ChainId]

export type ContractAddresses = {
  baseIndex: `0x${string}`
  riskEngine: `0x${string}`
  arthPoolFactory: `0x${string}`
  arthController: `0x${string}`
  timelockController: `0x${string}`
  arthLiquidityCaps: `0x${string}`
  arthV4Router: `0x${string}`
  arthReceipts: `0x${string}`
  arthHook: `0x${string}`
  poolManager: `0x${string}`
  weth: `0x${string}`
  poolId: `0x${string}`
  token0: `0x${string}`
  token1: `0x${string}`
}

export const LOCALHOST_ADDRESSES: ContractAddresses = {
  baseIndex: '0x3eEAEf0dddbda233651dc839591b992795Ba7168',
  riskEngine: '0x346422cF9c620668089453838EDD1a30F9b1A273',
  arthPoolFactory: '0x026A3CA6397910FD2BD338a79D4105c732A3426C',
  arthController: '0xe6aFbd041bA789DCE149146392dB7159A25feCb8',
  timelockController: '0x21A21fa613917600e9dDE4441920562bB6238DaE',
  arthLiquidityCaps: '0x393F953291462A34EF3dC6Ee33567a592af46C8a',
  arthV4Router: '0x41721CCE8813917396cffF1F795cb7474C32aCF8',
  arthReceipts: '0xC97f61D15ce51aa16D056106DF7F76aAe3c64090',
  arthHook: '0xBe7557e87b667Fa54CA01c63C8D03f1863141f80',
  poolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90',
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  poolId: '0xfb1bf4b051f3686eaccc8a7dfbea5c878669f39485b08505e601254ce52205ec',
  token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

export const MAINNET_ADDRESSES: ContractAddresses = {
  ...LOCALHOST_ADDRESSES,
}

export const SEPOLIA_ADDRESSES: Partial<ContractAddresses> = {
  poolManager: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543',
  weth: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
}

export const BASE_ADDRESSES: Partial<ContractAddresses> = {
  poolManager: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408',
  weth: '0x4200000000000000000000000000000000000006',
}

export const ARBITRUM_ADDRESSES: Partial<ContractAddresses> = {
  poolManager: '0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317',
  weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
}

export const ADDRESSES: Record<ChainId, Partial<ContractAddresses>> = {
  [ChainId.MAINNET]: MAINNET_ADDRESSES,
  [ChainId.SEPOLIA]: SEPOLIA_ADDRESSES,
  [ChainId.BASE]: BASE_ADDRESSES,
  [ChainId.ARBITRUM]: ARBITRUM_ADDRESSES,
  [ChainId.LOCALHOST]: LOCALHOST_ADDRESSES,
  [ChainId.BASE_SEPOLIA]: {},
  [ChainId.ARBITRUM_SEPOLIA]: {},
  [ChainId.OPTIMISM]: {},
  [ChainId.POLYGON]: {},
}

export const POOL_CONFIG = {
  fee: 3000,
  tickSpacing: 60,
  maturity: 1767225600,
  sqrtPriceX96: '79228162514264337593543950336',
} as const

export const TOKEN_INFO = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      [ChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      [ChainId.LOCALHOST]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    }
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    addresses: {
      [ChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      [ChainId.SEPOLIA]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      [ChainId.BASE]: '0x4200000000000000000000000000000000000006',
      [ChainId.ARBITRUM]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      [ChainId.LOCALHOST]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    }
  }
} as const

export const ABIS = {
  ArthV4Router: ArthV4RouterABI,
  BaseIndex: BaseIndexABI,
  RiskEngine: RiskEngineABI,
  ArthHook: ArthHookABI,
  ArthController: ArthControllerABI,
  ArthReceipts: ArthReceiptsABI,
  ArthPoolFactory: ArthPoolFactoryABI,
  ArthLiquidityCaps: ArthLiquidityCapsABI,
  TimelockController: TimelockControllerABI,
  ERC20: ERC20ABI,
  WETH: WETHABI,
} as const

export const NETWORKS = {
  [ChainId.MAINNET]: {
    name: 'Ethereum Mainnet',
    chainId: ChainId.MAINNET,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainId.SEPOLIA]: {
    name: 'Sepolia Testnet',
    chainId: ChainId.SEPOLIA,
    rpcUrl: 'https://sepolia.infura.io/v3/f63507be5dc84ff8951ed0be5e9c687b',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
  },
  [ChainId.BASE]: {
    name: 'Base',
    chainId: ChainId.BASE,
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainId.ARBITRUM]: {
    name: 'Arbitrum One',
    chainId: ChainId.ARBITRUM,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainId.LOCALHOST]: {
    name: 'Localhost',
    chainId: ChainId.LOCALHOST,
    rpcUrl: 'http://localhost:8545',
    blockExplorer: 'http://localhost:8545',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const

export function getContractAddresses(chainId: ChainId): Partial<ContractAddresses> {
  return ADDRESSES[chainId] || {}
}

export function getTokenAddress(token: keyof typeof TOKEN_INFO, chainId: number): `0x${string}` | undefined {
  const addresses = TOKEN_INFO[token].addresses as Record<number, string | undefined>
  return (addresses[chainId] as `0x${string}` | undefined) ?? undefined
}

export function isChainSupported(chainId: number): chainId is ChainId {
  return Object.values(ChainId).includes(chainId as ChainId)
}

export function getNetworkName(chainId: number): string {
  return (NETWORKS as Record<number, { name: string }>)[chainId]?.name || 'Unknown Network'
}

export const CONTRACT_FUNCTIONS = {
  router: {
    addLiquidity: 'addLiquidity',
    removeLiquidity: 'removeLiquidity',
    exactInputSingle: 'exactInputSingle',
    exactOutputSingle: 'exactOutputSingle',
    multicall: 'multicall',
  },
  oracle: {
    ratePerSecond: 'ratePerSecond',
    cumulative: 'cumulative',
    lastUpdate: 'lastUpdate',
    frozen: 'frozen',
  },
  risk: {
    getMargin: 'getMargin',
    getPositions: 'getPositions',
    requireIM: 'requireIM',
    positionKey: 'positionKey',
  },
  erc20: {
    balanceOf: 'balanceOf',
    allowance: 'allowance',
    approve: 'approve',
    transfer: 'transfer',
    transferFrom: 'transferFrom',
  },
  weth: {
    deposit: 'deposit',
    withdraw: 'withdraw',
  },
} as const

export default {
  ChainId,
  ADDRESSES,
  ABIS,
  POOL_CONFIG,
  TOKEN_INFO,
  NETWORKS,
  CONTRACT_FUNCTIONS,
  getContractAddresses,
  getTokenAddress,
  isChainSupported,
  getNetworkName,
}