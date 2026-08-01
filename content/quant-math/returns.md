### Returns

> info **Metadata** Level: All | Prerequisites: Basic algebra | Tags: returns, prices, performance, time-series

A return is a change in value expressed relative to what was invested. It is the unit in which almost every quantitative result is stated, and it is where most measurement disputes originate — because "the return" is not one quantity but a family of them, differing by compounding convention, by what is counted as capital, and by how periods and positions are aggregated.

Two definitions dominate. **Simple returns** are what you actually earn and what aggregates correctly across a portfolio at a point in time. **Log returns** aggregate correctly across time for a single position and are the natural input to continuous-time models. Neither is more correct; using the wrong one for the wrong axis produces errors that are small enough to survive review and large enough to matter.

---

#### Formal Definition

For a price `P_t` at time `t`:

```text
R_t = (P_t - P_{t-1}) / P_{t-1} = P_t / P_{t-1} - 1        simple return
r_t = ln(P_t / P_{t-1}) = ln(1 + R_t)                      log return
```

where:

- `R_t` is the simple (arithmetic) return over the period ending at `t`
- `r_t` is the log (continuously compounded) return
- `ln` is the natural logarithm

The conversions are exact in both directions: `R_t = exp(r_t) - 1`.

**Aggregation across time** — log returns add:

```text
r_(1 to n) = r_1 + r_2 + ... + r_n
R_(1 to n) = (1 + R_1)(1 + R_2)...(1 + R_n) - 1
```

**Aggregation across positions** — simple returns add, weighted by capital:

```text
R_p = sum over i of  w_i * R_i
```

This is the rule that gets broken. Log returns do **not** combine linearly across assets. There is no weighting of log returns that yields the portfolio's log return.

**Total return** includes income, not just price change:

```text
R_total = (P_t + D_t - P_{t-1}) / P_{t-1}
```

where `D_t` is the cash received in the period — dividend, coupon, funding payment, or fee income. Comparing a price return against a total-return benchmark is a persistent and entirely avoidable error.

---

#### Worked Example

A position is marked at these prices:

<table>
  <tbody>
    <tr>
      <td><strong>Time</strong></td>
      <td>0</td><td>1</td><td>2</td><td>3</td>
    </tr>
    <tr>
      <td><strong>Price</strong></td>
      <td>100</td><td>110</td><td>99</td><td>104</td>
    </tr>
  </tbody>
</table>

1. **Simple returns**: `110/100 - 1 = +10.00%`, `99/110 - 1 = -10.00%`, `104/99 - 1 = +5.0505%`
2. **Log returns**: `ln(1.10) = 0.09531`, `ln(0.90) = -0.10536`, `ln(1.050505) = 0.04927`
3. **Log returns sum**: `0.09531 - 0.10536 + 0.04927 = 0.03922`, and `exp(0.03922) = 1.0400` — the cumulative growth factor, exactly.
4. **Simple returns compound**: `(1.10)(0.90)(1.050505) = 1.0400`. Same answer, multiplicatively.
5. **Arithmetic mean of simple returns**: `(10.00 - 10.00 + 5.0505) / 3 = 1.6835%` per period
6. **Geometric mean**: `1.04^(1/3) - 1 = 1.3159%` per period

Steps 5 and 6 differ by 37 basis points per period, and only the geometric mean reproduces the actual result: compounding `1.6835%` three times gives 5.14% growth, not 4.00%. Notice too that periods 1 and 2 are `+10%` and `-10%`, averaging to zero, yet the position is down 1% after them. Volatility subtracts from compound growth mechanically.

**Drag.** For small returns the relationship is approximately:

```text
geometric mean  approximately  arithmetic mean - sigma^2 / 2
```

An asset with a 10% arithmetic mean and 25% volatility compounds at roughly `10% - 0.5(0.25)^2 = 6.9%`.

**Now aggregate across assets.** Hold two positions in equal weight, one returning `+10%` and one `-6%` over the same period. The portfolio's simple return is `(0.5)(10%) + (0.5)(-6%) = 2.00%`. Averaging the log returns instead gives `(0.5)(0.09531) + (0.5)(-0.06188) = 0.016717`, or `1.686%` — wrong by 31 basis points, and the error grows with dispersion.

> info **The rule in one line** Add log returns down the time axis. Add weighted simple returns across the position axis. Never the other way round.

---

#### Time-Weighted and Money-Weighted Returns

When capital flows in and out, "the return" splits into two genuinely different questions.

- **Time-weighted return (TWR)** chains the period returns and is unaffected by the size or timing of contributions. It answers: how did the strategy perform? This is the correct basis for comparing managers or strategies.
- **Money-weighted return (MWR, or internal rate of return)** is the discount rate that sets the net present value of all cash flows to zero. It answers: how did *this investor's capital* perform, including the effect of when they added to or withdrew from the position.

They diverge sharply when flows are large and badly timed — capital added just before a drawdown drags the money-weighted figure well below the time-weighted one, without the strategy having changed at all.

---

#### In Practice Across Asset Classes

- **Equities.** The distinction between price and total return is material: reinvested dividends compound. Returns must be adjusted for splits, spin-offs, and rights issues, or an artificial jump enters the series. See [Corporate Actions](/markets/corporate-actions).
- **Futures.** There is no natural denominator, because a position requires margin rather than full capital. Returns are conventionally computed on notional or on a fully collateralised basis, and the two differ by the collateral yield. Roll dates create price discontinuities that are not returns and must be removed. See [Futures 101](/markets/futures-101).
- **FX.** A spot rate return is not the return on a position. Holding a currency pair earns the interest differential, so the total return is the spot move plus carry — which is the entire economics of the trade. See [FX Carry & Parity](/markets/fx-carry-parity).
- **Fixed income.** Total return decomposes into coupon, roll-down the curve, and capital gain from yield changes. For a bond held to maturity the return is known in advance in nominal terms; the interim marks are the volatile part. See [Duration & Convexity](/markets/duration-convexity).
- **Credit.** Return must be computed net of expected loss, and a defaulted bond's return is defined by its recovery rather than by a market price. Averaging returns across a universe that quietly drops defaulted issuers overstates performance. See [Recovery Rates](/credit/recovery-rates).
- **Options.** Percentage returns are close to meaningless because the position can lose 100% routinely and the denominator is a premium rather than an exposure. P&L attribution against the Greeks is the useful decomposition instead. See [Greeks](/derivatives/greeks).
- **On-chain.** A liquidity position's return has at least three components: fee income, the inventory effect of the pool rebalancing against you, and any incentive emissions. Reporting only fee yield is a partial return, not a return. See [Impermanent Loss](/building-blocks/impermanent-loss).

---

#### Assumptions and Failure Modes

- **Averaging percentages across periods.** The arithmetic mean of period returns overstates realised growth. Report the compound annual growth rate for realised performance and the arithmetic mean only when it is genuinely the expected single-period return.
- **Averaging percentages across accounts.** An equal-weighted average of account returns is not the return on total capital unless the accounts are equal in size.
- **Prices that are not tradable.** Mid-marks, model prices, and stale quotes generate returns you could not have earned. Returns computed from them are smoothed and understate risk.
- **Ignoring income.** Dividends, coupons, funding, staking rewards, and fee income are returns. Omitting them makes carry strategies look like losers and short positions look like winners.
- **Ignoring costs.** A gross return series is a research artefact. Fees, spread, slippage, borrow cost, and financing must be subtracted before any performance claim. See [Transaction Cost Analysis](/execution/transaction-cost-analysis).
- **Undefined denominators.** For market-neutral, funded, or derivative positions, "capital" is a choice. Two reasonable choices can produce returns differing by a factor of several, so the convention has to be stated.
- **Log returns near extremes.** A `-100%` simple return maps to a log return of negative infinity. Any series containing a total loss cannot be handled in log space without special treatment.

> warning **Symmetry is an illusion in simple returns** A `-50%` loss requires a `+100%` gain to recover. Log returns are symmetric in this sense and simple returns are not, which is why drawdown recovery is always harder than it looks.

---

#### Code

```python
import numpy as np

def simple_to_log(simple_returns):
    return np.log1p(np.asarray(simple_returns, dtype=float))


def compound(simple_returns):
    """Total growth over the whole series, expressed as a simple return."""
    return np.prod(1.0 + np.asarray(simple_returns, dtype=float)) - 1.0


def cagr(simple_returns, periods_per_year=252):
    """Compound annual growth rate — the geometric, not arithmetic, mean.

    Reporting the arithmetic mean here overstates realised performance
    by roughly half the variance.
    """
    r = np.asarray(simple_returns, dtype=float)
    total_growth = np.prod(1.0 + r)
    years = len(r) / periods_per_year
    return total_growth ** (1.0 / years) - 1.0


def portfolio_return(weights, simple_returns):
    """Portfolio return aggregates SIMPLE returns across assets, never log returns."""
    return float(np.dot(weights, simple_returns))
```

---

#### See Also

* [Volatility](/quant-math/volatility)
* [Sharpe Ratio](/quant-math/sharpe)
* [Drawdown](/quant-math/drawdown)
* [Expectation & Variance](/quant-math/expectation-variance)
* [Geometric Brownian Motion](/quant-math/gbm)
* [Corporate Actions](/markets/corporate-actions)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---
