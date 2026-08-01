### Indicator Index

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Moving Averages | Tags: reference, indicators, signals, technical-analysis, lookup

Every technical indicator and market-data feature covered on Arth, in one place: what it measures, its formula in brief, the parameters people conventionally use, and a link to the page that treats it properly.

An **indicator** is a quantity computed from market data — price, volume, order book, open interest — that is intended to say something about the *current state of the market*. It is an input to a decision, not a verdict on one.

> info **Indicators versus metrics** Indicators are computed from market data and feed into a strategy. Metrics evaluate a strategy's *results* — Sharpe, drawdown, turnover, capacity. For those, see the [Metric Index](/reference/metric-index). An indicator tells you what the market is doing; a metric tells you whether what you did to it worked.

---

#### Trend

<table>
  <tbody>
    <tr>
      <td><strong>Indicator</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>Typical parameters</strong></td>
    </tr>
    <tr>
      <td>Simple moving average (SMA)</td>
      <td>The average price over a fixed window; a low-pass filter on price</td>
      <td><code>SMA_n(t) = (1/n) * sum P over the last n bars</code></td>
      <td>n from 10 to 200 depending on horizon</td>
    </tr>
    <tr>
      <td>Exponential moving average (EMA)</td>
      <td>A weighted average with geometrically decaying weights, more responsive than an SMA of the same length</td>
      <td><code>EMA_n(t) = a*P_t + (1-a)*EMA_n(t-1)</code>, <code>a = 2/(n+1)</code></td>
      <td>Span n; a is derived, not chosen</td>
    </tr>
    <tr>
      <td>Moving average crossover</td>
      <td>Whether a fast average sits above or below a slow one; a sign-of-trend rule</td>
      <td><code>D(t) = MA_fast(t) - MA_slow(t)</code></td>
      <td>Fast and slow lengths, commonly 50 and 200</td>
    </tr>
    <tr>
      <td>MACD line</td>
      <td>The gap between a fast and a slow EMA, expressed in price units</td>
      <td><code>MACD_t = EMA(P, n_f) - EMA(P, n_s)</code></td>
      <td>n_f 12, n_s 26 by convention</td>
    </tr>
    <tr>
      <td>MACD signal and histogram</td>
      <td>A smoothed MACD, and the gap between the two, which turns before the line does</td>
      <td><code>Signal = EMA(MACD, n_g)</code>, <code>Hist = MACD - Signal</code></td>
      <td>n_g 9 by convention</td>
    </tr>
    <tr>
      <td>Price momentum</td>
      <td>Cumulative return over a lookback, the simplest trend measure of all</td>
      <td><code>M_t(k) = P_t / P_lag_k - 1</code></td>
      <td>k from 1 to 12 months; often skipping the most recent period</td>
    </tr>
  </tbody>
</table>

Pages: [Moving Averages (SMA, EMA)](/signals/moving-averages), [Moving Average Crossovers](/signals/ma-crossovers), [MACD](/signals/macd), [Simple Momentum on Price](/strategies/momentum).

> warning **The MACD defaults have no analytical basis** 12, 26 and 9 were chosen for a six-day trading week that no longer exists. They persist because they are defaults, which makes them a focal point rather than an edge. See [MACD](/signals/macd).

---

#### Oscillators

<table>
  <tbody>
    <tr>
      <td><strong>Indicator</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>Typical parameters</strong></td>
    </tr>
    <tr>
      <td>Relative strength index (RSI)</td>
      <td>The ratio of average gains to average losses, mapped onto a bounded 0 to 100 scale</td>
      <td><code>RSI = 100 - 100/(1 + AvgGain/AvgLoss)</code></td>
      <td>n = 14, Wilder smoothing; bands at 30 and 70</td>
    </tr>
    <tr>
      <td>Stochastic oscillator, raw %K</td>
      <td>Where the close sits within its recent high-low range</td>
      <td><code>%K = 100 * (C_t - L_n)/(H_n - L_n)</code></td>
      <td>n = 14, then a 3-period smoothing of %K</td>
    </tr>
    <tr>
      <td>Stochastic %D</td>
      <td>A moving average of %K, used as the slower comparison line</td>
      <td><code>%D = SMA_d(%K)</code></td>
      <td>d = 3</td>
    </tr>
    <tr>
      <td>Bollinger %b</td>
      <td>Position of price within the bands, on a 0 to 1 scale</td>
      <td><code>%b = (P - Lower)/(Upper - Lower)</code></td>
      <td>Inherits the band parameters</td>
    </tr>
    <tr>
      <td>Rolling z-score</td>
      <td>How far the current value sits from its own recent mean, in standard deviations</td>
      <td><code>z_t = (x_t - mean_n(x))/sd_n(x)</code></td>
      <td>n set by the horizon being traded</td>
    </tr>
  </tbody>
</table>

Pages: [Relative Strength Index (RSI)](/signals/rsi), [Stochastic Oscillator](/signals/stochastic), [Bollinger Bands](/signals/bollinger), [Feature Engineering for Financial Data](/ml-finance/feature-engineering).

---

#### Volatility and Range

<table>
  <tbody>
    <tr>
      <td><strong>Indicator</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>Typical parameters</strong></td>
    </tr>
    <tr>
      <td>True range</td>
      <td>The bar's full range including any overnight gap</td>
      <td><code>TR = max(H-L, |H-C_prev|, |L-C_prev|)</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td>Average true range (ATR)</td>
      <td>Smoothed true range; a volatility measure in price units, used for sizing and stops</td>
      <td><code>ATR_n(t) = ((n-1)*ATR_n(t-1) + TR_t)/n</code></td>
      <td>n = 14, Wilder smoothing</td>
    </tr>
    <tr>
      <td>ATR percentage</td>
      <td>ATR normalised by price, making it comparable across instruments</td>
      <td><code>ATRP = 100 * ATR_t / C_t</code></td>
      <td>Inherits n</td>
    </tr>
    <tr>
      <td>Bollinger Bands</td>
      <td>A moving average with envelopes at a fixed number of rolling standard deviations</td>
      <td><code>Upper = SMA_n + k*sigma_n</code>, <code>Lower = SMA_n - k*sigma_n</code></td>
      <td>n = 20, k = 2</td>
    </tr>
    <tr>
      <td>Bollinger bandwidth</td>
      <td>Band width relative to the middle line; a compression and expansion measure</td>
      <td><code>Bandwidth = 2*k*sigma_n / SMA_n</code></td>
      <td>Inherits n and k</td>
    </tr>
    <tr>
      <td>Realised volatility</td>
      <td>Standard deviation of returns over a window, annualised for comparison</td>
      <td><code>sigma_ann = sigma_period * sqrt(periods_per_year)</code></td>
      <td>n from 20 to 252</td>
    </tr>
    <tr>
      <td>EWMA volatility</td>
      <td>Recursive volatility estimate that reacts faster to shocks than a rolling window</td>
      <td><code>sigma^2_t = lambda*sigma^2_prev + (1-lambda)*r^2_prev</code></td>
      <td>lambda around 0.94 for daily data is a common starting point</td>
    </tr>
    <tr>
      <td>Parkinson estimator</td>
      <td>Volatility inferred from the high-low range rather than closes</td>
      <td><code>sigma^2 = (1/(4 ln 2)) * (ln(H/L))^2</code></td>
      <td>None; averaged over a window</td>
    </tr>
  </tbody>
</table>

Pages: [Average True Range (ATR)](/signals/atr), [Bollinger Bands](/signals/bollinger), [Volatility](/quant-math/volatility), [Rolling Windows](/quant-math/rolling-windows).

> warning **Wilder's smoothing is not an EMA of span n** Wilder's recursion uses `alpha = 1/n`, which corresponds to an EMA of span `2n - 1`. Passing the period straight into an EMA function is the most common indicator bug in circulation, and it affects both RSI and ATR. See [Average True Range (ATR)](/signals/atr).

---

#### Volume and Flow

<table>
  <tbody>
    <tr>
      <td><strong>Indicator</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>Typical parameters</strong></td>
    </tr>
    <tr>
      <td>Volume-weighted average price (VWAP)</td>
      <td>The average price at which the market actually traded</td>
      <td><code>VWAP = sum(P_i * V_i)/sum(V_i)</code></td>
      <td>Session, day, or rolling window</td>
    </tr>
    <tr>
      <td>Dollar volume</td>
      <td>Traded value rather than share count; comparable across price levels</td>
      <td><code>DV_t = P_t * V_t</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td>Relative volume (RVOL)</td>
      <td>Current volume against its own recent typical level</td>
      <td><code>RVOL_t = V_t / median(V over previous n)</code></td>
      <td>n = 20 is common; median resists spikes</td>
    </tr>
    <tr>
      <td>Volume z-score</td>
      <td>Volume standardised against its own recent distribution</td>
      <td><code>z_t = (V_t - mean_n(V))/sd_n(V)</code></td>
      <td>n = 20 to 60</td>
    </tr>
    <tr>
      <td>On-balance volume (OBV)</td>
      <td>Cumulative volume signed by the direction of the close; an accumulation proxy</td>
      <td><code>OBV_t = OBV_prev + sign(C_t - C_prev) * V_t</code></td>
      <td>None; sometimes smoothed with an SMA</td>
    </tr>
  </tbody>
</table>

Pages: [Volume and Liquidity-Aware Indicators](/signals/volume), [On-Balance Volume (OBV)](/signals/obv), [TWAP & VWAP](/execution/twap-vwap).

---

#### Liquidity and Order Book

These are computed from quotes and trades rather than bars, and they are the closest thing on this page to a direct measurement of execution cost.

<table>
  <tbody>
    <tr>
      <td><strong>Indicator</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>Typical parameters</strong></td>
    </tr>
    <tr>
      <td>Quoted spread</td>
      <td>The immediate round-trip cost of crossing</td>
      <td><code>Spread_bps = 10000*(P_ask - P_bid)/Mid</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td>Depth within a band</td>
      <td>Size available within a chosen distance of the mid</td>
      <td><code>D_bid(delta)</code>, <code>D_ask(delta)</code></td>
      <td>delta in basis points or ticks</td>
    </tr>
    <tr>
      <td>Order book imbalance (OBI)</td>
      <td>Which side of the book is heavier; a short-horizon directional feature</td>
      <td><code>OBI = (D_bid - D_ask)/(D_bid + D_ask)</code></td>
      <td>Depth band and refresh frequency</td>
    </tr>
    <tr>
      <td>Kyle's lambda</td>
      <td>Price impact per unit of signed order flow</td>
      <td><code>lambda = sum(x_k * dP_k)/sum(x_k^2)</code></td>
      <td>Bucketing interval for signed flow</td>
    </tr>
    <tr>
      <td>Amihud illiquidity (ILLIQ)</td>
      <td>Daily-data proxy for impact: absolute return per unit of traded value</td>
      <td><code>ILLIQ = mean(|R_t| / DollarVolume_t)</code></td>
      <td>Averaging window, often a month or a year</td>
    </tr>
    <tr>
      <td>Roll's spread estimator</td>
      <td>Effective spread inferred from bid-ask bounce in transaction prices</td>
      <td><code>Roll = 2*sqrt(-Cov(dP_t, dP_prev))</code></td>
      <td>Estimation window; undefined when the autocovariance is positive</td>
    </tr>
    <tr>
      <td>Realised slippage</td>
      <td>Achieved price against a reference, the empirical counterpart to all of the above</td>
      <td><code>slippage_bps = 10000*side*(P_exec - P_ref)/P_ref</code></td>
      <td>Choice of reference price</td>
    </tr>
  </tbody>
</table>

Pages: [Liquidity and Depth as Features](/signals/liquidity), [Slippage](/microstructure/slippage), [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms), [Market Impact](/execution/market-impact).

---

#### Derivatives and Positioning

<table>
  <tbody>
    <tr>
      <td><strong>Indicator</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>Typical parameters</strong></td>
    </tr>
    <tr>
      <td>Futures basis</td>
      <td>How far the futures price sits from spot; the market price of carry</td>
      <td><code>Basis = F - S</code>, <code>Basis_pct = (F - S)/S</code></td>
      <td>Chosen expiry</td>
    </tr>
    <tr>
      <td>Annualised basis</td>
      <td>Basis put on a comparable yearly footing across expiries</td>
      <td><code>Basis_annual = Basis_pct * 365/days_to_expiry</code></td>
      <td>Day-count convention</td>
    </tr>
    <tr>
      <td>Implied financing rate</td>
      <td>The rate the futures curve is charging to hold the position</td>
      <td><code>r_implied = ln(F/S)/T + y</code></td>
      <td>Yield or convenience yield assumption</td>
    </tr>
    <tr>
      <td>Calendar spread</td>
      <td>The shape of the curve rather than its level</td>
      <td><code>Spread = F_2 - F_1</code></td>
      <td>Pair of expiries</td>
    </tr>
    <tr>
      <td>Perpetual premium</td>
      <td>How far the perpetual mark sits from its index</td>
      <td><code>Premium_t = (Mark_t - Index_t)/Index_t</code></td>
      <td>Sampling frequency within the funding interval</td>
    </tr>
    <tr>
      <td>Funding rate</td>
      <td>The periodic payment between longs and shorts; a direct read on crowded positioning</td>
      <td><code>Payment = Notional * F</code></td>
      <td>Interval and cap are venue-specific</td>
    </tr>
    <tr>
      <td>Annualised funding</td>
      <td>Funding scaled to a yearly rate for comparison against carry elsewhere</td>
      <td><code>F_annual = F * intervals_per_day * 365</code></td>
      <td>Simple or compounded convention</td>
    </tr>
    <tr>
      <td>Open interest</td>
      <td>Contracts outstanding; positioning rather than activity</td>
      <td><code>NotionalOI = OI * multiplier * Price</code></td>
      <td>None</td>
    </tr>
    <tr>
      <td>Volume-to-open-interest turnover</td>
      <td>Whether activity reflects new positioning or churn among existing holders</td>
      <td><code>Turnover_t = Volume_t / OI_t</code></td>
      <td>None</td>
    </tr>
  </tbody>
</table>

Pages: [Basis and Term Structure Signals](/signals/basis), [Funding Rate as a Signal](/signals/funding-rate), [Open Interest and Position Imbalances](/signals/open-interest), [Calendar Spreads](/markets/calendar-spreads).

---

#### Statistical Diagnostics

These are not trading rules. They tell you which *kind* of indicator has any chance of working on a given series.

<table>
  <tbody>
    <tr>
      <td><strong>Diagnostic</strong></td>
      <td><strong>What it measures</strong></td>
      <td><strong>Formula in brief</strong></td>
      <td><strong>How to read it</strong></td>
    </tr>
    <tr>
      <td>Autocorrelation at lag k</td>
      <td>Whether returns depend on their own past</td>
      <td><code>rho_k = gamma_k / gamma_0</code></td>
      <td>Positive suggests trend, negative suggests reversal</td>
    </tr>
    <tr>
      <td>Variance ratio</td>
      <td>Whether multi-period variance scales linearly, as a random walk requires</td>
      <td><code>VR(q) = Var(q-period)/(q * Var(1-period))</code></td>
      <td>Above one is trending, below one is reverting, one is a random walk</td>
    </tr>
    <tr>
      <td>Ljung-Box statistic</td>
      <td>Joint test that the first h autocorrelations are all zero</td>
      <td><code>Q = n(n+2) * sum rho_k^2/(n-k)</code></td>
      <td>Large values reject the no-dependence null</td>
    </tr>
    <tr>
      <td>Information coefficient</td>
      <td>Correlation between a signal and the return that follows it</td>
      <td><code>IC = corr(s_t, R_next)</code></td>
      <td>Small values are normal; the sample size is what makes them credible</td>
    </tr>
    <tr>
      <td>Mean-reversion half-life</td>
      <td>How long a deviation takes to decay by half</td>
      <td><code>half_life = ln(0.5)/ln(phi)</code></td>
      <td>Sets the natural lookback for a reversion indicator</td>
    </tr>
  </tbody>
</table>

Pages: [Autocorrelation](/quant-math/autocorrelation), [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion), [What Is a Trading Signal?](/signals/what-is-signal), [Ornstein-Uhlenbeck Process](/stochastic-calculus/ornstein-uhlenbeck).

---

#### On-Chain Activity

On-chain data offers indicator inputs that have no equivalent in traditional venues: transfer counts, active addresses, pool reserves and their imbalance, gas prices, and per-block liquidity changes. Because the ledger is public, these are measured directly rather than estimated. Because chains differ in throughput and cost, the same measure is rarely comparable across them.

Pages: [On-Chain Activity Signals](/signals/onchain-activity), [Gas & Mempool](/microstructure/gas-mempool), [Wallet Analytics](/data-tooling/wallet-analytics), [Event Logs and Decoding](/data-tooling/event-logs).

---

#### Parameter Conventions and Where They Break

- **Defaults are conventions, not optima.** RSI(14), MACD(12, 26, 9), Bollinger(20, 2) and ATR(14) are inherited from a pre-computer era. Their persistence makes them focal points that many participants watch, which is a different property from predictive power.
- **Smoothing method changes the number more than the period does.** An RSI(14) computed with Wilder's smoothing, an EMA of span 14, and an SMA of 14 are three different series shipping under one name.
- **Population versus sample standard deviation.** Bollinger's original definition divides by `n`; most libraries default to `n - 1`. At `n = 20` the bands differ by roughly 2.6%, which is enough to change whether a touch registers.
- **Bar construction determines the indicator.** Time bars, tick bars, and volume bars produce different values for the same rule on the same data. Say which you used.
- **Indicators inherit the gaps in the data.** Corporate actions, session boundaries, and stale quotes propagate straight into every derived series. See [Cleaning and Resampling Market Data](/data-tooling/cleaning).

> warning **Optimising indicator parameters is where most overfitting happens** A grid over two lengths and a threshold is already hundreds of trials, and the best of them will look good by construction. See [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps) and [Multiple Testing](/stat-methods/multiple-testing).

---

#### See Also

* [What Is a Trading Signal?](/signals/what-is-signal)
* [Metric Index](/reference/metric-index)
* [Formula Reference](/reference/formulas)
* [Formula Cheat Sheet](/reference/formula-cheatsheet)
* [Code Snippets](/reference/code-snippets)
* [Glossary](/reference/glossary)

---
