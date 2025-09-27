// ABI Exports for IRS Protocol
// This file provides easy imports for all contract ABIs
// Updated: 2025-09-27 - Latest ABIs from deployment

// Core Protocol Contracts
export { default as ArthV4RouterABI } from './ArthV4Router.json'
export { default as ArthPoolFactoryABI } from './ArthPoolFactory.json'
export { default as ArthHookABI } from './ArthHook.json'
export { default as ArthLiquidityCapsABI } from './ArthLiquidityCaps.json'

// Oracle & Risk Management
export { default as BaseIndexABI } from './BaseIndex.json'  
export { default as RiskEngineABI } from './RiskEngine.json'
export { default as PythOracleAdapterABI } from './PythOracleAdapter.json'

// Governance
export { default as ArthControllerABI } from './ArthController.json'
export { default as TimelockControllerABI } from './TimelockController.json'

// Periphery
export { default as ArthReceiptsABI } from './ArthReceipts.json'

// Token Contracts
export { default as ERC20ABI } from './ERC20.json'
export { default as WETHABI } from './WETH.json'
export { default as MockERC20ABI } from './MockERC20.json'
export { default as MockStETHABI } from './MockStETH.json'
export { default as MockWstETHABI } from './MockWstETH.json'

// Import ABIs for the all-in-one object
import ArthV4RouterJSON from './ArthV4Router.json';
import ArthPoolFactoryJSON from './ArthPoolFactory.json';
import ArthHookJSON from './ArthHook.json';
import ArthLiquidityCapsJSON from './ArthLiquidityCaps.json';
import BaseIndexJSON from './BaseIndex.json';
import RiskEngineJSON from './RiskEngine.json';
import PythOracleAdapterJSON from './PythOracleAdapter.json';
import ArthControllerJSON from './ArthController.json';
import TimelockControllerJSON from './TimelockController.json';
import ArthReceiptsJSON from './ArthReceipts.json';
import ERC20JSON from './ERC20.json';
import WETHJSON from './WETH.json';
import MockERC20JSON from './MockERC20.json';
import MockStETHJSON from './MockStETH.json';
import MockWstETHJSON from './MockWstETH.json';

// All ABIs in one object for convenience
export const ALL_ABIS = {
  // Core Protocol
  ArthV4Router: ArthV4RouterJSON,
  ArthPoolFactory: ArthPoolFactoryJSON,
  ArthHook: ArthHookJSON,
  ArthLiquidityCaps: ArthLiquidityCapsJSON,
  
  // Oracle & Risk
  BaseIndex: BaseIndexJSON,
  RiskEngine: RiskEngineJSON,
  PythOracleAdapter: PythOracleAdapterJSON,
  
  // Governance
  ArthController: ArthControllerJSON,
  TimelockController: TimelockControllerJSON,
  
  // Periphery
  ArthReceipts: ArthReceiptsJSON,
  
  // Tokens
  ERC20: ERC20JSON,
  WETH: WETHJSON,
  MockERC20: MockERC20JSON,
  MockStETH: MockStETHJSON,
  MockWstETH: MockWstETHJSON,
} as const

// Contract address type mappings for easy access
export type ContractName = keyof typeof ALL_ABIS

// Helper function to get ABI by contract name
export function getABI(contractName: ContractName) {
  return ALL_ABIS[contractName]
}