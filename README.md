# Arth Protocol - Interest Rate Swaps on Ethereum

> **Built at EthGlobal New Delhi 2025**

A decentralized protocol for trading interest rates using Uniswap v4, making it easy to bet on whether ETH staking rates will go up or down.

## What is Arth Protocol?

Think of Arth Protocol like a betting platform for interest rates. If you think ETH staking rewards are going to increase, you can take a "fixed rate" position. If you think they'll decrease, you can take a "floating rate" position. The protocol automatically handles all the complex math and settlements for you.

### Real-World Example

- **Current ETH staking rate**: 4% per year
- **You think it will go up to 6%**: You take a "fixed rate" position
- **If you're right**: You earn the difference (2% extra)
- **If you're wrong**: You pay the difference

## How It Works

1. **Liquidity Providers** deposit money to create trading pools
2. **Traders** make bets on whether rates will go up or down  
3. **Smart Contracts** automatically calculate who wins/loses
4. **Oracle System** provides real ETH staking rate data
5. **Everyone gets paid** automatically based on actual rate changes

## Project Structure

```
IRS/
├── README.md                    # This file - project overview
├── DOCS.md                      # Financial concepts explained
├── LICENSE                      # MIT license
├── foundry.toml                 # Build configuration
├── deployed-addresses.*         # Where contracts live on blockchain
│
├── src/                         # Smart contract code
│   ├── hooks/                   # Core trading logic
│   │   └── ArthHook.sol           # Main protocol engine
│   ├── factory/                # Pool creation
│   │   └── ArthPoolFactory.sol    # Creates new trading pools
│   ├── oracles/                # Rate data sources
│   │   └── BaseIndex.sol          # ETH staking rate oracle
│   ├── risk/                   # Safety controls
│   │   ├── MarginManager.sol      # Risk management
│   │   └── ArthLiquidityCaps.sol  # Pool size limits
│   └── interfaces/             # Contract blueprints
│
├── script/                     # Deployment scripts
│   ├── DeployInfrastructure.s.sol # Deploy core system
│   └── DeployPool1-4.s.sol       # Deploy trading pools
│
├── test/                       # Test code
│   └── IRSHook.t.sol             # Tests for main logic
│
├── ui/                         # Frontend application (future)
│   └── src/abi/                   # Contract interfaces for UI
│
└── lib/                        # External dependencies
    ├── forge-std/                 # Testing framework
    ├── openzeppelin-contracts/    # Security standards
    ├── v4-core/                   # Uniswap v4 core
    └── v4-periphery/              # Uniswap v4 helpers
```

## Key Components Explained

### ArthHook (`src/hooks/ArthHook.sol`)

The brain of the protocol. Handles all the trading logic, calculates who owes what to whom, and makes sure everyone gets paid correctly.

### ArthPoolFactory (`src/factory/ArthPoolFactory.sol`)

Creates new trading pools with different expiration dates (like options contracts that expire).

### BaseIndex (`src/oracles/BaseIndex.sol`)

Watches the real ETH staking rate and feeds this data to the protocol so it knows who won their bets.

### Risk Management (`src/risk/`)

Safety systems that prevent the protocol from breaking:

- **MarginManager**: Makes sure people have enough money to cover their bets
- **ArthLiquidityCaps**: Limits how much money can go into each pool

### Router & Periphery

User-friendly interfaces that make it easy to interact with the protocol without needing to understand all the technical details.

## For Developers

### Quick Start

```bash
# Install dependencies
forge install

# Run tests
forge test

# Deploy to testnet (requires setup)
source .env && forge script script/DeployInfrastructure.s.sol
```

### Tech Stack

- **Solidity 0.8.26** - Smart contract language
- **Foundry** - Development framework  
- **Uniswap v4** - AMM infrastructure with hooks
- **OpenZeppelin** - Security standards
- **Pyth Network** - Price feeds

## Why This Matters

Traditional finance has huge interest rate derivatives markets (worth trillions), but DeFi has very few. Arth Protocol brings sophisticated interest rate trading to Ethereum, making it accessible to anyone with a wallet.

This enables:

- **Risk Management** - Hedge against rate changes
- **Speculation** - Profit from rate predictions  
- **Yield Optimization** - Better returns on ETH staking
- **Capital Efficiency** - Leverage without borrowing

## License

MIT License - see `LICENSE` file for details.
