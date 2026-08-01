### Benchmark: Buy and Hold vs Do Nothing

> info **Metadata** Level: Beginner | Prerequisites: Returns, Volatility, Sharpe Ratio | Tags: benchmark, passive, risk-premium, compounding, attribution

Buy and hold is the strategy of taking a position and not changing it. It has no signal, no parameters, and no turnover, which is exactly what makes it the reference point against which every active rule must be measured. If a strategy cannot beat the thing that requires no decisions, its complexity has bought nothing.

It is also more than a straw man. Buy and hold is the pure form of a genuine economic claim: that bearing undiversifiable risk in an asset is compensated over time, and that the compensation accrues to whoever simply holds. Understanding which assets carry such a premium, and which merely fluctuate, is the difference between a benchmark and a bet.

> warning **Not Financial Advice** This page explains why passive holding functions as a benchmark and where that reasoning fails. It is not a recommendation to buy or hold anything.

---

#### Why It Might Work: The Economic Rationale

The argument for buy and hold rests on **risk compensation**, not on price prediction.

An equity is a residual claim on a firm's cash flows. Those cash flows are uncertain, and — critically — that uncertainty is worst precisely when investors can least afford it, during recessions when jobs and other assets are also under strain. Investors therefore demand a price low enough that expected returns exceed the risk-free rate. That gap is the **equity risk premium**, and it is earned by exposure, not by timing. A corporate bond pays a spread over government debt for default and illiquidity risk; the same logic applies. In each case, the holder is a supplier of risk-bearing capacity and is paid a rent for it.

Two consequences follow, and they mark the boundary of the argument:

- **The premium is a payment for pain, not a free gift.** It is realised on average, over long horizons, and the path includes deep drawdowns. A holder who is forced to liquidate during one does not collect it. This is why holding period and funding stability are part of the strategy, not incidental to it.
- **Not every asset has one.** An instrument that is a pure zero-sum claim against another participant — a currency pair, a futures position with no hedging-pressure asymmetry, a token with no cash flow and no scarcity-driven demand for risk-bearing — has no structural reason to reward passive holding. Buying and holding it is a directional forecast wearing the costume of a benchmark.

The second point is the one most often skipped. "Buy and hold outperformed" for an asset whose price happened to rise over the sample is not evidence of a premium; it is a statement about the sample.

---

#### Formal Definition

The position is constant:

```text
w_t = 1  for all t
```

Terminal wealth after `n` periods, starting from `W_0`:

```text
W_n = W_0 * prod_{t=1..n} (1 + R_t)
```

The compounded (geometric) growth rate per period is:

```text
g = (W_n / W_0)^(1/n) - 1
```

and it is *not* the average of the periodic returns. For returns with mean `mu` and variance `sigma^2`, a standard approximation is:

```text
g  ~=  mu - sigma^2 / 2
```

where the `sigma^2 / 2` term is **variance drag**: the mechanical cost of compounding a volatile series. It is the reason two assets with identical average returns and different volatilities do not produce identical wealth.

To attribute an active strategy against the benchmark, regress strategy returns on benchmark returns:

```text
R_strat,t = alpha + beta * R_bench,t + e_t
```

where:

- `beta` measures how much of the strategy is simply the benchmark in disguise
- `alpha` is the part of the return not explained by that exposure
- `e_t` is the residual

An active rule that is long the underlying 70% of the time will show a beta near 0.7. The relevant question is whether its `alpha` is distinguishable from zero after costs — not whether it made money. See [Linear Regression](/stat-methods/linear-regression).

---

#### Worked Example: Arithmetic and Geometric Are Different Numbers

An asset produces three annual returns. All figures are illustrative arithmetic, not measured results.

<table>
  <tbody>
    <tr><td><strong>Year</strong></td><td>1</td><td>2</td><td>3</td></tr>
    <tr><td><strong>Return</strong></td><td>+40%</td><td>-25%</td><td>+15%</td></tr>
  </tbody>
</table>

1. **Arithmetic mean**: `(0.40 - 0.25 + 0.15) / 3 = 0.10`, so 10% per year.
2. **Terminal wealth multiple**: `1.40 * 0.75 * 1.15 = 1.2075`.
3. **Geometric (compounded) return**: `1.2075^(1/3) - 1 = 0.0649`, so 6.49% per year.
4. **Variance drag check**: the population variance of the three returns is 0.0717, so `sigma^2 / 2 = 0.0358`, and `0.10 - 0.0358 = 0.0642` — close to the exact 6.49%, as the approximation predicts.

The 3.5 percentage-point gap between 10% and 6.49% is not a rounding artefact. It is what a buy-and-hold holder actually experienced, and it grows with volatility. A strategy that reduces volatility while capturing most of the drift can beat buy and hold on compounded return even with a *lower* arithmetic mean — which is the honest case for active risk management, and quite different from the usual case made for it.

**Now the comparison that matters.** Suppose an active rule is invested 60% of the time, flips position 12 times a year, and captures the asset's drift only while invested. Ignoring any timing skill, its expected arithmetic return is `0.60 * 0.10 = 0.06`. If each flip trades 2.0 units of notional at 10 basis points one-way, annual cost drag is `24 * 0.0010 = 0.024`. Expected net return is `0.06 - 0.024 = 0.036`. The rule must generate 6.4 percentage points of genuine timing value per year merely to draw level with doing nothing. That is the hurdle, and it is why the benchmark is not a formality.

---

#### In Practice Across Asset Classes

"Buy and hold" is only unambiguous for instruments that exist indefinitely and require no action. Most do not.

**Equities.** The benchmark must be a *total return* series including reinvested dividends; a price index understates the passive result materially over long horizons. Index membership changes, so a "buy and hold the index" series embeds periodic mechanical trades. Holding a single stock is not the same claim as holding the market — the idiosyncratic risk it carries is diversifiable and therefore, in theory, uncompensated. See [Equities 101](/markets/equities-101) and [Equity Indices](/markets/equity-indices).

**Futures.** There is no passive position. Contracts expire, so holding exposure requires rolling, and the roll's cost or gain is a first-order part of the return. A "buy and hold commodity" series is really a fully collateralised rolling futures programme, and its return decomposes into the collateral yield, the spot move, and the roll. See [Roll and Carry](/markets/roll-and-carry) and [Futures 101](/markets/futures-101).

**Fixed income.** Holding a bond to maturity converts price volatility into a known nominal outcome — the yield at purchase, absent default. Holding a bond *fund* does not, because the fund continuously rolls to maintain duration. These are different strategies with the same name. See [Duration and Convexity](/markets/duration-convexity).

**FX.** A held currency position earns the interest rate differential and nothing else structurally. Whether that constitutes a premium or merely a compensation for crash risk is exactly the carry-trade debate. See [FX Carry and Parity](/markets/fx-carry-parity).

**Credit.** The passive return is the spread minus realised default losses. Both legs matter, and the second arrives in clusters, so short samples systematically flatter the strategy. See [Credit Spreads](/credit/credit-spreads).

**On-chain assets.** Holding a token has no cash flow and no contractual claim, so the case rests entirely on demand for the asset itself. Staking or lending it introduces protocol and smart-contract risk, converting a passive position into an active one. Comparing a liquidity-provision strategy against holding the two tokens is the standard and correct benchmark, because [Impermanent Loss](/building-blocks/impermanent-loss) is defined relative to exactly that.

---

#### Assumptions and Failure Modes

- **Assumes a positive risk premium exists in the asset.** Where it does not, buy and hold is a directional bet with no compensation mechanism, and the benchmark framing is misleading.
- **Assumes the holder can survive the path.** Leverage, redemptions, margin, or personal liquidity needs can force a sale mid-drawdown. The premium accrues to the survivor, not to the position. See [Drawdown](/quant-math/drawdown).
- **Assumes the index is not survivorship-filtered.** Backwards-constructed universes that quietly exclude delisted, defaulted, or failed constituents overstate the passive result — sometimes by more than the entire margin an active strategy is claiming.
- **Assumes the horizon exceeds the premium's realisation time.** Over a few years, the variance of realised equity returns dwarfs the premium. A ten-year window is not long enough to distinguish an equity premium of a few percent from zero at conventional confidence.
- **Assumes no rebalancing decision.** The moment there are multiple assets, "hold" is ambiguous: constant weights require trading, and constant shares do not. See [Rebalancing](/quant-math/rebalancing).
- **Ignores taxes, custody, and instrument frictions.** Passive is cheap, not free, and the comparison should be net of the same frictions applied to the active alternative.
- **Concentration is not compensated.** Holding one name delivers the volatility of that name without the market's expected return, and the sample of successful concentrated holders is the most survivorship-biased dataset in finance.

> warning **A benchmark is not a recommendation** Buy and hold is the correct null hypothesis for evaluating an active rule. That it is often hard to beat is a statement about active rules, not an argument for any particular allocation.

---

#### Code

```python
import numpy as np


def compounded_growth(returns):
    """Geometric per-period growth rate — what the holder actually earned."""
    returns = np.asarray(returns, dtype=float)
    wealth_multiple = np.prod(1.0 + returns)
    return wealth_multiple ** (1.0 / len(returns)) - 1.0


def variance_drag(returns):
    """Gap between the arithmetic mean and compounded growth."""
    returns = np.asarray(returns, dtype=float)
    return returns.mean() - compounded_growth(returns)


def attribution(strategy_returns, benchmark_returns):
    """Split active returns into benchmark exposure (beta) and residual (alpha).

    A high beta means most of the 'strategy' is the benchmark, and the
    comparison that matters is alpha, not total return.
    """
    strat = np.asarray(strategy_returns, dtype=float)
    bench = np.asarray(benchmark_returns, dtype=float)
    beta = np.cov(strat, bench, ddof=1)[0, 1] / np.var(bench, ddof=1)
    alpha = strat.mean() - beta * bench.mean()
    return alpha, beta
```

---

#### See Also

* [How to Read Strategy Write-Ups](/strategies/how-to-read)
* [Returns](/quant-math/returns)
* [Drawdown](/quant-math/drawdown)
* [Rebalancing](/quant-math/rebalancing)
* [Roll and Carry](/markets/roll-and-carry)
* [Backtest vs Live](/risk/backtest-vs-live)

---
