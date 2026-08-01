import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  title: string;
  path?: string;
  isOpened?: boolean;
  defaultOpen?: boolean;
  externalUrl?: string;
  icon?: string;
  isPending?: boolean;
  isNew?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  private _isSidebarOpened = true;

  @Input()
  set isSidebarOpened(value: boolean) {
    this._isSidebarOpened = value;
  }

  get isSidebarOpened(): boolean {
    return this._isSidebarOpened;
  }

  @HostBinding('class.opened')
  get isOpened(): boolean {
    return this._isSidebarOpened;
  }

  readonly items: MenuItem[] = [
    {
      title: 'Intro',
      path: '/',
    },
    {
      title: 'Start Here',
      isOpened: false,
      children: [
        { title: 'How To Navigate', path: '/welcome/how-to-navigate' },
        { title: 'Reading Paths', path: '/welcome/reading-paths' },
        { title: 'Prerequisites', path: '/welcome/prerequisites' },
        { title: 'Notation & Conventions', path: '/welcome/notation-conventions' },
        { title: 'How To Read an Arth Page', path: '/start-here/how-to-read' },
        { title: 'Why This Matters', path: '/welcome/why-this-matters' },
        { title: 'Risk Reality Check', path: '/welcome/risk-reality-check' },
      ],
    },
    {
      title: 'Foundations',
      isOpened: false,
      children: [
        {
          title: 'Math & Probability',
          isOpened: false,
          children: [
            { title: 'Random Variables', path: '/quant-math/random-variables' },
            { title: 'Expectation & Variance', path: '/quant-math/expectation-variance' },
            { title: 'Covariance', path: '/quant-math/covariance' },
            { title: 'LLN & CLT', path: '/quant-math/lln-clt' },
            { title: 'Sampling', path: '/quant-math/sampling' },
          ],
        },
        {
          title: 'Statistics & Time Series',
          isOpened: false,
          children: [
            { title: 'Returns', path: '/quant-math/returns' },
            { title: 'Volatility', path: '/quant-math/volatility' },
            { title: 'Autocorrelation', path: '/quant-math/autocorrelation' },
            { title: 'Stationarity', path: '/quant-math/stationarity' },
            { title: 'Rolling Windows', path: '/quant-math/rolling-windows' },
          ],
        },
        {
          title: 'Statistical Methods',
          isOpened: false,
          children: [
            { title: 'Hypothesis Testing', path: '/stat-methods/hypothesis-testing' },
            { title: 'Confidence Intervals', path: '/stat-methods/confidence-intervals' },
            { title: 'Linear Regression', path: '/stat-methods/linear-regression' },
            { title: 'Regression Diagnostics', path: '/stat-methods/regression-diagnostics' },
            { title: 'Factor Models', path: '/stat-methods/factor-models' },
            { title: 'PCA', path: '/stat-methods/pca' },
            { title: 'ARIMA', path: '/stat-methods/arima' },
            { title: 'GARCH', path: '/stat-methods/garch' },
            { title: 'Unit Roots', path: '/stat-methods/unit-roots' },
            { title: 'Cointegration', path: '/stat-methods/cointegration' },
            { title: 'Multiple Testing', path: '/stat-methods/multiple-testing' },
            { title: 'Backtest Overfitting', path: '/stat-methods/backtest-overfitting' },
            { title: 'Bootstrap', path: '/stat-methods/bootstrap' },
          ],
        },
        {
          title: 'Stochastic Processes',
          isOpened: false,
          children: [
            { title: 'Random Walks', path: '/quant-math/random-walks' },
            { title: 'Geometric Brownian Motion', path: '/quant-math/gbm' },
            { title: 'Mean Reversion', path: '/quant-math/mean-reversion' },
            { title: 'Jump Processes', path: '/quant-math/jumps' },
          ],
        },
        {
          title: 'Stochastic Calculus',
          isOpened: false,
          children: [
            { title: 'Brownian Motion', path: '/stochastic-calculus/brownian-motion' },
            { title: 'Martingales & Filtrations', path: '/stochastic-calculus/martingales-filtrations' },
            { title: "Ito's Lemma", path: '/stochastic-calculus/ito-lemma' },
            { title: 'SDEs', path: '/stochastic-calculus/sdes' },
            { title: 'Numerical Schemes', path: '/stochastic-calculus/numerical-schemes' },
            { title: 'Change of Measure', path: '/stochastic-calculus/change-of-measure' },
            { title: 'Risk-Neutral Pricing', path: '/stochastic-calculus/risk-neutral-pricing' },
            { title: 'Feynman-Kac', path: '/stochastic-calculus/feynman-kac' },
            { title: 'Ornstein-Uhlenbeck', path: '/stochastic-calculus/ornstein-uhlenbeck' },
          ],
        },
      ],
    },
    {
      title: 'Markets & Instruments',
      isOpened: false,
      children: [
        {
          title: 'Orientation',
          isOpened: false,
          children: [
            { title: 'Market Participants', path: '/markets/market-participants' },
            { title: 'Instrument Map', path: '/markets/instrument-map' },
          ],
        },
        {
          title: 'Equities',
          isOpened: false,
          children: [
            { title: 'Equities 101', path: '/markets/equities-101' },
            { title: 'Corporate Actions', path: '/markets/corporate-actions' },
            { title: 'Short Selling', path: '/markets/short-selling' },
            { title: 'Equity Indices', path: '/markets/equity-indices' },
          ],
        },
        {
          title: 'Futures & Commodities',
          isOpened: false,
          children: [
            { title: 'Futures 101', path: '/markets/futures-101' },
            { title: 'Roll & Carry', path: '/markets/roll-and-carry' },
            { title: 'Calendar Spreads', path: '/markets/calendar-spreads' },
            { title: 'Commodities', path: '/markets/commodities' },
          ],
        },
        {
          title: 'FX',
          isOpened: false,
          children: [
            { title: 'FX 101', path: '/markets/fx-101' },
            { title: 'Carry & Parity', path: '/markets/fx-carry-parity' },
          ],
        },
        {
          title: 'Fixed Income',
          isOpened: false,
          children: [
            { title: 'Fixed Income 101', path: '/markets/fixed-income-101' },
            { title: 'Yield Curves', path: '/markets/yield-curves' },
            { title: 'Duration & Convexity', path: '/markets/duration-convexity' },
            { title: 'Curve Construction', path: '/markets/curve-construction' },
          ],
        },
      ],
    },
    {
      title: 'Derivatives & Options',
      isOpened: false,
      children: [
        { title: 'Options 101', path: '/derivatives/options-101' },
        { title: 'Payoffs & Put-Call Parity', path: '/derivatives/payoffs-parity' },
        { title: 'No-Arbitrage & Replication', path: '/derivatives/no-arbitrage-replication' },
        { title: 'Binomial Trees', path: '/derivatives/binomial-trees' },
        { title: 'Black-Scholes', path: '/derivatives/black-scholes' },
        { title: 'The Greeks', path: '/derivatives/greeks' },
        { title: 'Delta Hedging', path: '/derivatives/delta-hedging' },
        { title: 'Implied Volatility', path: '/derivatives/implied-volatility' },
        { title: 'Volatility Surface', path: '/derivatives/vol-surface' },
        { title: 'Volatility Term Structure', path: '/derivatives/vol-term-structure' },
        { title: 'Exotic Options', path: '/derivatives/exotics' },
        { title: 'Variance Swaps', path: '/derivatives/variance-swaps' },
      ],
    },
    {
      title: 'Credit',
      isOpened: false,
      children: [
        { title: 'Credit 101', path: '/credit/credit-101' },
        { title: 'Credit Spreads', path: '/credit/credit-spreads' },
        { title: 'Default Probability', path: '/credit/default-probability' },
        { title: 'Merton Model', path: '/credit/merton-model' },
        { title: 'Reduced-Form Models', path: '/credit/reduced-form-models' },
        { title: 'Credit Default Swaps', path: '/credit/cds' },
        { title: 'Recovery Rates', path: '/credit/recovery-rates' },
        { title: 'Credit Curves', path: '/credit/credit-curves' },
      ],
    },
    {
      title: 'Microstructure & Execution',
      isOpened: false,
      children: [
        {
          title: 'Market Microstructure',
          isOpened: false,
          children: [
            { title: 'Trading Foundations', path: '/trading-foundations' },
            { title: 'Orderbooks vs AMMs', path: '/microstructure/orderbooks-vs-amms' },
            { title: 'Slippage', path: '/microstructure/slippage' },
            { title: 'Fees & Routing', path: '/microstructure/fees-routing' },
            { title: 'Latency Risk', path: '/microstructure/latency-risk' },
          ],
        },
        {
          title: 'Execution & Trading Systems',
          isOpened: false,
          children: [
            { title: 'Execution Overview', path: '/execution/execution-overview' },
            { title: 'Order Types', path: '/execution/order-types' },
            { title: 'Market Impact', path: '/execution/market-impact' },
            { title: 'Almgren-Chriss', path: '/execution/almgren-chriss' },
            { title: 'TWAP & VWAP', path: '/execution/twap-vwap' },
            { title: 'Implementation Shortfall', path: '/execution/implementation-shortfall' },
            { title: 'Smart Order Routing', path: '/execution/smart-order-routing' },
            { title: 'Transaction Cost Analysis', path: '/execution/transaction-cost-analysis' },
            { title: 'Adverse Selection', path: '/execution/adverse-selection' },
            { title: 'Execution Benchmarks', path: '/execution/execution-benchmarks' },
          ],
        },
      ],
    },
    {
      title: 'Signals & Features',
      isOpened: false,
      children: [
        { title: 'What Is a Signal?', path: '/signals/what-is-signal' },
        { title: 'Momentum vs Mean Reversion', path: '/signals/momentum-vs-mean-reversion' },
        {
          title: 'Trend & Oscillators',
          isOpened: false,
          children: [
            { title: 'Moving Averages', path: '/signals/moving-averages' },
            { title: 'MA Crossovers', path: '/signals/ma-crossovers' },
            { title: 'RSI', path: '/signals/rsi' },
            { title: 'MACD', path: '/signals/macd' },
            { title: 'Bollinger Bands', path: '/signals/bollinger' },
            { title: 'ATR', path: '/signals/atr' },
            { title: 'Stochastic Oscillator', path: '/signals/stochastic' },
          ],
        },
        {
          title: 'Volume & Flow',
          isOpened: false,
          children: [
            { title: 'Volume', path: '/signals/volume' },
            { title: 'OBV', path: '/signals/obv' },
            { title: 'Liquidity & Depth', path: '/signals/liquidity' },
          ],
        },
        {
          title: 'Derivatives & Positioning',
          isOpened: false,
          children: [
            { title: 'Funding Rate', path: '/signals/funding-rate' },
            { title: 'Open Interest', path: '/signals/open-interest' },
            { title: 'Basis & Term Structure', path: '/signals/basis' },
          ],
        },
      ],
    },
    {
      title: 'Strategy Design',
      isOpened: false,
      children: [
        { title: 'How To Read a Strategy', path: '/strategies/how-to-read' },
        { title: 'Buy & Hold', path: '/strategies/buy-hold' },
        { title: 'Momentum', path: '/strategies/momentum' },
        { title: 'RSI Strategy', path: '/strategies/rsi-strategy' },
        { title: 'MACD Strategy', path: '/strategies/macd-strategy' },
        { title: 'Pairs Trading', path: '/strategies/pairs' },
        { title: 'Cash & Carry', path: '/strategies/cash-carry' },
        { title: 'Delta-Neutral', path: '/strategies/delta-neutral' },
        { title: 'Market Making Lite', path: '/strategies/mm-lite' },
        { title: 'Stop-Loss', path: '/strategies/stop-loss' },
        { title: 'Dynamic Sizing', path: '/strategies/dynamic-sizing' },
      ],
    },
    {
      title: 'Portfolio & Risk',
      isOpened: false,
      children: [
        {
          title: 'Performance Metrics',
          isOpened: false,
          children: [
            { title: 'Sharpe Ratio', path: '/quant-math/sharpe' },
            { title: 'Sortino Ratio', path: '/quant-math/sortino' },
            { title: 'Drawdown', path: '/quant-math/drawdown' },
            { title: 'VaR & CVaR', path: '/quant-math/var-cvar' },
          ],
        },
        {
          title: 'Sizing & Allocation',
          isOpened: false,
          children: [
            { title: 'Kelly Criterion', path: '/quant-math/kelly' },
            { title: 'Optimization', path: '/quant-math/optimization' },
            { title: 'Mean-Variance', path: '/quant-math/mean-variance' },
            { title: 'Position Sizing', path: '/quant-math/position-sizing' },
            { title: 'Rebalancing', path: '/quant-math/rebalancing' },
          ],
        },
        {
          title: 'Risk Management',
          isOpened: false,
          children: [
            { title: 'Types of Risk', path: '/risk/types' },
            { title: 'Leverage & Liquidation', path: '/risk/leverage-liquidation' },
            { title: 'Backtest vs Live', path: '/risk/backtest-vs-live' },
            { title: 'Operational Risk', path: '/risk/operational' },
            { title: 'Risk Checklists', path: '/risk/checklists' },
          ],
        },
      ],
    },
    {
      title: 'Market Regimes & Macro',
      isOpened: false,
      children: [
        { title: 'Regimes Overview', path: '/regimes-macro/regimes-overview' },
        { title: 'Markov Switching', path: '/regimes-macro/markov-switching' },
        { title: 'Hidden Markov Models', path: '/regimes-macro/hidden-markov-models' },
        { title: 'Changepoint Detection', path: '/regimes-macro/changepoint-detection' },
        { title: 'Correlation Breakdown', path: '/regimes-macro/correlation-breakdown' },
        { title: 'Rates & Inflation', path: '/regimes-macro/rates-and-inflation' },
        { title: 'Liquidity Cycles', path: '/regimes-macro/liquidity-cycles' },
        { title: 'Macro Factors', path: '/regimes-macro/macro-factors' },
      ],
    },
    {
      title: 'Data & Tooling',
      isOpened: false,
      children: [
        { title: 'Data Sources', path: '/data-tooling/data-sources' },
        { title: 'Time Series', path: '/data-tooling/time-series' },
        { title: 'Cleaning', path: '/data-tooling/cleaning' },
        { title: 'Pipeline', path: '/data-tooling/pipeline' },
        { title: 'Python', path: '/data-tooling/python' },
        { title: 'TypeScript', path: '/data-tooling/typescript' },
        { title: 'Python Setup', path: '/data-tooling/python-setup' },
        { title: 'Notebooks', path: '/data-tooling/notebooks' },
        { title: 'Reproducible Research', path: '/data-tooling/reproducible' },
        { title: 'Dashboards', path: '/data-tooling/dashboards' },
        { title: 'Tooling & Simulation Ecosystem', path: '/tooling-simulation-ecosystem' },
      ],
    },
    {
      title: 'Simulation & Backtesting',
      isOpened: false,
      children: [
        { title: 'Why Backtest', path: '/simulation/why-backtest' },
        { title: 'Event-Driven', path: '/simulation/event-driven' },
        { title: 'Building a Backtester', path: '/simulation/building-backtester' },
        { title: 'Data Preparation', path: '/simulation/data-prep' },
        { title: 'Metrics', path: '/simulation/metrics' },
        { title: 'Scenarios', path: '/simulation/scenarios' },
        { title: 'Parameter Sweeps', path: '/simulation/param-sweeps' },
        { title: 'Agent-Based', path: '/simulation/agent-based' },
        { title: 'Orderbook Simulation', path: '/simulation/orderbook' },
        { title: 'Backtesting in Python', path: '/simulation/python' },
        { title: 'Backtesting in TypeScript', path: '/simulation/typescript' },
        {
          title: 'Simulation Engineering',
          isOpened: false,
          children: [
            { title: 'Building Simulations', path: '/building-simulations' },
            { title: 'Agent-Based Simulation', path: '/building-simulations/agent-based-simulation' },
            { title: 'Backtesting Framework', path: '/building-simulations/backtesting-framework' },
            { title: 'Data Pipeline Replay', path: '/building-simulations/data-pipeline-replay' },
            { title: 'Event-Driven Architecture', path: '/building-simulations/event-driven-architecture' },
            { title: 'Performance Optimization', path: '/building-simulations/performance-optimization' },
          ],
        },
      ],
    },
    {
      title: 'Machine Learning for Finance',
      isOpened: false,
      children: [
        { title: 'ML Overview', path: '/ml-finance/ml-overview' },
        { title: 'Feature Engineering', path: '/ml-finance/feature-engineering' },
        { title: 'Labelling', path: '/ml-finance/labelling' },
        { title: 'Meta-Labelling', path: '/ml-finance/meta-labelling' },
        { title: 'Purged Cross-Validation', path: '/ml-finance/purged-cross-validation' },
        { title: 'Regularisation', path: '/ml-finance/regularisation' },
        { title: 'Ensembles', path: '/ml-finance/ensembles' },
        { title: 'Interpretability', path: '/ml-finance/interpretability' },
        { title: 'ML Pitfalls', path: '/ml-finance/ml-pitfalls' },
      ],
    },
    {
      title: 'DeFi & On-Chain Markets',
      isOpened: false,
      children: [
        {
          title: 'Orientation',
          isOpened: false,
          children: [
            { title: 'What Is DeFi', path: '/welcome/what-is-defi' },
            { title: 'TradFi To DeFi', path: '/start-here/tradfi-to-defi' },
            { title: 'What "On-Chain" Means', path: '/start-here/on-chain-meaning' },
            { title: 'Tokens & Addresses', path: '/start-here/tokens-addresses' },
            { title: 'Use Cases', path: '/start-here/use-cases' },
            { title: 'Day in the Life', path: '/start-here/day-in-life' },
            { title: 'Where People Lose Money', path: '/start-here/losing-money' },
          ],
        },
        {
          title: 'Primitives',
          isOpened: false,
          children: [
            { title: 'Tokens 101', path: '/building-blocks/tokens-101' },
            { title: 'Token Standards', path: '/building-blocks/token-standards' },
            { title: 'ERC-20', path: '/building-blocks/erc20' },
            { title: 'Tokenomics', path: '/building-blocks/tokenomics' },
            { title: 'Liquidity Pools', path: '/building-blocks/liquidity-pools' },
            { title: 'AMMs 101', path: '/building-blocks/amms-101' },
            { title: 'Swaps & DEXs', path: '/building-blocks/swaps-dexs' },
            { title: 'Impermanent Loss', path: '/building-blocks/impermanent-loss' },
            { title: 'Yield Farming', path: '/building-blocks/yield-farming' },
            { title: 'Stablecoins', path: '/building-blocks/stablecoins' },
            { title: 'Lending & Borrowing', path: '/building-blocks/lending-borrowing' },
            { title: 'Liquidations', path: '/building-blocks/liquidations' },
            { title: 'Perpetual Futures', path: '/building-blocks/perpetual-futures' },
            { title: 'Derivatives', path: '/building-blocks/derivatives' },
            { title: 'Oracles', path: '/building-blocks/oracles' },
            { title: 'Bridges', path: '/building-blocks/bridges' },
            { title: 'Governance', path: '/building-blocks/governance' },
            { title: 'MEV Overview', path: '/building-blocks/mev-overview' },
          ],
        },
        {
          title: 'Protocol Deep Dives',
          isOpened: false,
          children: [
            { title: 'AMMs In Depth', path: '/protocols/amms-depth' },
            { title: 'Concentrated Liquidity', path: '/protocols/concentrated-liquidity' },
            { title: 'Stablecoin Designs', path: '/protocols/stablecoin-designs' },
            { title: 'Lending Architecture', path: '/protocols/lending-architecture' },
            { title: 'Perp DEX', path: '/protocols/perp-dex' },
            { title: 'Oracle Designs', path: '/protocols/oracle-designs' },
            { title: 'Bridges & Cross-Chain', path: '/protocols/bridges' },
            { title: 'Staking & Restaking', path: '/protocols/staking-restaking' },
          ],
        },
        {
          title: 'On-Chain Microstructure',
          isOpened: false,
          children: [
            { title: 'Gas & Mempool', path: '/microstructure/gas-mempool' },
            { title: 'On-Chain vs Off-Chain', path: '/microstructure/onchain-offchain' },
            { title: 'MEV Formally', path: '/microstructure/mev-formal' },
          ],
        },
        {
          title: 'MEV & Transaction Ordering',
          isOpened: false,
          children: [
            { title: 'Transaction Ordering & MEV', path: '/transaction-ordering-mev' },
            { title: 'How Blocks Form', path: '/transaction-ordering-mev/how-blocks-form' },
            { title: 'The Economics of Ordering', path: '/transaction-ordering-mev/ordering-economics' },
            { title: 'MEV Taxonomy', path: '/transaction-ordering-mev/mev-taxonomy' },
            { title: 'Quantitative Impacts', path: '/transaction-ordering-mev/quantitative-impacts' },
            { title: 'Statistical Modeling', path: '/transaction-ordering-mev/statistical-modeling' },
            { title: 'Mitigation & Defenses', path: '/transaction-ordering-mev/mitigation-and-defenses' },
            { title: 'MEV Beyond EVMs', path: '/transaction-ordering-mev/mev-beyond-evms' },
          ],
        },
        {
          title: 'Execution Environments',
          isOpened: false,
          children: [
            { title: 'Execution Environments', path: '/blockchain-execution-environments' },
            { title: 'EVM', path: '/blockchain-execution-environments/evm' },
            { title: 'Solana SVM', path: '/blockchain-execution-environments/solana-svm' },
            { title: 'Move VM', path: '/blockchain-execution-environments/move-vm' },
            { title: 'Comparative Benchmarks', path: '/blockchain-execution-environments/comparative-benchmarks' },
            { title: 'Quant Engineering', path: '/blockchain-execution-environments/quant-engineering' },
            { title: 'Advanced Topics', path: '/advanced-topics' },
          ],
        },
        {
          title: 'On-Chain Data',
          isOpened: false,
          children: [
            { title: 'Event Logs', path: '/data-tooling/event-logs' },
            { title: 'RPC Nodes', path: '/data-tooling/rpc-nodes' },
            { title: 'The Graph', path: '/data-tooling/the-graph' },
            { title: 'Dune Analytics', path: '/data-tooling/dune-analytics' },
            { title: 'Wallet Analytics', path: '/data-tooling/wallet-analytics' },
            { title: 'On-Chain Data in Backtests', path: '/simulation/onchain-data' },
          ],
        },
        {
          title: 'On-Chain Signals & Strategies',
          isOpened: false,
          children: [
            { title: 'On-Chain Activity', path: '/signals/onchain-activity' },
            { title: 'LP Business', path: '/strategies/lp-business' },
            { title: 'Yield Farming', path: '/strategies/yield-farming' },
            { title: 'Concentrated LP', path: '/strategies/concentrated-lp' },
            { title: 'Delta-Hedged LP', path: '/strategies/delta-hedged-lp' },
            { title: 'Hedging LP', path: '/strategies/hedging-lp' },
            { title: 'Funding Trends', path: '/strategies/funding-trends' },
          ],
        },
        {
          title: 'On-Chain Risk & Simulation',
          isOpened: false,
          children: [
            { title: 'Smart Contract Risk', path: '/risk/smart-contract' },
            { title: 'Oracle Manipulation', path: '/risk/oracle-manipulation' },
            { title: 'Slippage & Frontrunning', path: '/risk/slippage-frontrunning' },
            { title: 'LP Returns', path: '/simulation/lp-returns' },
            { title: 'Liquidations', path: '/simulation/liquidations' },
          ],
        },
      ],
    },
    {
      title: 'Case Studies & Research',
      isOpened: false,
      children: [
        { title: 'RSI Walkthrough', path: '/case-studies/rsi-walkthrough' },
        { title: 'Failed Strategy', path: '/case-studies/failed-strategy' },
        { title: 'Post-Mortem', path: '/case-studies/post-mortem' },
        { title: 'LP Volatility', path: '/case-studies/lp-volatility' },
        { title: 'Uniswap v3 LP', path: '/case-studies/uniswap-v3-lp' },
        { title: 'Curve Arbitrage', path: '/case-studies/curve-arb' },
        { title: 'Flash Loan Case', path: '/case-studies/flash-loan' },
        { title: 'Oracle Incident', path: '/case-studies/oracle-incident' },
        { title: 'Basis Unwind', path: '/case-studies/basis-unwind' },
        { title: 'Funding Rate', path: '/case-studies/funding-rate' },
      ],
    },
    {
      title: 'Reference & Indexes',
      isOpened: false,
      children: [
        { title: 'Glossary', path: '/reference/glossary' },
        { title: 'Notation', path: '/reference/notation' },
        { title: 'Formulas', path: '/reference/formulas' },
        { title: 'Formula Cheatsheet', path: '/reference/formula-cheatsheet' },
        { title: 'Metric Index', path: '/reference/metric-index' },
        { title: 'Indicators', path: '/reference/indicators' },
        { title: 'Code Snippets', path: '/reference/code-snippets' },
        { title: 'Protocols', path: '/reference/protocols' },
        { title: 'Protocol Index', path: '/reference/protocol-index' },
        { title: 'Resources', path: '/reference/resources' },
      ],
    },
    {
      title: 'Contributing & Meta',
      isOpened: false,
      children: [
        { title: 'How To Contribute', path: '/contributing/how-to-contribute' },
        { title: 'Content Guidelines', path: '/contributing/content-guidelines' },
        { title: 'Style', path: '/contributing/style' },
        { title: 'New Page', path: '/contributing/new-page' },
        { title: 'Checklist', path: '/contributing/checklist' },
        { title: 'Code Examples', path: '/contributing/code-examples' },
        { title: 'Notebook Standards', path: '/contributing/notebook-standards' },
        { title: 'Pipeline', path: '/contributing/pipeline' },
        { title: 'Review Process', path: '/contributing/review-process' },
        { title: 'Roadmap', path: '/contributing/roadmap' },
        { title: 'Community', path: '/contributing/community' },
      ],
    },
    {
      title: 'Search',
      path: '/search',
    },
  ];

  /** Matches the 250ms open/close animation on the sub-nav. */
  private static readonly EXPAND_ANIMATION_MS = 250;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((ev) => ev instanceof NavigationEnd))
      .subscribe(() => this.onNavigationEnd());

    this.toggleCategory();
  }

  /**
   * Navigating collapses the previously open section and expands another, which
   * changes the scroller's content height. The browser then clamps scrollTop and
   * the sidebar visibly jumps. Hold the scroll position across that reflow, and
   * only move it if the active link genuinely ended up off-screen.
   */
  private onNavigationEnd() {
    const scroller = this.getScroller();
    const previousScrollTop = scroller ? scroller.scrollTop : 0;

    this.toggleCategory();

    if (!scroller) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = previousScrollTop;
        // Re-apply once the expand animation has settled, then reveal if needed.
        setTimeout(() => {
          scroller.scrollTop = previousScrollTop;
          this.revealActiveLink(scroller);
        }, MenuComponent.EXPAND_ANIMATION_MS + 30);
      });
    });
  }

  private getScroller(): HTMLElement | null {
    return this.host.nativeElement.querySelector('.menu-content');
  }

  private revealActiveLink(scroller: HTMLElement) {
    const active = scroller.querySelector<HTMLElement>('a.active');
    if (!active) {
      return;
    }

    const linkTop = active.offsetTop;
    const linkBottom = linkTop + active.offsetHeight;
    const viewTop = scroller.scrollTop;
    const viewBottom = viewTop + scroller.clientHeight;

    // Already visible: leave the scroll exactly where the reader left it.
    if (linkTop >= viewTop && linkBottom <= viewBottom) {
      return;
    }

    scroller.scrollTop = Math.max(0, linkTop - scroller.clientHeight / 3);
  }

  // Open only the branches containing the active page; sections now share URL
  // prefixes (e.g. /quant-math), so prefix matching would open several at once.
  toggleCategory() {
    const url = this.router.url.split('?')[0];
    if (url === '/') {
      return;
    }

    const markOpen = (item: MenuItem): boolean => {
      const selfMatches = item.path === url;
      const childMatches = (item.children ?? []).some((child) => markOpen(child));
      item.isOpened = selfMatches || childMatches;
      return item.isOpened;
    };

    this.items.forEach((item) => markOpen(item));
  }

  trackByTitle(index: number, item: MenuItem): string {
    return item.title;
  }
}
