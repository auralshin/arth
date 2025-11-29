import {
  Component,
  HostBinding,
  Input,
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
    console.log('MenuComponent - isSidebarOpened setter called:', value);
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
      title: 'Welcome',
      isOpened: false,
      children: [
        { title: 'How To Navigate', path: '/welcome/how-to-navigate' },
        { title: 'Reading Paths', path: '/welcome/reading-paths' },
        { title: 'Notation Conventions', path: '/welcome/notation-conventions' },
        { title: 'Risk Reality Check', path: '/welcome/risk-reality-check' },
        { title: 'Prerequisites', path: '/welcome/prerequisites' },
        { title: 'What Is DeFi', path: '/welcome/what-is-defi' },
        { title: 'Why This Matters', path: '/welcome/why-this-matters' },
      ],
    },
    {
      title: 'Start Here',
      isOpened: false,
      children: [
        { title: 'How to Read Arth', path: '/start-here/how-to-read' },
        { title: 'Day in the Life', path: '/start-here/day-in-life' },
        { title: 'TradFi To DeFi', path: '/start-here/tradfi-to-defi' },
        { title: 'What "On-Chain" Means', path: '/start-here/on-chain-meaning' },
        { title: 'Tokens & Addresses', path: '/start-here/tokens-addresses' },
        { title: 'Use Cases', path: '/start-here/use-cases' },
        { title: 'Where People Lose Money', path: '/start-here/losing-money' },
        { title: 'Trading Foundations', path: '/trading-foundations' },
      ],
    },
    {
      title: 'DeFi & Protocol Foundations',
      isOpened: false,
      children: [
        {
          title: 'Tokens & Representations',
          isOpened: false,
          children: [
            { title: 'Tokens 101', path: '/building-blocks/tokens-101' },
            { title: 'Token Standards', path: '/building-blocks/token-standards' },
            { title: 'ERC-20', path: '/building-blocks/erc20' },
            { title: 'Tokenomics', path: '/building-blocks/tokenomics' },
          ],
        },
        {
          title: 'Liquidity & Trading',
          isOpened: false,
          children: [
            { title: 'Liquidity Pools', path: '/building-blocks/liquidity-pools' },
            { title: 'AMMs 101', path: '/building-blocks/amms-101' },
            { title: 'AMMs In Depth', path: '/protocols/amms-depth' },
            { title: 'Concentrated Liquidity', path: '/protocols/concentrated-liquidity' },
            { title: 'Swaps & DEXs', path: '/building-blocks/swaps-dexs' },
            { title: 'Yield Farming', path: '/building-blocks/yield-farming' },
          ],
        },
        {
          title: 'Money, Credit & Derivatives',
          isOpened: false,
          children: [
            { title: 'Stablecoins', path: '/building-blocks/stablecoins' },
            { title: 'Stablecoin Designs', path: '/protocols/stablecoin-designs' },
            { title: 'Lending & Borrowing', path: '/building-blocks/lending-borrowing' },
            { title: 'Lending Architecture', path: '/protocols/lending-architecture' },
            { title: 'Liquidations', path: '/building-blocks/liquidations' },
            { title: 'Perpetual Futures', path: '/building-blocks/perpetual-futures' },
            { title: 'Perp DEX', path: '/protocols/perp-dex' },
            { title: 'Derivatives', path: '/building-blocks/derivatives' },
          ],
        },
        {
          title: 'Infrastructure & Control',
          isOpened: false,
          children: [
            { title: 'Oracles', path: '/building-blocks/oracles' },
            { title: 'Oracle Designs', path: '/protocols/oracle-designs' },
            { title: 'Bridges (Primitives)', path: '/building-blocks/bridges' },
            { title: 'Bridges & Cross-Chain', path: '/protocols/bridges' },
            { title: 'MEV Overview', path: '/building-blocks/mev-overview' },
            { title: 'Governance', path: '/building-blocks/governance' },
            { title: 'Staking & Restaking', path: '/protocols/staking-restaking' },
          ],
        },
      ],
    },
    {
      title: 'Quant & Portfolio',
      isOpened: false,
      children: [
        { title: 'Random Variables', path: '/quant-math/random-variables' },
        { title: 'Expectation & Variance', path: '/quant-math/expectation-variance' },
        { title: 'Covariance', path: '/quant-math/covariance' },
        { title: 'LLN & CLT', path: '/quant-math/lln-clt' },
        { title: 'Sampling', path: '/quant-math/sampling' },
        { title: 'Returns', path: '/quant-math/returns' },
        { title: 'Volatility', path: '/quant-math/volatility' },
        { title: 'Autocorrelation', path: '/quant-math/autocorrelation' },
        { title: 'Stationarity', path: '/quant-math/stationarity' },
        { title: 'Rolling Windows', path: '/quant-math/rolling-windows' },
        { title: 'Sharpe Ratio', path: '/quant-math/sharpe' },
        { title: 'Sortino Ratio', path: '/quant-math/sortino' },
        { title: 'Drawdown', path: '/quant-math/drawdown' },
        { title: 'VaR & CVaR', path: '/quant-math/var-cvar' },
        { title: 'Kelly Criterion', path: '/quant-math/kelly' },
        { title: 'Optimization', path: '/quant-math/optimization' },
        { title: 'Mean-Variance', path: '/quant-math/mean-variance' },
        { title: 'Position Sizing', path: '/quant-math/position-sizing' },
        { title: 'Rebalancing', path: '/quant-math/rebalancing' },
        { title: 'Random Walks', path: '/quant-math/random-walks' },
        { title: 'Geometric Brownian Motion', path: '/quant-math/gbm' },
        { title: 'Mean Reversion', path: '/quant-math/mean-reversion' },
        { title: 'Jump Processes', path: '/quant-math/jumps' },
      ],
    },
    {
      title: 'Microstructure & MEV',
      isOpened: false,
      children: [
        { title: 'Orderbooks vs AMMs', path: '/microstructure/orderbooks-vs-amms' },
        { title: 'Slippage', path: '/microstructure/slippage' },
        { title: 'Fees & Routing', path: '/microstructure/fees-routing' },
        { title: 'Gas & Mempool', path: '/microstructure/gas-mempool' },
        { title: 'MEV Formally', path: '/microstructure/mev-formal' },
        { title: 'On-Chain vs Off-Chain', path: '/microstructure/onchain-offchain' },
        { title: 'Latency Risk', path: '/microstructure/latency-risk' },
        { title: 'Transaction Ordering & MEV', path: '/transaction-ordering-mev' },
        { title: 'How Blocks Form', path: '/transaction-ordering-mev/how-blocks-form' },
        { title: 'MEV Beyond EVMs', path: '/transaction-ordering-mev/mev-beyond-evms' },
        { title: 'MEV Taxonomy', path: '/transaction-ordering-mev/mev-taxonomy' },
        { title: 'Mitigation & Defenses', path: '/transaction-ordering-mev/mitigation-and-defenses' },
        { title: 'Quantitative Impacts', path: '/transaction-ordering-mev/quantitative-impacts' },
        { title: 'Statistical Modeling', path: '/transaction-ordering-mev/statistical-modeling' },
      ],
    },
    {
      title: 'Data & Tooling',
      isOpened: false,
      children: [
        { title: 'Data Sources', path: '/data-tooling/data-sources' },
        { title: 'Time Series', path: '/data-tooling/time-series' },
        { title: 'Cleaning', path: '/data-tooling/cleaning' },
        { title: 'Event Logs', path: '/data-tooling/event-logs' },
        { title: 'Pipeline', path: '/data-tooling/pipeline' },
        { title: 'Python', path: '/data-tooling/python' },
        { title: 'TypeScript', path: '/data-tooling/typescript' },
        { title: 'Reproducible Research', path: '/data-tooling/reproducible' },
        { title: 'Dashboards', path: '/data-tooling/dashboards' },
        { title: 'Dune Analytics', path: '/data-tooling/dune-analytics' },
        { title: 'Notebooks', path: '/data-tooling/notebooks' },
        { title: 'Python Setup', path: '/data-tooling/python-setup' },
        { title: 'RPC Nodes', path: '/data-tooling/rpc-nodes' },
        { title: 'The Graph', path: '/data-tooling/the-graph' },
        { title: 'Wallet Analytics', path: '/data-tooling/wallet-analytics' },
        { title: 'Tooling & Simulation Ecosystem', path: '/tooling-simulation-ecosystem' },
      ],
    },
    {
      title: 'Simulation',
      isOpened: false,
      children: [
        { title: 'Why Backtest', path: '/simulation/why-backtest' },
        { title: 'Event-Driven', path: '/simulation/event-driven' },
        { title: 'Building a Backtester', path: '/simulation/building-backtester' },
        { title: 'Data Preparation', path: '/simulation/data-prep' },
        { title: 'Metrics', path: '/simulation/metrics' },
        { title: 'Scenarios', path: '/simulation/scenarios' },
        { title: 'Agent-Based', path: '/simulation/agent-based' },
        { title: 'Orderbook Simulation', path: '/simulation/orderbook' },
        { title: 'LP Returns', path: '/simulation/lp-returns' },
        { title: 'Liquidations', path: '/simulation/liquidations' },
        { title: 'Parameter Sweeps', path: '/simulation/param-sweeps' },
        { title: 'Backtesting in Python', path: '/simulation/python' },
        { title: 'Backtesting in TypeScript', path: '/simulation/typescript' },
        { title: 'On-Chain Data', path: '/simulation/onchain-data' },
        { title: 'Building Simulations', path: '/building-simulations' },
        { title: 'Agent-Based Simulation', path: '/building-simulations/agent-based-simulation' },
        { title: 'Backtesting Framework', path: '/building-simulations/backtesting-framework' },
        { title: 'Data Pipeline Replay', path: '/building-simulations/data-pipeline-replay' },
        { title: 'Event-Driven Architecture', path: '/building-simulations/event-driven-architecture' },
        { title: 'Performance Optimization', path: '/building-simulations/performance-optimization' },
      ],
    },
    {
      title: 'Signals',
      isOpened: false,
      children: [
        { title: 'What Is a Signal?', path: '/signals/what-is-signal' },
        { title: 'Momentum vs Mean Reversion', path: '/signals/momentum-vs-mean-reversion' },
        { title: 'Moving Averages', path: '/signals/moving-averages' },
        { title: 'MA Crossovers', path: '/signals/ma-crossovers' },
        { title: 'RSI', path: '/signals/rsi' },
        { title: 'MACD', path: '/signals/macd' },
        { title: 'Bollinger Bands', path: '/signals/bollinger' },
        { title: 'ATR', path: '/signals/atr' },
        { title: 'OBV', path: '/signals/obv' },
        { title: 'Stochastic Oscillator', path: '/signals/stochastic' },
        { title: 'Volume', path: '/signals/volume' },
        { title: 'Funding Rate', path: '/signals/funding-rate' },
        { title: 'Open Interest', path: '/signals/open-interest' },
        { title: 'Liquidity', path: '/signals/liquidity' },
        { title: 'Basis', path: '/signals/basis' },
        { title: 'On-Chain Activity', path: '/signals/onchain-activity' },
      ],
    },
    {
      title: 'Strategies',
      isOpened: false,
      children: [
        { title: 'How To Read Strategies', path: '/strategies/how-to-read' },
        { title: 'Buy & Hold', path: '/strategies/buy-hold' },
        { title: 'LP Business', path: '/strategies/lp-business' },
        { title: 'Yield Farming', path: '/strategies/yield-farming' },
        { title: 'Concentrated LP', path: '/strategies/concentrated-lp' },
        { title: 'Delta-Hedged LP', path: '/strategies/delta-hedged-lp' },
        { title: 'Momentum', path: '/strategies/momentum' },
        { title: 'RSI Strategy', path: '/strategies/rsi-strategy' },
        { title: 'MACD Strategy', path: '/strategies/macd-strategy' },
        { title: 'Funding Trends', path: '/strategies/funding-trends' },
        { title: 'Cash & Carry', path: '/strategies/cash-carry' },
        { title: 'Delta-Neutral', path: '/strategies/delta-neutral' },
        { title: 'Pairs Trading', path: '/strategies/pairs' },
        { title: 'Market Making Lite', path: '/strategies/mm-lite' },
        { title: 'Stop-Loss', path: '/strategies/stop-loss' },
        { title: 'Dynamic Sizing', path: '/strategies/dynamic-sizing' },
        { title: 'Hedging LP', path: '/strategies/hedging-lp' },
      ],
    },
    {
      title: 'Risk',
      isOpened: false,
      children: [
        { title: 'Types of Risk', path: '/risk/types' },
        { title: 'Smart Contract Risk', path: '/risk/smart-contract' },
        { title: 'Oracle Manipulation', path: '/risk/oracle-manipulation' },
        { title: 'Leverage & Liquidation', path: '/risk/leverage-liquidation' },
        { title: 'Slippage & Frontrunning', path: '/risk/slippage-frontrunning' },
        { title: 'Backtest vs Live', path: '/risk/backtest-vs-live' },
        { title: 'Operational Risk', path: '/risk/operational' },
        { title: 'Risk Checklists', path: '/risk/checklists' },
      ],
    },
    {
      title: 'Case Studies & Research',
      isOpened: false,
      children: [
        { title: 'RSI Walkthrough', path: '/case-studies/rsi-walkthrough' },
        { title: 'LP Volatility', path: '/case-studies/lp-volatility' },
        { title: 'Failed Strategy', path: '/case-studies/failed-strategy' },
        { title: 'Oracle Incident', path: '/case-studies/oracle-incident' },
        { title: 'Basis Unwind', path: '/case-studies/basis-unwind' },
        { title: 'Curve Arbitrage', path: '/case-studies/curve-arb' },
        { title: 'Flash Loan Case', path: '/case-studies/flash-loan' },
        { title: 'Funding Rate', path: '/case-studies/funding-rate' },
        { title: 'Post-Mortem', path: '/case-studies/post-mortem' },
        { title: 'Uniswap v3 LP', path: '/case-studies/uniswap-v3-lp' },
      ],
    },
    {
      title: 'Infrastructure & Execution',
      isOpened: false,
      children: [
        { title: 'Execution Environments', path: '/blockchain-execution-environments' },
        { title: 'Comparative Benchmarks', path: '/blockchain-execution-environments/comparative-benchmarks' },
        { title: 'EVM', path: '/blockchain-execution-environments/evm' },
        { title: 'Move VM', path: '/blockchain-execution-environments/move-vm' },
        { title: 'Quant Engineering', path: '/blockchain-execution-environments/quant-engineering' },
        { title: 'Solana SVM', path: '/blockchain-execution-environments/solana-svm' },
        { title: 'Advanced Topics', path: '/advanced-topics' },
      ],
    },
    {
      title: 'Reference & Indexes',
      isOpened: false,
      children: [
        { title: 'Glossary', path: '/reference/glossary' },
        { title: 'Indicators', path: '/reference/indicators' },
        { title: 'Formulas', path: '/reference/formulas' },
        { title: 'Protocols', path: '/reference/protocols' },
        { title: 'Notation', path: '/reference/notation' },
        { title: 'Code Snippets', path: '/reference/code-snippets' },
        { title: 'Formula Cheatsheet', path: '/reference/formula-cheatsheet' },
        { title: 'Metric Index', path: '/reference/metric-index' },
        { title: 'Protocol Index', path: '/reference/protocol-index' },
        { title: 'Resources', path: '/reference/resources' },
      ],
    },
    {
      title: 'Contributing & Meta',
      isOpened: false,
      children: [
        { title: 'Style', path: '/contributing/style' },
        { title: 'Pipeline', path: '/contributing/pipeline' },
        { title: 'New Page', path: '/contributing/new-page' },
        { title: 'Checklist', path: '/contributing/checklist' },
        { title: 'Roadmap', path: '/contributing/roadmap' },
        { title: 'Code Examples', path: '/contributing/code-examples' },
        { title: 'Community', path: '/contributing/community' },
        { title: 'Content Guidelines', path: '/contributing/content-guidelines' },
        { title: 'How To Contribute', path: '/contributing/how-to-contribute' },
        { title: 'Notebook Standards', path: '/contributing/notebook-standards' },
        { title: 'Review Process', path: '/contributing/review-process' },
      ],
    },
    {
      title: 'Search',
      path: '/search',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    console.log('MenuComponent ngOnInit - items count:', this.items.length);
    console.log('MenuComponent ngOnInit - isSidebarOpened:', this.isSidebarOpened);
    console.log(
      'MenuComponent ngOnInit - HostBinding will apply class.opened:',
      this.isSidebarOpened,
    );

    this.router.events
      .pipe(filter((ev) => ev instanceof NavigationEnd))
      .subscribe(() => this.toggleCategory());

    this.toggleCategory();
  }

  // Recursively open the category whose descendants contain the current route prefix
  toggleCategory() {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(Boolean);
    if (!segments.length) {
      return;
    }
    const base = `/${segments[0]}`;

    const markOpen = (item: MenuItem): boolean => {
      const selfMatches = !!item.path && item.path.startsWith(base);
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
