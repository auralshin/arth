# IRS Protocol UI Integration

React + TypeScript + Vite frontend integration for the Arth Interest Rate Swap (IRS) Protocol.

## Overview

This UI package provides a complete frontend integration for the Arth IRS Protocol, including:

- Contract ABIs for all protocol contracts
- TypeScript type definitions and configurations
- Multi-chain support (Mainnet, Base, Arbitrum, Optimism, Sepolia)
- Wagmi/Viem integration utilities

## Project Structure

```bash
ui/
├── src/
│   ├── abi/           # Contract ABIs
│   │   ├── ArthV4Router.json
│   │   ├── EthBaseIndex.json
│   │   ├── RiskEngine.json
│   │   ├── ArthHook.json
│   │   ├── ArthController.json
│   │   ├── ArthReceipts.json
│   │   ├── ArthPoolFactory.json
│   │   ├── ArthLiquidityCaps.json
│   │   ├── TimelockController.json
│   │   ├── ERC20.json
│   │   └── WETH.json
│   └── contracts.ts   # Address and configuration management
```

## Contract Integration

### Core Contracts

The protocol includes these main contracts:

1. **ArthV4Router** - Main entry point for user interactions
2. **EthBaseIndex** - Oracle for ETH base rate calculations
3. **RiskEngine** - Risk management and margin calculations
4. **ArthHook** - Uniswap V4 hook integration
5. **ArthController** - Core protocol controller
6. **ArthReceipts** - Position receipt tokens
7. **ArthPoolFactory** - Pool creation and management
8. **ArthLiquidityCaps** - Liquidity cap management
9. **TimelockController** - Governance timelock

### Usage Example

```typescript
import { ArthV4RouterABI } from './abi/ArthV4Router.json';
import { CONTRACTS, getContractAddress, ChainId } from './contracts';
import { useContract, useChainId } from 'wagmi';

// Get contract for current chain
const chainId = useChainId();
const routerAddress = getContractAddress('ArthV4Router', chainId);

// Use with wagmi
const { data: contract } = useContract({
  address: routerAddress,
  abi: ArthV4RouterABI,
});
```

### Wagmi Configuration

```typescript
import { createConfig, http } from 'wagmi';
import { mainnet, base, arbitrum, optimism, sepolia } from 'wagmi/chains';
import { SUPPORTED_CHAINS } from './contracts';

export const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism, sepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
  },
});
```

## Network Support

### Supported Networks

- **Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)  
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Sepolia** (Chain ID: 11155111) - Testnet

### Pool Managers

Each network uses Uniswap V4 Pool Managers:

- **Mainnet**: `0x7Da1D65F8B249183667cdE74C5CBD46dD38AA829`
- **Base**: `0x7Da1D65F8B249183667cdE74C5CBD46dD38AA829`
- **Arbitrum**: `0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4`
- **Optimism**: `0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4`
- **Sepolia**: `0x7Da1D65F8B249183667cdE74C5CBD46dD38AA829`

### Token Addresses

Standard tokens with network-specific addresses:

```typescript
// USDC addresses across networks
const USDC_ADDRESSES = {
  [ChainId.MAINNET]: '0xA0b86a991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ChainId.BASE]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [ChainId.ARBITRUM]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [ChainId.OPTIMISM]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  [ChainId.SEPOLIA]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
};
```

## Type Definitions

The `contracts.ts` file provides comprehensive TypeScript support:

```typescript
// Chain ID enum
enum ChainId {
  MAINNET = 1,
  BASE = 8453,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  SEPOLIA = 11155111,
}

// Contract address type
type ContractAddresses = {
  ArthV4Router: `0x${string}`;
  EthBaseIndex: `0x${string}`;
  RiskEngine: `0x${string}`;
  ArthHook: `0x${string}`;
  ArthController: `0x${string}`;
  ArthReceipts: `0x${string}`;
  ArthPoolFactory: `0x${string}`;
  ArthLiquidityCaps: `0x${string}`;
  TimelockController: `0x${string}`;
};

// Network configuration
type NetworkConfig = {
  chainId: ChainId;
  name: string;
  poolManager: `0x${string}`;
  contracts: ContractAddresses;
};
```

## Development Setup

### Prerequisites

```bash
# Install dependencies
npm install
# or
yarn install
```

### Required Packages

For full integration, install these packages:

```bash
npm install viem wagmi @tanstack/react-query
```

### Environment Variables

Create `.env.local` with your configuration:

```bash
# RPC URLs
VITE_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# WalletConnect Project ID (optional)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Protocol Integration Examples

### Opening an IRS Position

```typescript
import { useWriteContract } from 'wagmi';
import { ArthV4RouterABI } from './abi/ArthV4Router.json';
import { getContractAddress } from './contracts';

function OpenPosition() {
  const { writeContract } = useWriteContract();
  
  const openIRS = async () => {
    const routerAddress = getContractAddress('ArthV4Router', chainId);
    
    await writeContract({
      address: routerAddress,
      abi: ArthV4RouterABI,
      functionName: 'openIRSPosition',
      args: [
        poolKey,        // Pool configuration
        params,         // Position parameters
        hookData,       // Hook-specific data
      ],
    });
  };
  
  return <button onClick={openIRS}>Open IRS Position</button>;
}
```

### Reading Oracle Data

```typescript
import { useReadContract } from 'wagmi';
import { EthBaseIndexABI } from './abi/EthBaseIndex.json';

function OracleData() {
  const { data: baseRate } = useReadContract({
    address: getContractAddress('EthBaseIndex', chainId),
    abi: EthBaseIndexABI,
    functionName: 'getBaseRate',
  });
  
  return <div>Current Base Rate: {baseRate}</div>;
}
```

## Build and Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Security Considerations

- Always validate contract addresses before transactions
- Use proper error handling for contract interactions
- Implement slippage protection for trades
- Verify network matches expected chain ID
- Use read-only contracts for data fetching when possible

## Support

For technical support and documentation:

- Protocol Documentation: See `../DEPLOYMENT.md`
- Contract Deployment: See `../script/DeployAll.s.sol`
- Testing: See `../test/` directory

## License

This project is licensed under the same license as the main IRS Protocol.
