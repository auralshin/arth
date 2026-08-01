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
import { CodeSnippetsComponent } from './homepage/pages/reference/code-snippets/code-snippets.component';
import { FormulaCheatsheetComponent } from './homepage/pages/reference/formula-cheatsheet/formula-cheatsheet.component';
import { MetricIndexComponent } from './homepage/pages/reference/metric-index/metric-index.component';
import { ProtocolIndexComponent } from './homepage/pages/reference/protocol-index/protocol-index.component';
import { ResourcesComponent } from './homepage/pages/reference/resources/resources.component';
import { ToolingSimulationEcosystemComponent } from './homepage/pages/tooling-simulation-ecosystem/tooling-simulation-ecosystem.component';
import { TradingFoundationsComponent } from './homepage/pages/trading-foundations/trading-foundations.component';
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
import { MarketParticipantsComponent } from './homepage/pages/markets/market-participants/market-participants.component';
import { InstrumentMapComponent } from './homepage/pages/markets/instrument-map/instrument-map.component';
import { Equities101Component } from './homepage/pages/markets/equities-101/equities-101.component';
import { CorporateActionsComponent } from './homepage/pages/markets/corporate-actions/corporate-actions.component';
import { ShortSellingComponent } from './homepage/pages/markets/short-selling/short-selling.component';
import { EquityIndicesComponent } from './homepage/pages/markets/equity-indices/equity-indices.component';
import { Futures101Component } from './homepage/pages/markets/futures-101/futures-101.component';
import { RollAndCarryComponent } from './homepage/pages/markets/roll-and-carry/roll-and-carry.component';
import { CalendarSpreadsComponent } from './homepage/pages/markets/calendar-spreads/calendar-spreads.component';
import { Fx101Component } from './homepage/pages/markets/fx-101/fx-101.component';
import { FxCarryParityComponent } from './homepage/pages/markets/fx-carry-parity/fx-carry-parity.component';
import { FixedIncome101Component } from './homepage/pages/markets/fixed-income-101/fixed-income-101.component';
import { YieldCurvesComponent } from './homepage/pages/markets/yield-curves/yield-curves.component';
import { DurationConvexityComponent } from './homepage/pages/markets/duration-convexity/duration-convexity.component';
import { CurveConstructionComponent } from './homepage/pages/markets/curve-construction/curve-construction.component';
import { CommoditiesComponent } from './homepage/pages/markets/commodities/commodities.component';
import { Options101Component } from './homepage/pages/derivatives/options-101/options-101.component';
import { PayoffsParityComponent } from './homepage/pages/derivatives/payoffs-parity/payoffs-parity.component';
import { NoArbitrageReplicationComponent } from './homepage/pages/derivatives/no-arbitrage-replication/no-arbitrage-replication.component';
import { BinomialTreesComponent } from './homepage/pages/derivatives/binomial-trees/binomial-trees.component';
import { BlackScholesComponent } from './homepage/pages/derivatives/black-scholes/black-scholes.component';
import { GreeksComponent } from './homepage/pages/derivatives/greeks/greeks.component';
import { DeltaHedgingComponent } from './homepage/pages/derivatives/delta-hedging/delta-hedging.component';
import { ImpliedVolatilityComponent } from './homepage/pages/derivatives/implied-volatility/implied-volatility.component';
import { VolSurfaceComponent } from './homepage/pages/derivatives/vol-surface/vol-surface.component';
import { VolTermStructureComponent } from './homepage/pages/derivatives/vol-term-structure/vol-term-structure.component';
import { ExoticsComponent } from './homepage/pages/derivatives/exotics/exotics.component';
import { VarianceSwapsComponent } from './homepage/pages/derivatives/variance-swaps/variance-swaps.component';
import { BrownianMotionComponent } from './homepage/pages/stochastic-calculus/brownian-motion/brownian-motion.component';
import { MartingalesFiltrationsComponent } from './homepage/pages/stochastic-calculus/martingales-filtrations/martingales-filtrations.component';
import { ItoLemmaComponent } from './homepage/pages/stochastic-calculus/ito-lemma/ito-lemma.component';
import { SdesComponent } from './homepage/pages/stochastic-calculus/sdes/sdes.component';
import { NumericalSchemesComponent } from './homepage/pages/stochastic-calculus/numerical-schemes/numerical-schemes.component';
import { ChangeOfMeasureComponent } from './homepage/pages/stochastic-calculus/change-of-measure/change-of-measure.component';
import { RiskNeutralPricingComponent } from './homepage/pages/stochastic-calculus/risk-neutral-pricing/risk-neutral-pricing.component';
import { FeynmanKacComponent } from './homepage/pages/stochastic-calculus/feynman-kac/feynman-kac.component';
import { OrnsteinUhlenbeckComponent } from './homepage/pages/stochastic-calculus/ornstein-uhlenbeck/ornstein-uhlenbeck.component';
import { HypothesisTestingComponent } from './homepage/pages/stat-methods/hypothesis-testing/hypothesis-testing.component';
import { ConfidenceIntervalsComponent } from './homepage/pages/stat-methods/confidence-intervals/confidence-intervals.component';
import { LinearRegressionComponent } from './homepage/pages/stat-methods/linear-regression/linear-regression.component';
import { RegressionDiagnosticsComponent } from './homepage/pages/stat-methods/regression-diagnostics/regression-diagnostics.component';
import { FactorModelsComponent } from './homepage/pages/stat-methods/factor-models/factor-models.component';
import { PcaComponent } from './homepage/pages/stat-methods/pca/pca.component';
import { ArimaComponent } from './homepage/pages/stat-methods/arima/arima.component';
import { GarchComponent } from './homepage/pages/stat-methods/garch/garch.component';
import { UnitRootsComponent } from './homepage/pages/stat-methods/unit-roots/unit-roots.component';
import { CointegrationComponent } from './homepage/pages/stat-methods/cointegration/cointegration.component';
import { MultipleTestingComponent } from './homepage/pages/stat-methods/multiple-testing/multiple-testing.component';
import { BacktestOverfittingComponent } from './homepage/pages/stat-methods/backtest-overfitting/backtest-overfitting.component';
import { BootstrapComponent } from './homepage/pages/stat-methods/bootstrap/bootstrap.component';
import { ExecutionOverviewComponent } from './homepage/pages/execution/execution-overview/execution-overview.component';
import { OrderTypesComponent } from './homepage/pages/execution/order-types/order-types.component';
import { MarketImpactComponent } from './homepage/pages/execution/market-impact/market-impact.component';
import { AlmgrenChrissComponent } from './homepage/pages/execution/almgren-chriss/almgren-chriss.component';
import { TwapVwapComponent } from './homepage/pages/execution/twap-vwap/twap-vwap.component';
import { ImplementationShortfallComponent } from './homepage/pages/execution/implementation-shortfall/implementation-shortfall.component';
import { SmartOrderRoutingComponent } from './homepage/pages/execution/smart-order-routing/smart-order-routing.component';
import { TransactionCostAnalysisComponent } from './homepage/pages/execution/transaction-cost-analysis/transaction-cost-analysis.component';
import { AdverseSelectionComponent } from './homepage/pages/execution/adverse-selection/adverse-selection.component';
import { ExecutionBenchmarksComponent } from './homepage/pages/execution/execution-benchmarks/execution-benchmarks.component';
import { Credit101Component } from './homepage/pages/credit/credit-101/credit-101.component';
import { CreditSpreadsComponent } from './homepage/pages/credit/credit-spreads/credit-spreads.component';
import { DefaultProbabilityComponent } from './homepage/pages/credit/default-probability/default-probability.component';
import { MertonModelComponent } from './homepage/pages/credit/merton-model/merton-model.component';
import { ReducedFormModelsComponent } from './homepage/pages/credit/reduced-form-models/reduced-form-models.component';
import { CdsComponent } from './homepage/pages/credit/cds/cds.component';
import { RecoveryRatesComponent } from './homepage/pages/credit/recovery-rates/recovery-rates.component';
import { CreditCurvesComponent } from './homepage/pages/credit/credit-curves/credit-curves.component';
import { MlOverviewComponent } from './homepage/pages/ml-finance/ml-overview/ml-overview.component';
import { FeatureEngineeringComponent } from './homepage/pages/ml-finance/feature-engineering/feature-engineering.component';
import { LabellingComponent } from './homepage/pages/ml-finance/labelling/labelling.component';
import { MetaLabellingComponent } from './homepage/pages/ml-finance/meta-labelling/meta-labelling.component';
import { PurgedCrossValidationComponent } from './homepage/pages/ml-finance/purged-cross-validation/purged-cross-validation.component';
import { RegularisationComponent } from './homepage/pages/ml-finance/regularisation/regularisation.component';
import { EnsemblesComponent } from './homepage/pages/ml-finance/ensembles/ensembles.component';
import { InterpretabilityComponent } from './homepage/pages/ml-finance/interpretability/interpretability.component';
import { MlPitfallsComponent } from './homepage/pages/ml-finance/ml-pitfalls/ml-pitfalls.component';
import { RegimesOverviewComponent } from './homepage/pages/regimes-macro/regimes-overview/regimes-overview.component';
import { MarkovSwitchingComponent } from './homepage/pages/regimes-macro/markov-switching/markov-switching.component';
import { HiddenMarkovModelsComponent } from './homepage/pages/regimes-macro/hidden-markov-models/hidden-markov-models.component';
import { ChangepointDetectionComponent } from './homepage/pages/regimes-macro/changepoint-detection/changepoint-detection.component';
import { CorrelationBreakdownComponent } from './homepage/pages/regimes-macro/correlation-breakdown/correlation-breakdown.component';
import { RatesAndInflationComponent } from './homepage/pages/regimes-macro/rates-and-inflation/rates-and-inflation.component';
import { LiquidityCyclesComponent } from './homepage/pages/regimes-macro/liquidity-cycles/liquidity-cycles.component';
import { MacroFactorsComponent } from './homepage/pages/regimes-macro/macro-factors/macro-factors.component';
import { OrderingEconomicsComponent } from './homepage/pages/transaction-ordering-mev/ordering-economics/ordering-economics.component';

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
    CodeSnippetsComponent,
    FormulaCheatsheetComponent,
    MetricIndexComponent,
    ProtocolIndexComponent,
    ResourcesComponent,
    ToolingSimulationEcosystemComponent,
    TradingFoundationsComponent,
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
    MarketParticipantsComponent,
    InstrumentMapComponent,
    Equities101Component,
    CorporateActionsComponent,
    ShortSellingComponent,
    EquityIndicesComponent,
    Futures101Component,
    RollAndCarryComponent,
    CalendarSpreadsComponent,
    Fx101Component,
    FxCarryParityComponent,
    FixedIncome101Component,
    YieldCurvesComponent,
    DurationConvexityComponent,
    CurveConstructionComponent,
    CommoditiesComponent,
    Options101Component,
    PayoffsParityComponent,
    NoArbitrageReplicationComponent,
    BinomialTreesComponent,
    BlackScholesComponent,
    GreeksComponent,
    DeltaHedgingComponent,
    ImpliedVolatilityComponent,
    VolSurfaceComponent,
    VolTermStructureComponent,
    ExoticsComponent,
    VarianceSwapsComponent,
    BrownianMotionComponent,
    MartingalesFiltrationsComponent,
    ItoLemmaComponent,
    SdesComponent,
    NumericalSchemesComponent,
    ChangeOfMeasureComponent,
    RiskNeutralPricingComponent,
    FeynmanKacComponent,
    OrnsteinUhlenbeckComponent,
    HypothesisTestingComponent,
    ConfidenceIntervalsComponent,
    LinearRegressionComponent,
    RegressionDiagnosticsComponent,
    FactorModelsComponent,
    PcaComponent,
    ArimaComponent,
    GarchComponent,
    UnitRootsComponent,
    CointegrationComponent,
    MultipleTestingComponent,
    BacktestOverfittingComponent,
    BootstrapComponent,
    ExecutionOverviewComponent,
    OrderTypesComponent,
    MarketImpactComponent,
    AlmgrenChrissComponent,
    TwapVwapComponent,
    ImplementationShortfallComponent,
    SmartOrderRoutingComponent,
    TransactionCostAnalysisComponent,
    AdverseSelectionComponent,
    ExecutionBenchmarksComponent,
    Credit101Component,
    CreditSpreadsComponent,
    DefaultProbabilityComponent,
    MertonModelComponent,
    ReducedFormModelsComponent,
    CdsComponent,
    RecoveryRatesComponent,
    CreditCurvesComponent,
    MlOverviewComponent,
    FeatureEngineeringComponent,
    LabellingComponent,
    MetaLabellingComponent,
    PurgedCrossValidationComponent,
    RegularisationComponent,
    EnsemblesComponent,
    InterpretabilityComponent,
    MlPitfallsComponent,
    RegimesOverviewComponent,
    MarkovSwitchingComponent,
    HiddenMarkovModelsComponent,
    ChangepointDetectionComponent,
    CorrelationBreakdownComponent,
    RatesAndInflationComponent,
    LiquidityCyclesComponent,
    MacroFactorsComponent,
    OrderingEconomicsComponent,
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
