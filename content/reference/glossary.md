### Glossary

> info **Metadata** Level: All | Prerequisites: None | Tags: reference, glossary, definitions, terminology, lookup

An A–Z of the terms used across Arth, spanning probability and statistics, instruments and markets, derivatives, credit, execution and microstructure, portfolio construction and risk, machine learning, and decentralised finance. Each entry gives a working definition and a link to the page that treats the concept properly.

Definitions here are deliberately short. They exist to unblock you mid-sentence, not to replace the page that derives the idea. Where a word means different things in different corners of finance — *basis*, *skew*, *spread* — each sense gets its own entry.

> info **Related indexes** For symbols see [Notation Reference](/reference/notation), for formulas see [Formula Reference](/reference/formulas), for indicators see [Indicator Index](/reference/indicators), and for evaluation measures see [Metric Index](/reference/metric-index).

---

#### A

- **Adverse selection** — The cost a passive quote pays for being filled by someone who knows more; measured as the mid-price drift against the fill. See [Adverse Selection](/execution/adverse-selection).
- **Almgren–Chriss model** — A framework that trades market impact against timing risk to produce an optimal execution schedule. See [Almgren–Chriss](/execution/almgren-chriss).
- **Alpha** — Return not explained by exposure to compensated risk factors; formally the intercept of a factor regression. See [Factor Models](/stat-methods/factor-models).
- **American option** — An option exercisable at any time up to expiry, valued by backward induction rather than a closed form. See [Binomial Trees](/derivatives/binomial-trees).
- **Amihud illiquidity** — Average absolute return per unit of traded value; a cheap daily-data proxy for price impact. See [Liquidity and Depth as Features](/signals/liquidity).
- **Annualisation** — Rescaling a per-period statistic to a yearly figure, typically by `sqrt(periods_per_year)` for volatility and by compounding for returns. See [Volatility](/quant-math/volatility).
- **Arbitrage** — A position with no cost, no possibility of loss, and a positive probability of gain. Its assumed absence is what makes derivative pricing determinate. See [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication).
- **ARIMA** — Autoregressive integrated moving average: a linear time-series model combining lagged levels, differencing, and lagged errors. See [ARIMA Models](/stat-methods/arima).
- **Asian option** — An option whose payoff depends on the average of the underlying over a window rather than its terminal value. See [Exotic Options](/derivatives/exotics).
- **Asset swap spread** — The spread over a floating benchmark earned by holding a bond and swapping its fixed coupon. See [Credit Spreads](/credit/credit-spreads).
- **Autocorrelation** — Correlation of a series with its own lags. Positive autocorrelation in returns implies trend; negative implies reversal. See [Autocorrelation](/quant-math/autocorrelation).
- **Automated market maker (AMM)** — A contract that quotes prices from an invariant over pooled reserves rather than from a book of resting orders. See [AMMs 101](/building-blocks/amms-101).
- **Average daily volume (ADV)** — Typical traded volume per day, used to normalise order size when estimating impact and capacity. See [Market Impact](/execution/market-impact).
- **Average true range (ATR)** — A volatility measure built from the true range, which includes overnight gaps. See [Average True Range (ATR)](/signals/atr).

---

#### B

- **Backtest** — A simulation of a strategy on historical data. It is an experiment with weak controls, not evidence about the future. See [Why Backtest and Simulate?](/simulation/why-backtest).
- **Backtest overfitting** — Selecting a strategy because it fits noise in the sample. The more variants tested, the worse the inflation of the reported result. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Backwardation** — A futures curve sloping downward, with near contracts priced above far ones. See [Roll and Carry](/markets/roll-and-carry).
- **Barrier option** — An option that activates or extinguishes when the underlying touches a level. See [Exotic Options](/derivatives/exotics).
- **Basis** — The difference between a futures price and the spot price of its underlying, `F - S`. See [Futures 101](/markets/futures-101) and [Basis and Term Structure Signals](/signals/basis).
- **Basis point** — One hundredth of a percentage point, 0.01%. The standard unit for spreads, yields, and trading costs. See [Fixed Income 101](/markets/fixed-income-101).
- **Benjamini–Hochberg procedure** — A step-up rule that controls the false discovery rate rather than the family-wise error rate. See [Multiple Testing](/stat-methods/multiple-testing).
- **Beta** — Sensitivity of an asset's return to a factor, most often the market. See [Factor Models](/stat-methods/factor-models).
- **Binomial tree** — A discrete lattice of up and down moves used to price options by backward induction under risk-neutral probabilities. See [Binomial Trees](/derivatives/binomial-trees).
- **Block bootstrap** — Resampling contiguous blocks rather than individual observations, so serial dependence survives the resample. See [Bootstrap](/stat-methods/bootstrap).
- **Bollinger Bands** — A moving average with bands placed a fixed number of rolling standard deviations away. See [Bollinger Bands](/signals/bollinger).
- **Bonferroni correction** — Dividing the significance threshold by the number of tests to control the family-wise error rate. Conservative by construction. See [Multiple Testing](/stat-methods/multiple-testing).
- **Bootstrap** — Estimating a sampling distribution by resampling the observed data with replacement. See [Bootstrap](/stat-methods/bootstrap).
- **Bridge** — Infrastructure that moves value or messages between chains, and a recurring source of concentrated custody risk. See [Bridges (Primitives)](/building-blocks/bridges).
- **Brownian motion** — The continuous-time limit of a random walk: independent Gaussian increments with variance proportional to elapsed time. See [Brownian Motion](/stochastic-calculus/brownian-motion).
- **Butterfly (volatility)** — A measure of smile curvature: the average of two wing implied volatilities minus the at-the-money level. See [The Volatility Surface](/derivatives/vol-surface).

---

#### C

- **Calendar spread** — A long and short position in two expiries of the same underlying, expressing a view on the curve rather than the level. See [Calendar Spreads](/markets/calendar-spreads).
- **Calmar ratio** — Annualised return divided by maximum drawdown. Simple, and resting on a single observation. See [Performance Metrics for Backtests](/simulation/metrics).
- **Capacity** — The size at which market impact consumes the edge. Invisible in a return series, so it must be recorded by the simulator. See [Market Impact](/execution/market-impact).
- **CAPM** — The single-factor model in which expected excess return is proportional to market beta. See [Factor Models](/stat-methods/factor-models).
- **Carry** — The return from holding a position when nothing moves: coupon, dividend, convenience yield, or funding, net of financing. See [Roll and Carry](/markets/roll-and-carry).
- **Changepoint detection** — Deciding, online or retrospectively, that the data-generating process has shifted. See [Changepoint Detection](/regimes-macro/changepoint-detection).
- **Clean and dirty price** — Quoted bond price excluding and including accrued interest respectively. See [Fixed Income 101](/markets/fixed-income-101).
- **Cointegration** — Two non-stationary series with a stationary linear combination. The statistical basis of relative-value trading. See [Cointegration](/stat-methods/cointegration).
- **Collateral** — Assets pledged against a borrowing, sized by a haircut or loan-to-value limit. See [Lending & Borrowing](/building-blocks/lending-borrowing).
- **Concentrated liquidity** — Providing AMM liquidity only over a chosen price range, raising capital efficiency and range risk together. See [Concentrated Liquidity](/protocols/concentrated-liquidity).
- **Confidence interval** — A range constructed so that, over repeated sampling, it covers the true parameter a stated proportion of the time. See [Confidence Intervals](/stat-methods/confidence-intervals).
- **Constant product invariant** — The AMM rule that the product of pooled reserves stays fixed across a trade, before fees. See [AMMs 101](/building-blocks/amms-101).
- **Contango** — A futures curve sloping upward, with far contracts priced above near ones. See [Roll and Carry](/markets/roll-and-carry).
- **Convexity** — The second-order sensitivity of a bond price to yield; it makes the duration approximation understate gains and overstate losses. See [Duration and Convexity](/markets/duration-convexity).
- **Corporate action** — Dividend, split, spin-off, or rights issue. Each requires a price adjustment before returns are computed. See [Corporate Actions and Price Adjustment](/markets/corporate-actions).
- **Correlation** — Covariance normalised by the two standard deviations, bounded between -1 and 1. See [Covariance](/quant-math/covariance).
- **Cost of carry** — The net financing, storage, and yield cost of holding a spot position to a future date; it sets the fair forward price. See [Cash-and-Carry (Basis Trade) Basics](/strategies/cash-carry).
- **Covariance** — The expected product of two variables' deviations from their means; the building block of portfolio variance. See [Covariance](/quant-math/covariance).
- **Credit default swap (CDS)** — A contract paying compensation on a reference entity's default in exchange for a running premium. See [Credit Default Swaps](/credit/cds).
- **Credit spread** — The yield of a risky bond over a benchmark curve, compensating for default risk, illiquidity, and risk premium. See [Credit Spreads](/credit/credit-spreads).
- **CUSUM** — A cumulative-sum monitoring statistic that raises an alarm when a stream drifts away from its reference level. See [Changepoint Detection](/regimes-macro/changepoint-detection).
- **CVaR (conditional value at risk)** — The expected loss conditional on being beyond the VaR threshold. Also called expected shortfall. See [VaR & CVaR](/quant-math/var-cvar).

---

#### D

- **Deflated Sharpe ratio** — A Sharpe ratio adjusted for the number of trials, non-normality, and sample length. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Delta** — Sensitivity of an option's value to the underlying price; also the hedge ratio. See [The Greeks](/derivatives/greeks).
- **Delta hedging** — Continuously offsetting an option's directional exposure so the remaining P&L is driven by gamma, theta, and vega. See [Delta Hedging](/derivatives/delta-hedging).
- **Delta-neutral** — A book constructed so aggregate delta is zero, isolating carry or volatility exposure. See [Delta-Neutral Strategies](/strategies/delta-neutral).
- **DEX** — A venue where trades settle on-chain, either against an AMM or an order book. See [Swaps & DEXs](/building-blocks/swaps-dexs).
- **Digital option** — An option paying a fixed amount if a condition holds at expiry; the limit of a tight call spread. See [Exotic Options](/derivatives/exotics).
- **Discount factor** — The present value of one unit paid at a future date; the primitive from which curves are built. See [Curve Construction](/markets/curve-construction).
- **Distance to default** — In the Merton model, the number of asset-volatility units between current asset value and the default barrier. See [The Merton Model](/credit/merton-model).
- **Drawdown** — The percentage decline from a running peak of the equity curve. See [Drawdown](/quant-math/drawdown).
- **Drift** — The deterministic component of a stochastic differential equation, the `dt` term. See [Stochastic Differential Equations](/stochastic-calculus/sdes).
- **Duration** — The price sensitivity of a bond to a parallel yield shift, expressed in years or, in modified form, as a percentage per unit of yield. See [Duration and Convexity](/markets/duration-convexity).
- **DV01** — The change in a bond's value for a one-basis-point yield move; duration expressed in currency. See [Duration and Convexity](/markets/duration-convexity).

---

#### E

- **Efficient frontier** — The set of portfolios with minimum variance for each level of expected return. See [Mean-Variance](/quant-math/mean-variance).
- **Embargo** — Dropping observations immediately after a validation fold so leakage from overlapping labels is removed. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).
- **Ensemble** — A model built by aggregating many weak learners, reducing variance when their errors are imperfectly correlated. See [Ensembles](/ml-finance/ensembles).
- **Equity index** — A rules-based basket of shares, weighted by price, capitalisation, or equally, and rebalanced on a schedule. See [Equity Indices](/markets/equity-indices).
- **Error correction model** — A regression in differences that includes the lagged cointegrating residual as a pull term. See [Cointegration](/stat-methods/cointegration).
- **Euler–Maruyama scheme** — The simplest discretisation of a stochastic differential equation, with strong order one-half. See [Numerical Schemes for SDEs](/stochastic-calculus/numerical-schemes).
- **Event-driven backtest** — A simulation that processes timestamped events in order, so the strategy cannot see the future. See [Event-Driven Backtesting Basics](/simulation/event-driven).
- **EWMA** — Exponentially weighted moving average; a recursive estimator that decays older observations geometrically. See [Rolling Windows](/quant-math/rolling-windows).
- **Exotic option** — Any option whose payoff is not a plain call or put: barriers, digitals, Asians, lookbacks. See [Exotic Options](/derivatives/exotics).
- **Expectation** — The probability-weighted average of a random variable. See [Expectation & Variance](/quant-math/expectation-variance).
- **Expected loss** — Probability of default times loss given default times exposure at default. See [Credit 101](/credit/credit-101).
- **Expected shortfall** — See CVaR: the average loss in the tail beyond a quantile. See [VaR & CVaR](/quant-math/var-cvar).
- **Exposure, gross and net** — The sum of absolute position values, and the signed sum. Together they describe leverage and directional tilt. See [Performance Metrics for Backtests](/simulation/metrics).

---

#### F

- **Factor model** — A decomposition of returns into common factor exposures plus an idiosyncratic residual. See [Factor Models](/stat-methods/factor-models).
- **False discovery rate (FDR)** — The expected proportion of rejected nulls that are false positives. See [Multiple Testing](/stat-methods/multiple-testing).
- **Feature engineering** — Turning raw market data into inputs that are stationary, comparable, and free of leakage. See [Feature Engineering for Financial Data](/ml-finance/feature-engineering).
- **Feynman–Kac formula** — The link between a parabolic partial differential equation and an expectation over a diffusion. See [Feynman-Kac](/stochastic-calculus/feynman-kac).
- **Filtration** — The growing family of information sets that formalises what is known at each time. See [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations).
- **Flash loan** — An uncollateralised loan that must be repaid within the same transaction, enabling atomic arbitrage and atomic attacks alike. See [Flash Loan](/case-studies/flash-loan).
- **Forward** — A bilateral agreement to trade at a fixed price on a future date; the building block for futures and parity relations. See [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication).
- **Forward rate** — The rate implied today for borrowing between two future dates, extracted from discount factors. See [Yield Curves](/markets/yield-curves).
- **Fundamental theorem of asset pricing** — No arbitrage is equivalent to the existence of an equivalent martingale measure. See [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing).
- **Funding rate** — The periodic payment between longs and shorts that tethers a perpetual future to its index. See [Funding Rate as a Signal](/signals/funding-rate).
- **Futures** — An exchange-traded, margined, standardised forward with daily settlement through a clearing house. See [Futures 101](/markets/futures-101).
- **FWER (family-wise error rate)** — The probability of at least one false positive across a family of tests. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### G

- **Gamma** — The rate of change of delta with the underlying; the curvature that makes hedged option books profit from movement. See [The Greeks](/derivatives/greeks).
- **GARCH** — A model in which conditional variance depends on past squared shocks and past variance, producing volatility clustering. See [GARCH Models](/stat-methods/garch).
- **Gas** — The unit of computational cost on a blockchain, priced in a fee market that competes for block space. See [Gas & Mempool](/microstructure/gas-mempool).
- **Geometric Brownian motion** — A diffusion with constant proportional drift and volatility, giving lognormal prices. See [Geometric Brownian Motion](/quant-math/gbm).
- **Girsanov's theorem** — The result that lets you change probability measure by reweighting paths, shifting the drift while leaving volatility unchanged. See [Change of Measure](/stochastic-calculus/change-of-measure).
- **Governance token** — A token conferring voting rights over protocol parameters, and with them a channel for both coordination and capture. See [Governance](/building-blocks/governance).
- **Greeks** — The partial derivatives of an option's value with respect to its inputs. See [The Greeks](/derivatives/greeks).

---

#### H

- **HAC standard errors** — Heteroskedasticity- and autocorrelation-consistent standard errors, which widen inference when residuals are dependent. See [Regression Diagnostics](/stat-methods/regression-diagnostics).
- **Half-life** — The time for a mean-reverting deviation to decay by half, `ln(0.5) / ln(phi)` in discrete time. See [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck).
- **Hazard rate** — The instantaneous conditional rate of default given survival to now. See [Default Probability](/credit/default-probability).
- **Health factor** — A collateralised borrower's distance from liquidation, expressed as a ratio of adjusted collateral to debt. See [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).
- **Heteroskedasticity** — Non-constant residual variance, which breaks classical standard errors without biasing the coefficients. See [Regression Diagnostics](/stat-methods/regression-diagnostics).
- **Hidden Markov model** — A model with an unobserved discrete state driving an observed emission distribution. See [Hidden Markov Models](/regimes-macro/hidden-markov-models).
- **Hit rate** — The fraction of periods or trades with positive return. Meaningless without the payoff ratio beside it. See [Performance Metrics for Backtests](/simulation/metrics).
- **Hypothesis test** — A procedure that compares an estimate against a null value using its sampling distribution. See [Hypothesis Testing](/stat-methods/hypothesis-testing).

---

#### I

- **Impermanent loss** — The shortfall of an AMM liquidity position relative to simply holding the two assets, caused by the pool rebalancing against the price move. See [Impermanent Loss](/building-blocks/impermanent-loss).
- **Implementation shortfall** — The gap between the value of a paper trade at the decision price and the realised outcome, decomposed into delay, execution, opportunity, and fees. See [Implementation Shortfall](/execution/implementation-shortfall).
- **Implied volatility** — The volatility input that makes a pricing model reproduce a quoted option price. See [Implied Volatility](/derivatives/implied-volatility).
- **Information coefficient (IC)** — The correlation between a signal and the subsequent return; the standard measure of raw predictive strength. See [What Is a Trading Signal?](/signals/what-is-signal).
- **Information ratio** — Active return divided by tracking error; a Sharpe ratio measured against a benchmark rather than cash. See [Factor Models](/stat-methods/factor-models).
- **Interest rate parity** — The no-arbitrage link between spot, forward, and the two currencies' interest rates. See [FX Carry and Interest Rate Parity](/markets/fx-carry-parity).
- **Intrinsic value** — The payoff an option would have if exercised now; the premium less intrinsic value is time value. See [Options 101](/derivatives/options-101).
- **Itô's lemma** — The chain rule for stochastic processes, with an extra second-order term from quadratic variation. See [Itô's Lemma](/stochastic-calculus/ito-lemma).

---

#### J

- **Johansen test** — A likelihood-based test for the number of cointegrating relations in a vector system. See [Cointegration](/stat-methods/cointegration).
- **Jump process** — A model in which prices move by discrete jumps as well as diffusion, producing fat tails that diffusion alone cannot. See [Jump Processes](/quant-math/jumps).

---

#### K

- **Kelly criterion** — The bet fraction that maximises the expected logarithm of wealth, and therefore the long-run growth rate. See [Kelly Criterion](/quant-math/kelly).
- **KPSS test** — A stationarity test whose null is stationarity, complementing the ADF test whose null is a unit root. See [Unit Roots](/stat-methods/unit-roots).
- **Kurtosis** — The fourth standardised moment; excess kurtosis measures tail weight relative to a normal distribution. See [Expectation & Variance](/quant-math/expectation-variance).
- **Kyle's lambda** — The slope of price against signed order flow; a direct estimate of impact per unit of volume. See [Liquidity and Depth as Features](/signals/liquidity).

---

#### L

- **Labelling** — Defining the target a model predicts: the horizon, the threshold, and the barriers that resolve it. See [Labelling](/ml-finance/labelling).
- **Lasso** — Regression with an L1 penalty, which shrinks coefficients and sets some exactly to zero. See [Regularisation Under Low Signal-to-Noise](/ml-finance/regularisation).
- **Latency** — The elapsed time from market event to order arrival; on a shared queue it determines who is picked off. See [Latency Risk](/microstructure/latency-risk).
- **Law of large numbers** — The sample mean converges to the population mean as the sample grows. See [LLN & CLT](/quant-math/lln-clt).
- **Lending market** — A pool that matches depositors and borrowers algorithmically, with rates set by utilisation. See [Lending & Borrowing](/building-blocks/lending-borrowing).
- **Leverage** — Position notional relative to equity. It scales both return and the distance to liquidation. See [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).
- **Limit order** — An order to trade at a stated price or better, which supplies liquidity and accepts queue and adverse-selection risk. See [Order Types](/execution/order-types).
- **Liquidation** — Forced closure of a position whose margin has fallen below the maintenance requirement. See [Liquidations](/building-blocks/liquidations).
- **Liquidity pool** — Reserves deposited into an AMM contract, against which trades execute at invariant-determined prices. See [Liquidity Pools](/building-blocks/liquidity-pools).
- **Liquid staking token** — A transferable claim on staked assets and their rewards, tradable while the underlying stake remains bonded. See [Staking & Restaking](/protocols/staking-restaking).
- **Log return** — `ln(P_t / P_{t-1})`. Additive across time, which makes it the natural unit for modelling. See [Returns](/quant-math/returns).
- **Lookahead bias** — Using information in a backtest that was not available at the simulated decision time. See [Data Preparation for Backtests](/simulation/data-prep).
- **Lookback option** — An option whose payoff references the running maximum or minimum of the underlying. See [Exotic Options](/derivatives/exotics).
- **Loss given default (LGD)** — One minus the recovery rate: the fraction of exposure lost when a borrower defaults. See [Recovery Rates](/credit/recovery-rates).

---

#### M

- **MACD** — The difference between a fast and a slow exponential moving average, itself smoothed to produce a signal line. See [MACD](/signals/macd).
- **Maker and taker** — The passive side that posts liquidity and the aggressive side that removes it; fee schedules usually treat them differently. See [Fees & Routing](/microstructure/fees-routing).
- **Margin** — Collateral posted against a derivative position, split into initial and maintenance requirements. See [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation).
- **Market impact** — The price movement caused by your own trading, split into a temporary component that decays and a permanent one that does not. See [Market Impact](/execution/market-impact).
- **Market making** — Quoting two-sided prices and earning the spread, against inventory risk and adverse selection. See [Market Making Lite](/strategies/mm-lite).
- **Markout** — The signed mid-price move a fixed interval after a fill; the standard measure of whether flow was toxic. See [Adverse Selection](/execution/adverse-selection).
- **Markov switching** — A model whose parameters jump between regimes according to a Markov transition matrix. See [Markov Switching Models](/regimes-macro/markov-switching).
- **Martingale** — A process whose conditional expectation of the future equals its current value; the formal statement of "no predictable drift". See [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations).
- **Maximum drawdown** — The worst peak-to-trough decline observed in a sample. A single order statistic, and therefore very noisy. See [Drawdown](/quant-math/drawdown).
- **Mean reversion** — The tendency of a series to be pulled back toward a level, implying negative autocorrelation at some horizon. See [Mean Reversion](/quant-math/mean-reversion).
- **Mean-variance optimisation** — Choosing weights to trade expected return against portfolio variance. See [Mean-Variance](/quant-math/mean-variance).
- **Mempool** — The set of pending transactions visible before inclusion in a block, and the raw material for ordering strategies. See [Gas & Mempool](/microstructure/gas-mempool).
- **Merton model** — A structural credit model treating equity as a call option on firm assets struck at the debt face value. See [The Merton Model](/credit/merton-model).
- **Meta-labelling** — A second model that predicts whether a primary signal's trade will be profitable, used to size rather than to choose direction. See [Meta-Labelling](/ml-finance/meta-labelling).
- **MEV (maximal extractable value)** — Value obtainable by choosing the content and order of transactions in a block. See [MEV Overview](/building-blocks/mev-overview).
- **Mid price** — The midpoint of the best bid and offer; the usual reference for measuring spread and slippage. See [Liquidity and Depth as Features](/signals/liquidity).
- **Milstein scheme** — A discretisation of an SDE that adds a derivative-of-diffusion correction, improving strong order to one. See [Numerical Schemes for SDEs](/stochastic-calculus/numerical-schemes).
- **Moneyness** — Where the strike sits relative to spot or forward: in, at, or out of the money. See [Options 101](/derivatives/options-101).
- **Momentum** — The property that past returns predict future returns with the same sign over some horizon. See [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).
- **Moving average** — A rolling mean of price, simple or exponentially weighted, used to suppress high-frequency noise. See [Moving Averages (SMA, EMA)](/signals/moving-averages).
- **Multiple testing** — The problem that testing many hypotheses guarantees false positives at any fixed per-test threshold. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### N

- **Newey–West estimator** — A HAC covariance estimator using Bartlett-weighted autocovariances up to a chosen lag. See [Regression Diagnostics](/stat-methods/regression-diagnostics).
- **No-arbitrage** — The pricing principle that two portfolios with identical payoffs must have identical prices. See [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication).
- **Notional** — The face value a derivative contract references, distinct from the capital required to hold it. See [Futures 101](/markets/futures-101).
- **Numéraire** — The asset in which prices are denominated; changing it changes the pricing measure but not the price. See [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing).

---

#### O

- **On-balance volume (OBV)** — A cumulative sum of volume signed by the day's price direction. See [On-Balance Volume (OBV)](/signals/obv).
- **Open interest** — The number of derivative contracts outstanding; a measure of positioning rather than activity. See [Open Interest and Position Imbalances](/signals/open-interest).
- **Option-adjusted spread (OAS)** — A credit spread computed after stripping out the value of embedded optionality. See [Credit Spreads](/credit/credit-spreads).
- **Oracle** — A mechanism that brings off-chain data on-chain, and a standing dependency for any protocol that prices collateral. See [Oracles](/building-blocks/oracles).
- **Order book** — The set of resting limit orders at each price, matched by price then time priority. See [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms).
- **Order book imbalance** — Normalised difference between bid and ask depth near the touch; a short-horizon directional feature. See [Liquidity and Depth as Features](/signals/liquidity).
- **Ornstein–Uhlenbeck process** — The continuous-time mean-reverting diffusion, with a known conditional mean and variance. See [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck).
- **Overfitting** — Fitting a model to noise, producing in-sample performance that does not survive out of sample. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### P

- **Pairs trading** — Trading the stationary spread between two related assets. See [Pairs Trading and Relative Value](/strategies/pairs).
- **Par yield** — The coupon that would price a bond at par given the current discount curve. See [Yield Curves](/markets/yield-curves).
- **Parkinson estimator** — A volatility estimator built from the high-low range, more efficient than close-to-close for the same sample. See [Volatility](/quant-math/volatility).
- **Participation rate (POV)** — The target share of market volume an execution algorithm consumes. See [TWAP & VWAP](/execution/twap-vwap).
- **Payoff** — The value of a derivative at expiry as a function of the underlying. See [Payoffs & Put-Call Parity](/derivatives/payoffs-parity).
- **Permanent impact** — The component of trade-induced price movement that persists after trading stops. See [Market Impact](/execution/market-impact).
- **Perpetual future** — A futures-like contract with no expiry, anchored to spot by a periodic funding payment. See [Perpetual Futures](/building-blocks/perpetual-futures).
- **Point-in-time data** — Data stored with the timestamp at which each value became known, so restatements cannot leak backwards. See [Reproducible Experiments](/data-tooling/reproducible).
- **Position sizing** — Converting a signal into a notional exposure given risk budget, volatility, and leverage limits. See [Position Sizing](/quant-math/position-sizing).
- **Power (statistical)** — The probability of detecting an effect that is genuinely present. Low power is the usual reason a real edge fails to reach significance. See [Hypothesis Testing](/stat-methods/hypothesis-testing).
- **Principal component analysis (PCA)** — An orthogonal decomposition of a covariance matrix into directions of decreasing variance. See [Principal Component Analysis](/stat-methods/pca).
- **Probability of default (PD)** — The chance a borrower fails to meet its obligations over a stated horizon. Risk-neutral and real-world versions differ. See [Default Probability](/credit/default-probability).
- **Purged cross-validation** — Cross-validation that removes training samples whose label windows overlap the test fold. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).
- **Put-call parity** — The identity linking a call, a put, the underlying, and a discount bond at the same strike and expiry. See [Payoffs & Put-Call Parity](/derivatives/payoffs-parity).
- **p-value** — The probability, under the null, of observing a statistic at least as extreme as the one obtained. Not the probability the null is true. See [Hypothesis Testing](/stat-methods/hypothesis-testing).

---

#### Q

- **Quadratic variation** — The limit of summed squared increments; for Brownian motion over an interval it equals the interval's length. See [Brownian Motion](/stochastic-calculus/brownian-motion).
- **Quote currency** — In a currency pair, the currency in which one unit of the base is priced. See [FX 101](/markets/fx-101).

---

#### R

- **Random walk** — A process whose increments are independent, so the best forecast of the next level is the current level. See [Random Walks](/quant-math/random-walks).
- **Rebalancing** — Trading a portfolio back toward target weights after drift, trading tracking error against cost. See [Rebalancing](/quant-math/rebalancing).
- **Recovery rate** — The fraction of a claim's face value recovered after default. See [Recovery Rates](/credit/recovery-rates).
- **Reduced-form model** — A credit model that treats default as an unpredictable jump with an intensity, rather than deriving it from firm value. See [Reduced-Form Models](/credit/reduced-form-models).
- **Regime** — A persistent state of the market in which parameters are approximately stable; transitions between regimes break fitted models. See [Market Regimes: An Overview](/regimes-macro/regimes-overview).
- **Regularisation** — Adding a penalty on coefficient size to trade a little bias for a large reduction in variance. See [Regularisation Under Low Signal-to-Noise](/ml-finance/regularisation).
- **Restaking** — Reusing staked assets as security for additional services, compounding both yield and correlated slashing risk. See [Staking & Restaking](/protocols/staking-restaking).
- **Ridge regression** — Regression with an L2 penalty, which shrinks all coefficients toward zero without zeroing them. See [Regularisation Under Low Signal-to-Noise](/ml-finance/regularisation).
- **Risk-free rate** — The return available with no default risk over the measurement horizon; the baseline in excess-return statistics. See [Sharpe Ratio](/quant-math/sharpe).
- **Risk-neutral measure** — The probability measure under which discounted tradable prices are martingales. See [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing).
- **Risk reversal** — The implied volatility of a call minus that of a put at symmetric deltas; a measure of skew. See [The Volatility Surface](/derivatives/vol-surface).
- **Roll's spread estimator** — An effective spread inferred from the negative autocovariance of transaction price changes. See [Liquidity and Depth as Features](/signals/liquidity).
- **Roll yield** — The return earned or paid when a futures position is rolled along the curve. See [Roll and Carry](/markets/roll-and-carry).
- **Rolling window** — Recomputing a statistic over a fixed-length trailing window, trading responsiveness against estimation noise. See [Rolling Windows](/quant-math/rolling-windows).
- **RPV01** — The risky annuity: the present value of one unit of CDS premium, weighted by survival probability. See [Credit Default Swaps](/credit/cds).
- **RSI (relative strength index)** — An oscillator mapping the ratio of average gains to average losses onto a 0–100 scale. See [Relative Strength Index (RSI)](/signals/rsi).
- **R-squared** — The share of variance in the dependent variable explained by the regression. See [Linear Regression](/stat-methods/linear-regression).

---

#### S

- **Sample weight** — A per-observation weight used to downweight overlapping or low-information samples during fitting. See [Labelling](/ml-finance/labelling).
- **Sandwich attack** — Placing a transaction before and after a victim's trade to profit from the price move it causes. See [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy).
- **Sharpe ratio** — Excess return per unit of volatility, conventionally annualised. See [Sharpe Ratio](/quant-math/sharpe).
- **Short selling** — Selling a borrowed asset, incurring a borrow fee and an unbounded loss profile. See [Short Selling](/markets/short-selling).
- **Signal** — A function of information available at time `t` intended to predict a future return. See [What Is a Trading Signal?](/signals/what-is-signal).
- **Skew (distribution)** — The third standardised moment; asymmetry of the return distribution. See [Expectation & Variance](/quant-math/expectation-variance).
- **Skew (volatility)** — The slope of implied volatility across strikes at fixed maturity. See [The Volatility Surface](/derivatives/vol-surface).
- **Slippage** — The difference between the reference price at decision time and the achieved execution price. See [Slippage](/microstructure/slippage).
- **Smart order routing** — Splitting an order across venues to minimise total cost including fees, rebates, and signalling. See [Smart Order Routing](/execution/smart-order-routing).
- **Sortino ratio** — Excess return per unit of downside deviation, penalising only returns below a target. See [Sortino Ratio](/quant-math/sortino).
- **Spread (bid-ask)** — The difference between the best offer and the best bid; the immediate cost of a round trip. See [Liquidity and Depth as Features](/signals/liquidity).
- **Square-root law** — The empirical regularity that impact scales roughly with the square root of order size relative to volume. See [Market Impact](/execution/market-impact).
- **Stablecoin** — A token designed to hold a stable value against a reference, by full backing, overcollateralisation, or hedging. See [Stablecoins](/building-blocks/stablecoins).
- **Stationarity** — The property that a series' distribution does not shift over time. Most inference assumes it; most price series lack it. See [Stationarity](/quant-math/stationarity).
- **Stochastic differential equation (SDE)** — An equation specifying a process through its drift and diffusion coefficients. See [Stochastic Differential Equations](/stochastic-calculus/sdes).
- **Stochastic oscillator** — An indicator placing the close within its recent high-low range. See [Stochastic Oscillator](/signals/stochastic).
- **Stop-loss** — A rule that exits a position after an adverse move of a stated size. It truncates the loss distribution and introduces its own skew. See [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss).
- **Structural model** — A credit model that derives default from the evolution of firm value against a liability barrier. See [The Merton Model](/credit/merton-model).
- **Survival probability** — The probability a reference entity has not defaulted by a given date. See [Default Probability](/credit/default-probability).
- **Survivorship bias** — Estimating from a universe that excludes entities which failed or delisted, flattering every statistic. See [Market Data Sources](/data-tooling/data-sources).

---

#### T

- **Term structure** — How a quantity — rate, volatility, spread — varies with maturity. See [The Term Structure of Volatility](/derivatives/vol-term-structure).
- **Theta** — The rate at which an option loses value with the passage of time. See [The Greeks](/derivatives/greeks).
- **Tick** — The minimum price increment of an instrument; also, in AMM design, a discrete price level bounding a liquidity range. See [Futures 101](/markets/futures-101).
- **Time value** — The part of an option premium above intrinsic value, reflecting remaining optionality. See [Options 101](/derivatives/options-101).
- **Total variance** — Implied variance multiplied by time to maturity, `sigma^2 * T`; the quantity that must not decrease with maturity. See [The Volatility Surface](/derivatives/vol-surface).
- **Tracking error** — The volatility of return differences against a benchmark. See [Equity Indices](/markets/equity-indices).
- **Trailing stop** — A stop level that ratchets in the favourable direction as the position gains. See [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss).
- **Transaction cost analysis (TCA)** — Measuring realised trading costs against benchmarks, with enough samples to separate signal from noise. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Triple-barrier method** — Labelling a sample by which of a profit target, a stop, or a time limit is touched first. See [Labelling](/ml-finance/labelling).
- **t-statistic** — An estimate divided by its standard error, compared against a reference distribution. See [Hypothesis Testing](/stat-methods/hypothesis-testing).
- **Turnover** — Traded notional relative to capital over a period; the multiplier that converts per-trade cost into performance drag. See [Rebalancing](/quant-math/rebalancing).
- **TWAP** — Time-weighted average price: both an execution schedule and a benchmark, and also a common on-chain oracle construction. See [TWAP & VWAP](/execution/twap-vwap).

---

#### U

- **Unit root** — A characteristic root of one, meaning shocks are permanent and the series does not revert. See [Unit Roots](/stat-methods/unit-roots).
- **Upfront payment** — The lump sum exchanged at CDS inception when the standard coupon differs from the par spread. See [Credit Default Swaps](/credit/cds).
- **Utilisation** — Borrowed amount as a share of supplied amount in a lending pool; the input to the interest rate curve. See [Lending Architecture](/protocols/lending-architecture).

---

#### V

- **Value at Risk (VaR)** — A loss quantile over a horizon: the level exceeded with a stated small probability. See [VaR & CVaR](/quant-math/var-cvar).
- **vAMM** — A virtual AMM used by some perpetual venues to determine price from a synthetic invariant without holding real reserves. See [Perp DEX](/protocols/perp-dex).
- **Variance ratio** — The variance of `q`-period returns divided by `q` times the one-period variance; one under a random walk. See [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).
- **Variance swap** — A contract paying the difference between realised variance and a strike, replicable from a strip of options. See [Variance Swaps](/derivatives/variance-swaps).
- **Vega** — Sensitivity of an option's value to implied volatility. See [The Greeks](/derivatives/greeks).
- **Volatility** — The standard deviation of returns over a period, usually annualised. See [Volatility](/quant-math/volatility).
- **Volatility clustering** — The tendency of large moves to follow large moves, motivating GARCH-type models. See [GARCH Models](/stat-methods/garch).
- **Volatility surface** — Implied volatility as a function of strike and maturity. See [The Volatility Surface](/derivatives/vol-surface).
- **Volatility targeting** — Scaling exposure inversely to an estimate of volatility to hold portfolio risk roughly constant. See [Dynamic Position Sizing with Volatility](/strategies/dynamic-sizing).
- **VWAP** — Volume-weighted average price; the standard benchmark for scheduled execution. See [TWAP & VWAP](/execution/twap-vwap).

---

#### W

- **Walk-forward analysis** — Repeatedly fitting on a trailing window and testing on the period immediately after it. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).
- **Whipsaw** — A sequence of false signals in a choppy market that produces repeated small losses. See [Moving Average Crossovers](/signals/ma-crossovers).
- **Wiener process** — The formal name for standard Brownian motion. See [Brownian Motion](/stochastic-calculus/brownian-motion).
- **Wilder's smoothing** — A recursive average with `alpha = 1 / n`, equivalent to an exponential average of span `2n - 1`. Frequently confused with an EMA of span `n`. See [Relative Strength Index (RSI)](/signals/rsi).

---

#### Y

- **Yield curve** — The relationship between yield and maturity for a given issuer or reference rate. See [Yield Curves](/markets/yield-curves).
- **Yield farming** — Earning protocol emissions for supplying liquidity or collateral, on top of any organic return. See [Yield Farming](/building-blocks/yield-farming).
- **Yield to maturity** — The single discount rate that equates a bond's cash flows to its price. See [Fixed Income 101](/markets/fixed-income-101).

---

#### Z

- **Z-score** — An observation expressed in standard deviations from its rolling or sample mean. See [Bollinger Bands](/signals/bollinger).
- **Z-spread** — The constant spread added to every point of the discount curve that reprices a bond to market. See [Credit Spreads](/credit/credit-spreads).
- **Zero-coupon bond** — A bond with a single terminal payment; its price is the discount factor for that date. See [Curve Construction](/markets/curve-construction).

---

#### See Also

* [Notation Reference](/reference/notation)
* [Formula Reference](/reference/formulas)
* [Metric Index](/reference/metric-index)
* [Indicator Index](/reference/indicators)
* [Protocol Archetypes](/reference/protocols)
* [Resources](/reference/resources)

---
