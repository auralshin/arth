import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocialWrapperComponent } from './common/social-wrapper/social-wrapper.component';
import { FooterComponent } from './homepage/footer/footer.component';
import { HeaderComponent } from './homepage/header/header.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MenuItemComponent } from './homepage/menu/menu-item/menu-item.component';
import { MenuComponent } from './homepage/menu/menu.component';
import { IntroductionComponent } from './homepage/pages/introduction/introduction.component';
import { BasePageComponent } from '@base-page';
import { SharedModule } from './shared/shared.module';
import { HowToNavigateComponent } from './homepage/pages/welcome/how-to-navigate/how-to-navigate.component';
import { ReadingPathsComponent as WelcomeReadingPathsComponent } from './homepage/pages/welcome/reading-paths/reading-paths.component';
import { NotationConventionsComponent } from './homepage/pages/welcome/notation-conventions/notation-conventions.component';
import { RiskRealityCheckComponent } from './homepage/pages/welcome/risk-reality-check/risk-reality-check.component';
import { DayInLifeComponent } from './homepage/pages/start-here/day-in-life/day-in-life.component';
import { TradfiToDeFiComponent } from './homepage/pages/start-here/tradfi-to-defi/tradfi-to-defi.component';
import { OnChainMeaningComponent } from './homepage/pages/start-here/on-chain-meaning/on-chain-meaning.component';
import { TokensAddressesComponent } from './homepage/pages/start-here/tokens-addresses/tokens-addresses.component';
import { UseCasesComponent } from './homepage/pages/start-here/use-cases/use-cases.component';
import { LosingMoneyComponent } from './homepage/pages/start-here/losing-money/losing-money.component';
import { HowToReadComponent as StartHereHowToReadComponent } from './homepage/pages/start-here/how-to-read/how-to-read.component';
import { Tokens101Component } from './homepage/pages/building-blocks/tokens-101/tokens-101.component';
import { Erc20Component } from './homepage/pages/building-blocks/erc20/erc20.component';
import { SwapsDexsComponent } from './homepage/pages/building-blocks/swaps-dexs/swaps-dexs.component';
import { Amms101Component } from './homepage/pages/building-blocks/amms-101/amms-101.component';
import { ImpermanentLossComponent } from './homepage/pages/building-blocks/impermanent-loss/impermanent-loss.component';
import { LendingBorrowingComponent as BuildingBlocksLendingBorrowingComponent } from './homepage/pages/building-blocks/lending-borrowing/lending-borrowing.component';
import { StablecoinsComponent } from './homepage/pages/building-blocks/stablecoins/stablecoins.component';
import { OraclesComponent } from './homepage/pages/building-blocks/oracles/oracles.component';
import { PerpetualFuturesComponent } from './homepage/pages/building-blocks/perpetual-futures/perpetual-futures.component';
import { LiquidationsComponent as BuildingBlocksLiquidationsComponent } from './homepage/pages/building-blocks/liquidations/liquidations.component';
import { GovernanceComponent } from './homepage/pages/building-blocks/governance/governance.component';
import { MevOverviewComponent } from './homepage/pages/building-blocks/mev-overview/mev-overview.component';
import { AmmsDepthComponent } from './homepage/pages/protocols/amms-depth/amms-depth.component';
import { ConcentratedLiquidityComponent } from './homepage/pages/protocols/concentrated-liquidity/concentrated-liquidity.component';
import { LendingArchitectureComponent } from './homepage/pages/protocols/lending-architecture/lending-architecture.component';
import { StablecoinDesignsComponent } from './homepage/pages/protocols/stablecoin-designs/stablecoin-designs.component';
import { StakingRestakingComponent as ProtocolsStakingRestakingComponent } from './homepage/pages/protocols/staking-restaking/staking-restaking.component';
import { PerpDexComponent } from './homepage/pages/protocols/perp-dex/perp-dex.component';
import { BridgesComponent as ProtocolsBridgesComponent } from './homepage/pages/protocols/bridges/bridges.component';
import { OracleDesignsComponent } from './homepage/pages/protocols/oracle-designs/oracle-designs.component';
import { OrderbooksVsAmmsComponent } from './homepage/pages/microstructure/orderbooks-vs-amms/orderbooks-vs-amms.component';
import { SlippageComponent as MicrostructureSlippageComponent } from './homepage/pages/microstructure/slippage/slippage.component';
import { FeesRoutingComponent } from './homepage/pages/microstructure/fees-routing/fees-routing.component';
import { GasMempoolComponent } from './homepage/pages/microstructure/gas-mempool/gas-mempool.component';
import { MevFormalComponent } from './homepage/pages/microstructure/mev-formal/mev-formal.component';
import { OnchainOffchainComponent } from './homepage/pages/microstructure/onchain-offchain/onchain-offchain.component';
import { LatencyRiskComponent } from './homepage/pages/microstructure/latency-risk/latency-risk.component';
import { DataSourcesComponent } from './homepage/pages/data-tooling/data-sources/data-sources.component';
import { TimeSeriesComponent } from './homepage/pages/data-tooling/time-series/time-series.component';
import { CleaningComponent } from './homepage/pages/data-tooling/cleaning/cleaning.component';
import { EventLogsComponent } from './homepage/pages/data-tooling/event-logs/event-logs.component';
import { PipelineComponent as DataToolingPipelineComponent } from './homepage/pages/data-tooling/pipeline/pipeline.component';
import { PythonComponent as DataToolingPythonComponent } from './homepage/pages/data-tooling/python/python.component';
import { TypescriptComponent as DataToolingTypescriptComponent } from './homepage/pages/data-tooling/typescript/typescript.component';
import { ReproducibleComponent } from './homepage/pages/data-tooling/reproducible/reproducible.component';
import { RandomVariablesComponent } from './homepage/pages/quant-math/random-variables/random-variables.component';
import { ExpectationVarianceComponent } from './homepage/pages/quant-math/expectation-variance/expectation-variance.component';
import { CovarianceComponent } from './homepage/pages/quant-math/covariance/covariance.component';
import { LlnCltComponent } from './homepage/pages/quant-math/lln-clt/lln-clt.component';
import { SamplingComponent } from './homepage/pages/quant-math/sampling/sampling.component';
import { ReturnsComponent } from './homepage/pages/quant-math/returns/returns.component';
import { VolatilityComponent } from './homepage/pages/quant-math/volatility/volatility.component';
import { AutocorrelationComponent } from './homepage/pages/quant-math/autocorrelation/autocorrelation.component';
import { StationarityComponent } from './homepage/pages/quant-math/stationarity/stationarity.component';
import { RollingWindowsComponent } from './homepage/pages/quant-math/rolling-windows/rolling-windows.component';
import { SharpeComponent } from './homepage/pages/quant-math/sharpe/sharpe.component';
import { SortinoComponent } from './homepage/pages/quant-math/sortino/sortino.component';
import { DrawdownComponent } from './homepage/pages/quant-math/drawdown/drawdown.component';
import { VarCvarComponent } from './homepage/pages/quant-math/var-cvar/var-cvar.component';
import { KellyComponent } from './homepage/pages/quant-math/kelly/kelly.component';
import { OptimizationComponent } from './homepage/pages/quant-math/optimization/optimization.component';
import { MeanVarianceComponent } from './homepage/pages/quant-math/mean-variance/mean-variance.component';
import { PositionSizingComponent as QuantMathPositionSizingComponent } from './homepage/pages/quant-math/position-sizing/position-sizing.component';
import { RebalancingComponent } from './homepage/pages/quant-math/rebalancing/rebalancing.component';
import { RandomWalksComponent } from './homepage/pages/quant-math/random-walks/random-walks.component';
import { GbmComponent } from './homepage/pages/quant-math/gbm/gbm.component';
import { MeanReversionComponent } from './homepage/pages/quant-math/mean-reversion/mean-reversion.component';
import { JumpsComponent } from './homepage/pages/quant-math/jumps/jumps.component';
import { WhatIsSignalComponent } from './homepage/pages/signals/what-is-signal/what-is-signal.component';
import { MomentumVsMeanReversionComponent } from './homepage/pages/signals/momentum-vs-mean-reversion/momentum-vs-mean-reversion.component';
import { MovingAveragesComponent as SignalsMovingAveragesComponent } from './homepage/pages/signals/moving-averages/moving-averages.component';
import { MaCrossoversComponent } from './homepage/pages/signals/ma-crossovers/ma-crossovers.component';
import { RsiComponent as SignalsRsiComponent } from './homepage/pages/signals/rsi/rsi.component';
import { MacdComponent as SignalsMacdComponent } from './homepage/pages/signals/macd/macd.component';
import { BollingerComponent } from './homepage/pages/signals/bollinger/bollinger.component';
import { AtrComponent as SignalsAtrComponent } from './homepage/pages/signals/atr/atr.component';
import { ObvComponent } from './homepage/pages/signals/obv/obv.component';
import { StochasticComponent as SignalsStochasticComponent } from './homepage/pages/signals/stochastic/stochastic.component';
import { VolumeComponent } from './homepage/pages/signals/volume/volume.component';
import { FundingRateComponent as SignalsFundingRateComponent } from './homepage/pages/signals/funding-rate/funding-rate.component';
import { OpenInterestComponent as SignalsOpenInterestComponent } from './homepage/pages/signals/open-interest/open-interest.component';
import { LiquidityComponent } from './homepage/pages/signals/liquidity/liquidity.component';
import { BasisComponent } from './homepage/pages/signals/basis/basis.component';
import { OnchainActivityComponent } from './homepage/pages/signals/onchain-activity/onchain-activity.component';
import { HowToReadComponent as StrategiesHowToReadComponent } from './homepage/pages/strategies/how-to-read/how-to-read.component';
import { BuyHoldComponent } from './homepage/pages/strategies/buy-hold/buy-hold.component';
import { LpBusinessComponent } from './homepage/pages/strategies/lp-business/lp-business.component';
import { YieldFarmingComponent as StrategiesYieldFarmingComponent } from './homepage/pages/strategies/yield-farming/yield-farming.component';
import { ConcentratedLpComponent } from './homepage/pages/strategies/concentrated-lp/concentrated-lp.component';
import { DeltaHedgedLpComponent } from './homepage/pages/strategies/delta-hedged-lp/delta-hedged-lp.component';
import { MomentumComponent as StrategiesMomentumComponent } from './homepage/pages/strategies/momentum/momentum.component';
import { RsiStrategyComponent } from './homepage/pages/strategies/rsi-strategy/rsi-strategy.component';
import { MacdStrategyComponent } from './homepage/pages/strategies/macd-strategy/macd-strategy.component';
import { FundingTrendsComponent } from './homepage/pages/strategies/funding-trends/funding-trends.component';
import { CashCarryComponent } from './homepage/pages/strategies/cash-carry/cash-carry.component';
import { DeltaNeutralComponent as StrategiesDeltaNeutralComponent } from './homepage/pages/strategies/delta-neutral/delta-neutral.component';
import { PairsComponent } from './homepage/pages/strategies/pairs/pairs.component';
import { MmLiteComponent } from './homepage/pages/strategies/mm-lite/mm-lite.component';
import { StopLossComponent as StrategiesStopLossComponent } from './homepage/pages/strategies/stop-loss/stop-loss.component';
import { DynamicSizingComponent } from './homepage/pages/strategies/dynamic-sizing/dynamic-sizing.component';
import { HedgingLpComponent } from './homepage/pages/strategies/hedging-lp/hedging-lp.component';
import { WhyBacktestComponent } from './homepage/pages/simulation/why-backtest/why-backtest.component';
import { EventDrivenComponent } from './homepage/pages/simulation/event-driven/event-driven.component';
import { BuildingBacktesterComponent } from './homepage/pages/simulation/building-backtester/building-backtester.component';
import { DataPrepComponent } from './homepage/pages/simulation/data-prep/data-prep.component';
import { MetricsComponent } from './homepage/pages/simulation/metrics/metrics.component';
import { ScenariosComponent } from './homepage/pages/simulation/scenarios/scenarios.component';
import { AgentBasedComponent } from './homepage/pages/simulation/agent-based/agent-based.component';
import { OrderbookComponent } from './homepage/pages/simulation/orderbook/orderbook.component';
import { LpReturnsComponent } from './homepage/pages/simulation/lp-returns/lp-returns.component';
import { LiquidationsComponent as SimulationLiquidationsComponent } from './homepage/pages/simulation/liquidations/liquidations.component';
import { ParamSweepsComponent } from './homepage/pages/simulation/param-sweeps/param-sweeps.component';
import { PythonComponent as SimulationPythonComponent } from './homepage/pages/simulation/python/python.component';
import { TypescriptComponent as SimulationTypescriptComponent } from './homepage/pages/simulation/typescript/typescript.component';
import { OnchainDataComponent } from './homepage/pages/simulation/onchain-data/onchain-data.component';
import { TypesComponent } from './homepage/pages/risk/types/types.component';
import { SmartContractComponent } from './homepage/pages/risk/smart-contract/smart-contract.component';
import { OracleManipulationComponent } from './homepage/pages/risk/oracle-manipulation/oracle-manipulation.component';
import { LeverageLiquidationComponent } from './homepage/pages/risk/leverage-liquidation/leverage-liquidation.component';
import { SlippageFrontrunningComponent } from './homepage/pages/risk/slippage-frontrunning/slippage-frontrunning.component';
import { BacktestVsLiveComponent } from './homepage/pages/risk/backtest-vs-live/backtest-vs-live.component';
import { OperationalComponent } from './homepage/pages/risk/operational/operational.component';
import { ChecklistsComponent } from './homepage/pages/risk/checklists/checklists.component';
import { RsiWalkthroughComponent } from './homepage/pages/case-studies/rsi-walkthrough/rsi-walkthrough.component';
import { LpVolatilityComponent } from './homepage/pages/case-studies/lp-volatility/lp-volatility.component';
import { FailedStrategyComponent } from './homepage/pages/case-studies/failed-strategy/failed-strategy.component';
import { OracleIncidentComponent } from './homepage/pages/case-studies/oracle-incident/oracle-incident.component';
import { BasisUnwindComponent } from './homepage/pages/case-studies/basis-unwind/basis-unwind.component';
import { GlossaryComponent } from './homepage/pages/reference/glossary/glossary.component';
import { IndicatorsComponent } from './homepage/pages/reference/indicators/indicators.component';
import { FormulasComponent } from './homepage/pages/reference/formulas/formulas.component';
import { ProtocolsComponent } from './homepage/pages/reference/protocols/protocols.component';
import { NotationComponent } from './homepage/pages/reference/notation/notation.component';
import { ReadingPathsComponent as ReferenceReadingPathsComponent } from './homepage/pages/reference/reading-paths/reading-paths.component';
import { GuideComponent } from './homepage/pages/contributing/guide/guide.component';
import { StyleComponent } from './homepage/pages/contributing/style/style.component';
import { PipelineComponent as ContributingPipelineComponent } from './homepage/pages/contributing/pipeline/pipeline.component';
import { NewPageComponent } from './homepage/pages/contributing/new-page/new-page.component';
import { ChecklistComponent } from './homepage/pages/contributing/checklist/checklist.component';
import { RoadmapComponent } from './homepage/pages/contributing/roadmap/roadmap.component';
import { AdvancedTopicsComponent } from './homepage/pages/advanced-topics/advanced-topics.component';
import { BlockchainExecutionEnvironmentsComponent } from './homepage/pages/blockchain-execution-environments/blockchain-execution-environments.component';
import { ComparativeBenchmarksComponent } from './homepage/pages/blockchain-execution-environments/comparative-benchmarks/comparative-benchmarks.component';
import { EvmComponent } from './homepage/pages/blockchain-execution-environments/evm/evm.component';
import { MoveVmComponent } from './homepage/pages/blockchain-execution-environments/move-vm/move-vm.component';
import { QuantEngineeringComponent } from './homepage/pages/blockchain-execution-environments/quant-engineering/quant-engineering.component';
import { SolanaSvmComponent } from './homepage/pages/blockchain-execution-environments/solana-svm/solana-svm.component';
import { BridgesComponent as BuildingBlocksBridgesComponent } from './homepage/pages/building-blocks/bridges/bridges.component';
import { DerivativesComponent } from './homepage/pages/building-blocks/derivatives/derivatives.component';
import { LendingComponent } from './homepage/pages/building-blocks/lending/lending.component';
import { LiquidityPoolsComponent } from './homepage/pages/building-blocks/liquidity-pools/liquidity-pools.component';
import { TokenomicsComponent } from './homepage/pages/building-blocks/tokenomics/tokenomics.component';
import { TokenStandardsComponent } from './homepage/pages/building-blocks/token-standards/token-standards.component';
import { YieldFarmingComponent as BuildingBlocksYieldFarmingComponent } from './homepage/pages/building-blocks/yield-farming/yield-farming.component';
import { BuildingSimulationsComponent } from './homepage/pages/building-simulations/building-simulations.component';
import { AgentBasedSimulationComponent } from './homepage/pages/building-simulations/agent-based-simulation/agent-based-simulation.component';
import { BacktestingFrameworkComponent } from './homepage/pages/building-simulations/backtesting-framework/backtesting-framework.component';
import { DataPipelineReplayComponent } from './homepage/pages/building-simulations/data-pipeline-replay/data-pipeline-replay.component';
import { EventDrivenArchitectureComponent } from './homepage/pages/building-simulations/event-driven-architecture/event-driven-architecture.component';
import { PerformanceOptimizationComponent } from './homepage/pages/building-simulations/performance-optimization/performance-optimization.component';
import { CurveArbComponent } from './homepage/pages/case-studies/curve-arb/curve-arb.component';
import { FlashLoanComponent } from './homepage/pages/case-studies/flash-loan/flash-loan.component';
import { FundingRateComponent as CaseStudiesFundingRateComponent } from './homepage/pages/case-studies/funding-rate/funding-rate.component';
import { PostMortemComponent } from './homepage/pages/case-studies/post-mortem/post-mortem.component';
import { UniswapV3LpComponent } from './homepage/pages/case-studies/uniswap-v3-lp/uniswap-v3-lp.component';
import { CodeExamplesComponent } from './homepage/pages/contributing/code-examples/code-examples.component';
import { CommunityComponent } from './homepage/pages/contributing/community/community.component';
import { ContentGuidelinesComponent } from './homepage/pages/contributing/content-guidelines/content-guidelines.component';
import { HowToContributeComponent } from './homepage/pages/contributing/how-to-contribute/how-to-contribute.component';
import { NotebookStandardsComponent } from './homepage/pages/contributing/notebook-standards/notebook-standards.component';
import { ReviewProcessComponent } from './homepage/pages/contributing/review-process/review-process.component';
import { DashboardsComponent } from './homepage/pages/data-tooling/dashboards/dashboards.component';
import { DuneAnalyticsComponent } from './homepage/pages/data-tooling/dune-analytics/dune-analytics.component';
import { NotebooksComponent } from './homepage/pages/data-tooling/notebooks/notebooks.component';
import { PythonSetupComponent } from './homepage/pages/data-tooling/python-setup/python-setup.component';
import { RpcNodesComponent } from './homepage/pages/data-tooling/rpc-nodes/rpc-nodes.component';
import { TheGraphComponent } from './homepage/pages/data-tooling/the-graph/the-graph.component';
import { WalletAnalyticsComponent } from './homepage/pages/data-tooling/wallet-analytics/wallet-analytics.component';
import { DefiVsTraditionalComponent } from './homepage/pages/defi-vs-traditional/defi-vs-traditional.component';
import { DefiVsTraditionalFinanceComponent } from './homepage/pages/defi-vs-traditional-finance/defi-vs-traditional-finance.component';
import { DataTransparencyComponent } from './homepage/pages/defi-vs-traditional-finance/data-transparency/data-transparency.component';
import { LeverageAndCollateralizationComponent } from './homepage/pages/defi-vs-traditional-finance/leverage-and-collateralization/leverage-and-collateralization.component';
import { LiquidityModelsComponent } from './homepage/pages/defi-vs-traditional-finance/liquidity-models/liquidity-models.component';
import { MarketMicrostructureComponent } from './homepage/pages/defi-vs-traditional-finance/market-microstructure/market-microstructure.component';
import { PricingAndSettlementComponent } from './homepage/pages/defi-vs-traditional-finance/pricing-and-settlement/pricing-and-settlement.component';
import { RegulationAndCustodyComponent } from './homepage/pages/defi-vs-traditional-finance/regulation-and-custody/regulation-and-custody.component';
import { RiskDistributionComponent } from './homepage/pages/defi-vs-traditional-finance/risk-distribution/risk-distribution.component';
import { LandscapeOfDefiComponent } from './homepage/pages/landscape-of-defi/landscape-of-defi.component';
import { ArchitectureOfDefiComponent } from './homepage/pages/landscape-of-defi/architecture-of-defi/architecture-of-defi.component';
import { CoreMathToolsComponent } from './homepage/pages/landscape-of-defi/core-math-tools/core-math-tools.component';
import { EconomicPremisesComponent } from './homepage/pages/landscape-of-defi/economic-premises/economic-premises.component';
import { EvolutionOfFinanceComponent } from './homepage/pages/landscape-of-defi/evolution-of-finance/evolution-of-finance.component';
import { MetricsAndAnalyticsStackComponent } from './homepage/pages/landscape-of-defi/metrics-and-analytics-stack/metrics-and-analytics-stack.component';
import { RiskSurfacesComponent } from './homepage/pages/landscape-of-defi/risk-surfaces/risk-surfaces.component';
import { LendingAndBorrowingComponent } from './homepage/pages/lending-and-borrowing/lending-and-borrowing.component';
import { LendingBorrowingComponent as LendingBorrowingLendingBorrowingComponent } from './homepage/pages/lending-borrowing/lending-borrowing.component';
import { CollateralMathComponent } from './homepage/pages/lending-borrowing/collateral-math/collateral-math.component';
import { CreditDelegationComponent } from './homepage/pages/lending-borrowing/credit-delegation/credit-delegation.component';
import { DynamicApyComponent } from './homepage/pages/lending-borrowing/dynamic-apy/dynamic-apy.component';
import { InterestRateModelsComponent } from './homepage/pages/lending-borrowing/interest-rate-models/interest-rate-models.component';
import { StabilityAndSystemicRiskComponent } from './homepage/pages/lending-borrowing/stability-and-systemic-risk/stability-and-systemic-risk.component';
import { FrontrunningComponent } from './homepage/pages/market-microstructure/frontrunning/frontrunning.component';
import { GasOptimizationComponent } from './homepage/pages/market-microstructure/gas-optimization/gas-optimization.component';
import { JitLiquidityComponent } from './homepage/pages/market-microstructure/jit-liquidity/jit-liquidity.component';
import { MevComponent } from './homepage/pages/market-microstructure/mev/mev.component';
import { OrderFlowComponent } from './homepage/pages/market-microstructure/order-flow/order-flow.component';
import { SandwichAttacksComponent } from './homepage/pages/market-microstructure/sandwich-attacks/sandwich-attacks.component';
import { SlippageComponent as MarketMicrostructureSlippageComponent } from './homepage/pages/market-microstructure/slippage/slippage.component';
import { MathPrimerComponent } from './homepage/pages/math-primer/math-primer.component';
import { MetaModulesCapstoneComponent } from './homepage/pages/meta-modules-capstone/meta-modules-capstone.component';
import { AaveComponent } from './homepage/pages/protocol-deep-dives/aave/aave.component';
import { BalancerComponent } from './homepage/pages/protocol-deep-dives/balancer/balancer.component';
import { CompoundComponent } from './homepage/pages/protocol-deep-dives/compound/compound.component';
import { CurveComponent } from './homepage/pages/protocol-deep-dives/curve/curve.component';
import { GmxComponent } from './homepage/pages/protocol-deep-dives/gmx/gmx.component';
import { PancakeswapComponent } from './homepage/pages/protocol-deep-dives/pancakeswap/pancakeswap.component';
import { UniswapV2Component } from './homepage/pages/protocol-deep-dives/uniswap-v2/uniswap-v2.component';
import { UniswapV3Component } from './homepage/pages/protocol-deep-dives/uniswap-v3/uniswap-v3.component';
import { BrownianMotionComponent } from './homepage/pages/quant-math/brownian-motion/brownian-motion.component';
import { CalculusComponent } from './homepage/pages/quant-math/calculus/calculus.component';
import { ConfidenceIntervalsComponent } from './homepage/pages/quant-math/confidence-intervals/confidence-intervals.component';
import { CorrelationComponent } from './homepage/pages/quant-math/correlation/correlation.component';
import { CvarComponent } from './homepage/pages/quant-math/cvar/cvar.component';
import { DistributionsComponent } from './homepage/pages/quant-math/distributions/distributions.component';
import { ExpectedValueComponent } from './homepage/pages/quant-math/expected-value/expected-value.component';
import { HypothesisTestingComponent } from './homepage/pages/quant-math/hypothesis-testing/hypothesis-testing.component';
import { KellyCriterionComponent } from './homepage/pages/quant-math/kelly-criterion/kelly-criterion.component';
import { LinearAlgebraComponent } from './homepage/pages/quant-math/linear-algebra/linear-algebra.component';
import { MaxDrawdownComponent } from './homepage/pages/quant-math/max-drawdown/max-drawdown.component';
import { NumericalMethodsComponent } from './homepage/pages/quant-math/numerical-methods/numerical-methods.component';
import { ProbabilityTheoryComponent } from './homepage/pages/quant-math/probability-theory/probability-theory.component';
import { RegressionComponent } from './homepage/pages/quant-math/regression/regression.component';
import { SharpeRatioComponent } from './homepage/pages/quant-math/sharpe-ratio/sharpe-ratio.component';
import { SortinoRatioComponent } from './homepage/pages/quant-math/sortino-ratio/sortino-ratio.component';
import { VarComponent } from './homepage/pages/quant-math/var/var.component';
import { VarianceStdComponent } from './homepage/pages/quant-math/variance-std/variance-std.component';
import { QuantitativeDefiModelingComponent } from './homepage/pages/quantitative-defi-modeling/quantitative-defi-modeling.component';
import { AgentBasedModelingComponent } from './homepage/pages/quantitative-defi-modeling/agent-based-modeling/agent-based-modeling.component';
import { DeterministicSimulationEnginesComponent } from './homepage/pages/quantitative-defi-modeling/deterministic-simulation-engines/deterministic-simulation-engines.component';
import { OracleDesignComponent } from './homepage/pages/quantitative-defi-modeling/oracle-design/oracle-design.component';
import { PnlMetricsComponent } from './homepage/pages/quantitative-defi-modeling/pnl-metrics/pnl-metrics.component';
import { PortfolioOptimizationComponent } from './homepage/pages/quantitative-defi-modeling/portfolio-optimization/portfolio-optimization.component';
import { ScenarioTestingComponent } from './homepage/pages/quantitative-defi-modeling/scenario-testing/scenario-testing.component';
import { CodeSnippetsComponent } from './homepage/pages/reference/code-snippets/code-snippets.component';
import { FormulaCheatsheetComponent } from './homepage/pages/reference/formula-cheatsheet/formula-cheatsheet.component';
import { MetricIndexComponent } from './homepage/pages/reference/metric-index/metric-index.component';
import { ProtocolIndexComponent } from './homepage/pages/reference/protocol-index/protocol-index.component';
import { ResourcesComponent } from './homepage/pages/reference/resources/resources.component';
import { CustodyRiskComponent } from './homepage/pages/risk-security/custody-risk/custody-risk.component';
import { IncidentResponseComponent } from './homepage/pages/risk-security/incident-response/incident-response.component';
import { OperationalRiskComponent } from './homepage/pages/risk-security/operational-risk/operational-risk.component';
import { OracleRiskComponent } from './homepage/pages/risk-security/oracle-risk/oracle-risk.component';
import { ProtocolRiskComponent } from './homepage/pages/risk-security/protocol-risk/protocol-risk.component';
import { RegulatoryRiskComponent } from './homepage/pages/risk-security/regulatory-risk/regulatory-risk.component';
import { SecurityChecklistComponent } from './homepage/pages/risk-security/security-checklist/security-checklist.component';
import { SmartContractRiskComponent } from './homepage/pages/risk-security/smart-contract-risk/smart-contract-risk.component';
import { AtrComponent as SignalsIndicatorsAtrComponent } from './homepage/pages/signals-indicators/atr/atr.component';
import { BacktestSignalsComponent } from './homepage/pages/signals-indicators/backtest-signals/backtest-signals.component';
import { BollingerBandsComponent } from './homepage/pages/signals-indicators/bollinger-bands/bollinger-bands.component';
import { CombiningSignalsComponent } from './homepage/pages/signals-indicators/combining-signals/combining-signals.component';
import { EmaComponent } from './homepage/pages/signals-indicators/ema/ema.component';
import { FundingRatesComponent } from './homepage/pages/signals-indicators/funding-rates/funding-rates.component';
import { MacdComponent as SignalsIndicatorsMacdComponent } from './homepage/pages/signals-indicators/macd/macd.component';
import { MovingAveragesComponent as SignalsIndicatorsMovingAveragesComponent } from './homepage/pages/signals-indicators/moving-averages/moving-averages.component';
import { OnChainVolumeComponent } from './homepage/pages/signals-indicators/on-chain-volume/on-chain-volume.component';
import { OpenInterestComponent as SignalsIndicatorsOpenInterestComponent } from './homepage/pages/signals-indicators/open-interest/open-interest.component';
import { RsiComponent as SignalsIndicatorsRsiComponent } from './homepage/pages/signals-indicators/rsi/rsi.component';
import { SentimentComponent } from './homepage/pages/signals-indicators/sentiment/sentiment.component';
import { SignalDegradationComponent } from './homepage/pages/signals-indicators/signal-degradation/signal-degradation.component';
import { StochasticComponent as SignalsIndicatorsStochasticComponent } from './homepage/pages/signals-indicators/stochastic/stochastic.component';
import { VolumeAnalysisComponent } from './homepage/pages/signals-indicators/volume-analysis/volume-analysis.component';
import { WhaleTrackingComponent } from './homepage/pages/signals-indicators/whale-tracking/whale-tracking.component';
import { Backtesting101Component } from './homepage/pages/simulation-backtesting/backtesting-101/backtesting-101.component';
import { CrossValidationComponent } from './homepage/pages/simulation-backtesting/cross-validation/cross-validation.component';
import { DataQualityComponent } from './homepage/pages/simulation-backtesting/data-quality/data-quality.component';
import { EquityCurvesComponent } from './homepage/pages/simulation-backtesting/equity-curves/equity-curves.component';
import { FrameworksComponent } from './homepage/pages/simulation-backtesting/frameworks/frameworks.component';
import { LiveDeploymentComponent } from './homepage/pages/simulation-backtesting/live-deployment/live-deployment.component';
import { MonteCarloComponent } from './homepage/pages/simulation-backtesting/monte-carlo/monte-carlo.component';
import { OverfittingComponent } from './homepage/pages/simulation-backtesting/overfitting/overfitting.component';
import { PaperTradingComponent } from './homepage/pages/simulation-backtesting/paper-trading/paper-trading.component';
import { PerformanceMetricsComponent } from './homepage/pages/simulation-backtesting/performance-metrics/performance-metrics.component';
import { ReportingComponent } from './homepage/pages/simulation-backtesting/reporting/reporting.component';
import { SlippageModelComponent } from './homepage/pages/simulation-backtesting/slippage-model/slippage-model.component';
import { TransactionCostsComponent } from './homepage/pages/simulation-backtesting/transaction-costs/transaction-costs.component';
import { WalkForwardComponent } from './homepage/pages/simulation-backtesting/walk-forward/walk-forward.component';
import { StakingRestakingComponent as StakingRestakingStakingRestakingComponent } from './homepage/pages/staking-restaking/staking-restaking.component';
import { StakingRestakingYieldMechanicsComponent } from './homepage/pages/staking-restaking-yield-mechanics/staking-restaking-yield-mechanics.component';
import { LiquidStakingDerivativesComponent } from './homepage/pages/staking-restaking-yield/liquid-staking-derivatives/liquid-staking-derivatives.component';
import { ProofOfStakeMathComponent } from './homepage/pages/staking-restaking-yield/proof-of-stake-math/proof-of-stake-math.component';
import { RestakingEconomicsComponent } from './homepage/pages/staking-restaking-yield/restaking-economics/restaking-economics.component';
import { RestakingModelsComponent } from './homepage/pages/staking-restaking-yield/restaking-models/restaking-models.component';
import { ValidatorEconomicsComponent } from './homepage/pages/staking-restaking-yield/validator-economics/validator-economics.component';
import { YieldDecompositionComponent } from './homepage/pages/staking-restaking-yield/yield-decomposition/yield-decomposition.component';
import { FirstTxComponent } from './homepage/pages/start-here/first-tx/first-tx.component';
import { SafetyChecklistComponent } from './homepage/pages/start-here/safety-checklist/safety-checklist.component';
import { SetUpAnalyticsComponent } from './homepage/pages/start-here/set-up-analytics/set-up-analytics.component';
import { SetUpWalletComponent } from './homepage/pages/start-here/set-up-wallet/set-up-wallet.component';
import { Web3GlossaryComponent } from './homepage/pages/start-here/web3-glossary/web3-glossary.component';
import { BreakoutComponent } from './homepage/pages/strategy-library/breakout/breakout.component';
import { CombiningStrategiesComponent } from './homepage/pages/strategy-library/combining-strategies/combining-strategies.component';
import { DeltaNeutralComponent as StrategyLibraryDeltaNeutralComponent } from './homepage/pages/strategy-library/delta-neutral/delta-neutral.component';
import { LpActiveComponent } from './homepage/pages/strategy-library/lp-active/lp-active.component';
import { LpConcentratedComponent } from './homepage/pages/strategy-library/lp-concentrated/lp-concentrated.component';
import { LpPassiveComponent } from './homepage/pages/strategy-library/lp-passive/lp-passive.component';
import { MarketNeutralComponent } from './homepage/pages/strategy-library/market-neutral/market-neutral.component';
import { MeanReversionStrategyComponent } from './homepage/pages/strategy-library/mean-reversion/mean-reversion.component';
import { MomentumComponent as StrategyLibraryMomentumComponent } from './homepage/pages/strategy-library/momentum/momentum.component';
import { PairsTradingComponent } from './homepage/pages/strategy-library/pairs-trading/pairs-trading.component';
import { PortfolioRebalancingComponent } from './homepage/pages/strategy-library/portfolio-rebalancing/portfolio-rebalancing.component';
import { PositionSizingComponent as StrategyLibraryPositionSizingComponent } from './homepage/pages/strategy-library/position-sizing/position-sizing.component';
import { StatArbComponent } from './homepage/pages/strategy-library/stat-arb/stat-arb.component';
import { StopLossComponent as StrategyLibraryStopLossComponent } from './homepage/pages/strategy-library/stop-loss/stop-loss.component';
import { TakeProfitComponent } from './homepage/pages/strategy-library/take-profit/take-profit.component';
import { TrendFollowingComponent } from './homepage/pages/strategy-library/trend-following/trend-following.component';
import { YieldAggregationComponent } from './homepage/pages/strategy-library/yield-aggregation/yield-aggregation.component';
import { ToolingAndSimulationEcosystemComponent } from './homepage/pages/tooling-and-simulation-ecosystem/tooling-and-simulation-ecosystem.component';
import { ToolingSimulationEcosystemComponent } from './homepage/pages/tooling-simulation-ecosystem/tooling-simulation-ecosystem.component';
import { TopLevelRoadmapComponent } from './homepage/pages/top-level-roadmap/top-level-roadmap.component';
import { TradingFoundationsComponent } from './homepage/pages/trading-foundations/trading-foundations.component';
import { TradingFoundationsMarketMakingComponent } from './homepage/pages/trading-foundations/market-making/market-making.component';
import { TradingFoundationsPerpetualFuturesComponent } from './homepage/pages/trading-foundations/perpetual-futures/perpetual-futures.component';
import { TradingFoundationsSpotTradingComponent } from './homepage/pages/trading-foundations/spot-trading/spot-trading.component';
import { TransactionOrderingMevComponent } from './homepage/pages/transaction-ordering-mev/transaction-ordering-mev.component';
import { HowBlocksFormComponent } from './homepage/pages/transaction-ordering-mev/how-blocks-form/how-blocks-form.component';
import { MevBeyondEvmsComponent } from './homepage/pages/transaction-ordering-mev/mev-beyond-evms/mev-beyond-evms.component';
import { MevTaxonomyComponent } from './homepage/pages/transaction-ordering-mev/mev-taxonomy/mev-taxonomy.component';
import { MitigationAndDefensesComponent } from './homepage/pages/transaction-ordering-mev/mitigation-and-defenses/mitigation-and-defenses.component';
import { QuantitativeImpactsComponent } from './homepage/pages/transaction-ordering-mev/quantitative-impacts/quantitative-impacts.component';
import { StatisticalModelingComponent } from './homepage/pages/transaction-ordering-mev/statistical-modeling/statistical-modeling.component';
import { PrerequisitesComponent } from './homepage/pages/welcome/prerequisites/prerequisites.component';
import { WhatIsDefiComponent } from './homepage/pages/welcome/what-is-defi/what-is-defi.component';
import { WhyThisMattersComponent } from './homepage/pages/welcome/why-this-matters/why-this-matters.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    MenuItemComponent,
    IntroductionComponent,
    BasePageComponent,
    SocialWrapperComponent,
    HowToNavigateComponent,
    WelcomeReadingPathsComponent,
    NotationConventionsComponent,
    RiskRealityCheckComponent,
    DayInLifeComponent,
    TradfiToDeFiComponent,
    OnChainMeaningComponent,
    TokensAddressesComponent,
    UseCasesComponent,
    LosingMoneyComponent,
    StartHereHowToReadComponent,
    Tokens101Component,
    Erc20Component,
    SwapsDexsComponent,
    Amms101Component,
    ImpermanentLossComponent,
    BuildingBlocksLendingBorrowingComponent,
    StablecoinsComponent,
    OraclesComponent,
    PerpetualFuturesComponent,
    BuildingBlocksLiquidationsComponent,
    GovernanceComponent,
    MevOverviewComponent,
    AmmsDepthComponent,
    ConcentratedLiquidityComponent,
    LendingArchitectureComponent,
    StablecoinDesignsComponent,
    ProtocolsStakingRestakingComponent,
    PerpDexComponent,
    ProtocolsBridgesComponent,
    OracleDesignsComponent,
    OrderbooksVsAmmsComponent,
    MicrostructureSlippageComponent,
    FeesRoutingComponent,
    GasMempoolComponent,
    MevFormalComponent,
    OnchainOffchainComponent,
    LatencyRiskComponent,
    DataSourcesComponent,
    TimeSeriesComponent,
    CleaningComponent,
    EventLogsComponent,
    DataToolingPipelineComponent,
    DataToolingPythonComponent,
    DataToolingTypescriptComponent,
    ReproducibleComponent,
    RandomVariablesComponent,
    ExpectationVarianceComponent,
    CovarianceComponent,
    LlnCltComponent,
    SamplingComponent,
    ReturnsComponent,
    VolatilityComponent,
    AutocorrelationComponent,
    StationarityComponent,
    RollingWindowsComponent,
    SharpeComponent,
    SortinoComponent,
    DrawdownComponent,
    VarCvarComponent,
    KellyComponent,
    OptimizationComponent,
    MeanVarianceComponent,
    QuantMathPositionSizingComponent,
    RebalancingComponent,
    RandomWalksComponent,
    GbmComponent,
    MeanReversionComponent,
    JumpsComponent,
    WhatIsSignalComponent,
    MomentumVsMeanReversionComponent,
    SignalsMovingAveragesComponent,
    MaCrossoversComponent,
    SignalsRsiComponent,
    SignalsMacdComponent,
    BollingerComponent,
    SignalsAtrComponent,
    ObvComponent,
    SignalsStochasticComponent,
    VolumeComponent,
    SignalsFundingRateComponent,
    SignalsOpenInterestComponent,
    LiquidityComponent,
    BasisComponent,
    OnchainActivityComponent,
    StrategiesHowToReadComponent,
    BuyHoldComponent,
    LpBusinessComponent,
    StrategiesYieldFarmingComponent,
    ConcentratedLpComponent,
    DeltaHedgedLpComponent,
    StrategiesMomentumComponent,
    RsiStrategyComponent,
    MacdStrategyComponent,
    FundingTrendsComponent,
    CashCarryComponent,
    StrategiesDeltaNeutralComponent,
    PairsComponent,
    MmLiteComponent,
    StrategiesStopLossComponent,
    DynamicSizingComponent,
    HedgingLpComponent,
    WhyBacktestComponent,
    EventDrivenComponent,
    BuildingBacktesterComponent,
    DataPrepComponent,
    MetricsComponent,
    ScenariosComponent,
    AgentBasedComponent,
    OrderbookComponent,
    LpReturnsComponent,
    SimulationLiquidationsComponent,
    ParamSweepsComponent,
    SimulationPythonComponent,
    SimulationTypescriptComponent,
    OnchainDataComponent,
    TypesComponent,
    SmartContractComponent,
    OracleManipulationComponent,
    LeverageLiquidationComponent,
    SlippageFrontrunningComponent,
    BacktestVsLiveComponent,
    OperationalComponent,
    ChecklistsComponent,
    RsiWalkthroughComponent,
    LpVolatilityComponent,
    FailedStrategyComponent,
    OracleIncidentComponent,
    BasisUnwindComponent,
    GlossaryComponent,
    IndicatorsComponent,
    FormulasComponent,
    ProtocolsComponent,
    NotationComponent,
    ReferenceReadingPathsComponent,
    GuideComponent,
    StyleComponent,
    ContributingPipelineComponent,
    NewPageComponent,
    ChecklistComponent,
    RoadmapComponent,
    AdvancedTopicsComponent,
    BlockchainExecutionEnvironmentsComponent,
    ComparativeBenchmarksComponent,
    EvmComponent,
    MoveVmComponent,
    QuantEngineeringComponent,
    SolanaSvmComponent,
    BuildingBlocksBridgesComponent,
    DerivativesComponent,
    LendingComponent,
    LiquidityPoolsComponent,
    TokenomicsComponent,
    TokenStandardsComponent,
    BuildingBlocksYieldFarmingComponent,
    BuildingSimulationsComponent,
    AgentBasedSimulationComponent,
    BacktestingFrameworkComponent,
    DataPipelineReplayComponent,
    EventDrivenArchitectureComponent,
    PerformanceOptimizationComponent,
    CurveArbComponent,
    FlashLoanComponent,
    CaseStudiesFundingRateComponent,
    PostMortemComponent,
    UniswapV3LpComponent,
    CodeExamplesComponent,
    CommunityComponent,
    ContentGuidelinesComponent,
    HowToContributeComponent,
    NotebookStandardsComponent,
    ReviewProcessComponent,
    DashboardsComponent,
    DuneAnalyticsComponent,
    NotebooksComponent,
    PythonSetupComponent,
    RpcNodesComponent,
    TheGraphComponent,
    WalletAnalyticsComponent,
    DefiVsTraditionalComponent,
    DefiVsTraditionalFinanceComponent,
    DataTransparencyComponent,
    LeverageAndCollateralizationComponent,
    LiquidityModelsComponent,
    MarketMicrostructureComponent,
    PricingAndSettlementComponent,
    RegulationAndCustodyComponent,
    RiskDistributionComponent,
    LandscapeOfDefiComponent,
    ArchitectureOfDefiComponent,
    CoreMathToolsComponent,
    EconomicPremisesComponent,
    EvolutionOfFinanceComponent,
    MetricsAndAnalyticsStackComponent,
    RiskSurfacesComponent,
    LendingAndBorrowingComponent,
    LendingBorrowingLendingBorrowingComponent,
    CollateralMathComponent,
    CreditDelegationComponent,
    DynamicApyComponent,
    InterestRateModelsComponent,
    StabilityAndSystemicRiskComponent,
    FrontrunningComponent,
    GasOptimizationComponent,
    JitLiquidityComponent,
    MevComponent,
    OrderFlowComponent,
    SandwichAttacksComponent,
    MarketMicrostructureSlippageComponent,
    MathPrimerComponent,
    MetaModulesCapstoneComponent,
    AaveComponent,
    BalancerComponent,
    CompoundComponent,
    CurveComponent,
    GmxComponent,
    PancakeswapComponent,
    UniswapV2Component,
    UniswapV3Component,
    BrownianMotionComponent,
    CalculusComponent,
    ConfidenceIntervalsComponent,
    CorrelationComponent,
    CvarComponent,
    DistributionsComponent,
    ExpectedValueComponent,
    HypothesisTestingComponent,
    KellyCriterionComponent,
    LinearAlgebraComponent,
    MaxDrawdownComponent,
    NumericalMethodsComponent,
    ProbabilityTheoryComponent,
    RegressionComponent,
    SharpeRatioComponent,
    SortinoRatioComponent,
    VarComponent,
    VarianceStdComponent,
    QuantitativeDefiModelingComponent,
    AgentBasedModelingComponent,
    DeterministicSimulationEnginesComponent,
    OracleDesignComponent,
    PnlMetricsComponent,
    PortfolioOptimizationComponent,
    ScenarioTestingComponent,
    CodeSnippetsComponent,
    FormulaCheatsheetComponent,
    MetricIndexComponent,
    ProtocolIndexComponent,
    ResourcesComponent,
    CustodyRiskComponent,
    IncidentResponseComponent,
    OperationalRiskComponent,
    OracleRiskComponent,
    ProtocolRiskComponent,
    RegulatoryRiskComponent,
    SecurityChecklistComponent,
    SmartContractRiskComponent,
    SignalsIndicatorsAtrComponent,
    BacktestSignalsComponent,
    BollingerBandsComponent,
    CombiningSignalsComponent,
    EmaComponent,
    FundingRatesComponent,
    SignalsIndicatorsMacdComponent,
    SignalsIndicatorsMovingAveragesComponent,
    OnChainVolumeComponent,
    SignalsIndicatorsOpenInterestComponent,
    SignalsIndicatorsRsiComponent,
    SentimentComponent,
    SignalDegradationComponent,
    SignalsIndicatorsStochasticComponent,
    VolumeAnalysisComponent,
    WhaleTrackingComponent,
    Backtesting101Component,
    CrossValidationComponent,
    DataQualityComponent,
    EquityCurvesComponent,
    FrameworksComponent,
    LiveDeploymentComponent,
    MonteCarloComponent,
    OverfittingComponent,
    PaperTradingComponent,
    PerformanceMetricsComponent,
    ReportingComponent,
    SlippageModelComponent,
    TransactionCostsComponent,
    WalkForwardComponent,
    StakingRestakingStakingRestakingComponent,
    StakingRestakingYieldMechanicsComponent,
    LiquidStakingDerivativesComponent,
    ProofOfStakeMathComponent,
    RestakingEconomicsComponent,
    RestakingModelsComponent,
    ValidatorEconomicsComponent,
    YieldDecompositionComponent,
    FirstTxComponent,
    SafetyChecklistComponent,
    SetUpAnalyticsComponent,
    SetUpWalletComponent,
    Web3GlossaryComponent,
    BreakoutComponent,
    CombiningStrategiesComponent,
    StrategyLibraryDeltaNeutralComponent,
    LpActiveComponent,
    LpConcentratedComponent,
    LpPassiveComponent,
    MarketNeutralComponent,
    MeanReversionStrategyComponent,
    StrategyLibraryMomentumComponent,
    PairsTradingComponent,
    PortfolioRebalancingComponent,
    StrategyLibraryPositionSizingComponent,
    StatArbComponent,
    StrategyLibraryStopLossComponent,
    TakeProfitComponent,
    TrendFollowingComponent,
    YieldAggregationComponent,
    ToolingAndSimulationEcosystemComponent,
    ToolingSimulationEcosystemComponent,
    TopLevelRoadmapComponent,
    TradingFoundationsComponent,
    TradingFoundationsMarketMakingComponent,
    TradingFoundationsPerpetualFuturesComponent,
    TradingFoundationsSpotTradingComponent,
    TransactionOrderingMevComponent,
    HowBlocksFormComponent,
    MevBeyondEvmsComponent,
    MevTaxonomyComponent,
    MitigationAndDefensesComponent,
    QuantitativeImpactsComponent,
    StatisticalModelingComponent,
    PrerequisitesComponent,
    WhatIsDefiComponent,
    WhyThisMattersComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    FormsModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
