### Trend-Following on Funding/Basis

> info **Metadata** Level: Advanced | Prerequisites: Funding Rate, Basis, Momentum, Perpetual Futures | Tags: funding, basis, positioning, trend-following, contrarian, signals, defi

Funding and basis are usually discussed as carry: the rate you receive for holding one side of a hedged position, as in [Cash-and-Carry](/strategies/cash-carry). This page treats them as something else entirely — as **measurements**. A funding rate is the market-clearing price of leveraged exposure, republished every few hours, and a term basis is the same quantity across a maturity. Neither is a survey or an estimate. Both are prices at which real capital changed hands.

That makes them unusually clean positioning data, and positioning data invites two incompatible strategies. The continuation reading says heavy demand for leveraged length confirms a trend. The contrarian reading says heavy demand for leveraged length is crowding, and crowding in a market with automatic liquidation has a mechanical unwind. Both stories are plausible, they predict opposite trades, and the honest state of the evidence is that the sample available to distinguish them is very small.

> warning **Not Financial Advice** This page describes how funding and basis are constructed into signals and why such signals are hard to validate. It is not a recommendation to trade on either.

---

#### Why It Might Work: The Economic Rationale

**Funding is a price, not an opinion.** Sentiment indicators ask people what they think. A funding rate reports what leveraged traders were willing to pay to maintain a position, denominated in currency, settled every eight hours. It cannot be answered dishonestly, and it aggregates across every participant on the venue.

**It measures a fragility with a mechanical trigger.** Leveraged positions are not merely opinions — they are opinions with a forced exit attached. High positive funding means the marginal long is paying to stay in, which implies a population of positions that will be closed automatically if price moves against them. That is a structural argument for the contrarian reading which does not depend on any claim about investor psychology. See [Leverage and Liquidation](/risk/leverage-liquidation).

**It is a flow signal in a market where flow is otherwise opaque.** Institutional positioning in traditional markets is visible weekly at best, and often only through regulatory filings with long lags. Funding updates three times a day, and open interest updates continuously. See [Open Interest](/signals/open-interest).

**The continuation case.** Persistent positive funding can reflect a genuine, sustained demand for exposure that is not being met by spot supply — a real imbalance that pushes price rather than merely reflecting it. Under this account, funding is a symptom of an ongoing repricing, and the trend has further to run. See [Momentum](/strategies/momentum) for the general theory of continuation strategies.

**What would have to be true.** For a funding-based directional signal to have positive expected return, the information in the rate must not already be in the price — which is a strong claim, because the funding rate and the price are set by the same participants on the same venue at the same time. And whichever direction the signal points, the position must overcome the funding itself, which is the subject of the worked example below.

---

#### Formal Definition

Perpetual funding is quoted per interval. Annualise it before comparing to anything:

```text
f_ann = f_interval * intervals_per_day * 365
```

At 0.01% per 8-hour interval, `0.0001 * 3 * 365 = 10.95%` per annum. At 0.035% it is 38.3%.

Dated futures give the same information as a term basis. With spot `S`, futures `F`, and `d` days to expiry:

```text
basis_ann = (F / S - 1) * 365 / d
```

Both series are then converted into signals by the usual apparatus:

```text
z_t = (f_ann_t - mean_N(f_ann)) / sd_N(f_ann)

w_t = -clip(z_t, -3, 3) / 3      contrarian
w_t = +clip(z_t, -3, 3) / 3      continuation
```

where:

- `N` is the lookback for the normalisation, typically several weeks of intervals
- `clip` caps the position at three standard deviations of signal
- `w_t` is the target position as a fraction of the risk budget

Three refinements matter more than the choice of `N`.

**Level versus change.** The level of funding is a positioning stock; its change is a flow. A rate that has been persistently high for weeks is a different state from one that tripled today, and z-scoring the level conflates them. Many practitioners use both terms.

**The perpetual-versus-dated spread.** Perpetual funding and dated basis measure the same demand at different horizons. Their spread is a term-structure signal: perpetual funding far above the annualised dated basis suggests short-dated leveraged demand rather than a durable repricing.

**Open interest as a conditioning variable.** Funding alone cannot distinguish new positioning from position closure. The combination is more informative than either alone:

<table>
  <tbody>
    <tr><td><strong>Funding</strong></td><td><strong>Open interest</strong></td><td><strong>Reading</strong></td></tr>
    <tr><td>High and rising</td><td>Rising</td><td>New leveraged length being added</td></tr>
    <tr><td>High and rising</td><td>Falling</td><td>Shorts covering, existing length unwinding</td></tr>
    <tr><td>Negative</td><td>Rising</td><td>New leveraged shorts being added</td></tr>
    <tr><td>Reverting to zero</td><td>Falling</td><td>Positioning unwinding on both sides</td></tr>
  </tbody>
</table>

---

#### Worked Example: The Signal and Its Own Cost

An illustrative reading. All figures are constructed for the arithmetic.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Current 8-hour funding</td><td>0.035%</td></tr>
    <tr><td>Annualised</td><td>38.3%</td></tr>
    <tr><td>30-day mean of annualised funding</td><td>12%</td></tr>
    <tr><td>30-day standard deviation</td><td>9%</td></tr>
    <tr><td>Reading used for the signal</td><td>42% (three-interval average)</td></tr>
    <tr><td>Position notional</td><td>100,000</td></tr>
    <tr><td>Intended holding period</td><td>10 days</td></tr>
  </tbody>
</table>

1. **Z-score**: `(42 - 12) / 9 = 3.33`, clipped to 3, giving a full-size signal in whichever direction the hypothesis chooses
2. **Continuation reading**: go long the perpetual. **Carry cost**: `100,000 * 0.42 * 10/365 = 1,150.68`, or **1.15% of notional over ten days**
3. **Contrarian reading**: go short the perpetual. **Carry received**: `+1,150.68`, the same 1.15%
4. **Breakeven for the long**: price must rise more than **1.15% in ten days** simply to cover funding, before fees and slippage
5. **Breakeven for the short**: price can rise up to **1.15%** and the position is still flat

This asymmetry is the structural feature of the whole family and it is easy to miss. **A funding signal is one of the few signals whose cost is the signal.** Under the continuation hypothesis you buy exposure at its most expensive, and the more extreme the reading that triggered you, the higher the hurdle. Under the contrarian hypothesis the same reading pays you to wait — an option with positive carry rather than negative.

That does not make the contrarian version correct. It means the two hypotheses face very different hurdles, and a backtest that ignores funding costs will systematically flatter continuation. It also reverses when funding is negative: shorting into deeply negative funding pays a carry cost, and the long side is paid to wait.

6. **Extend to 30 days**: at the same rate, carry is `0.42 * 30/365 = 3.45%` of notional. For a signal with a typical holding period measured in weeks, carry is not a rounding error against the size of move being predicted.

Now the sample problem, which is more serious than the carry problem. Four years of eight-hour funding data is 4,380 observations, which sounds ample. But if the signal uses a 30-day normalisation window and a multi-week holding period, the number of genuinely independent observations is closer to **49**. Add that these observations span perhaps one or two complete market cycles, and the effective sample for distinguishing continuation from reversal is small enough that a confident answer from a backtest is a warning sign rather than a result. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Why the Two Hypotheses Can Both Be Right

The contradiction usually dissolves into a horizon distinction, and stating it that way is more useful than picking a side.

**At short horizons the mechanical argument dominates.** A cluster of leveraged longs is a queue of forced sellers at known prices. When price approaches those levels the liquidations execute, pushing price further and triggering more. That is a real, observable, sub-daily phenomenon and it makes extreme funding a genuine fragility indicator over hours to days. See [Basis Unwind](/case-studies/basis-unwind).

**At longer horizons the demand argument may dominate.** Sustained positive funding over weeks can reflect a durable imbalance between demand for exposure and available spot supply, which is a repricing rather than a bubble.

**Between them there is a regime problem, not a parameter problem.** Which effect governs depends on how much leverage the system is carrying, how deep spot liquidity is, and how liquidation engines are configured — none of which is stable, and all of which change through a cycle. A single rule calibrated on one regime is not a strategy so much as a description of that regime. See [Regimes Overview](/regimes-macro/regimes-overview).

> info **Funding is venue-specific** Each venue computes funding from its own book, its own index, its own clamp, and its own interval. A cross-venue average is a different series from any single venue's rate, and neither is "the" funding rate. Fix the definition before fixing the parameters.

---

#### In Practice

**As a filter rather than a signal.** The most defensible use is conditioning: not "go short because funding is high" but "do not add to length when funding is at an extreme". A filter needs far less statistical evidence to justify than a standalone signal, because it only has to be informative about risk rather than about direction.

**As a risk measure.** The most robust reading is that extreme funding paired with rising open interest indicates a leveraged market, and a leveraged market has fatter tails in both directions. That is a statement about the distribution, not the mean, and it is the one the data supports most easily. See [Funding Rate Case Study](/case-studies/funding-rate).

**Combined with price trend.** Funding and price momentum agreeing is a different state from funding at an extreme while price stalls. The second is the classic setup a contrarian reading describes and it can be encoded as an interaction term rather than as two separate signals. See [Momentum](/strategies/momentum).

**Across dated and perpetual instruments.** The dated basis has a convergence date and therefore a defined terminal payoff; perpetual funding does not. A signal built on dated basis is partly a statement about financing conditions to a known horizon, which is a cleaner object than an open-ended floating rate. See [Roll and Carry](/markets/roll-and-carry) and [Basis](/signals/basis).

---

#### Assumptions and Failure Modes

- **Assumes funding is informative beyond price.** Funding and price are set simultaneously by overlapping participants. Any signal must beat the price series alone, and demonstrating incremental information requires a joint test rather than a standalone backtest.
- **Assumes the normalisation window is meaningful.** Funding regimes shift abruptly. A z-score against a trailing 30-day window can read 3.3 simply because the previous month was unusually calm, which is a statement about the denominator rather than about positioning.
- **The signal and the cost point the same way.** Step 2 above. Continuation strategies buy the expensive side by construction; any backtest omitting funding cost is measuring a trade that could not be executed.
- **Assumes clamps and caps do not bind.** Venues cap funding rates. When the cap binds, the rate stops measuring demand and starts measuring the cap, so the most extreme readings — the ones the signal cares most about — are exactly where the series is least informative.
- **Assumes the position survives the unwind it predicts.** A correctly identified crowded long is a prediction of a violent move, and violent moves liquidate leveraged positions on both sides. Being right about a cascade and liquidated inside it is the standard outcome.
- **Assumes stationarity across venues and market structure.** Funding mechanics, index composition, intervals, and liquidation engines change. A series stitched across those changes has structural breaks that no amount of normalisation removes. See [Unit Roots](/stat-methods/unit-roots).
- **The effective sample is tiny.** Fewer than fifty independent observations over a handful of regimes, against a parameter space of lookback, holding period, clip level, threshold, and venue. See [Multiple Testing](/stat-methods/multiple-testing).
- **Assumes the strategy is not the crowd.** Funding-based signals are widely known. A strategy that trades against extreme positioning becomes, at scale, part of the positioning it is measuring.

---

#### Code

```python
import numpy as np
import pandas as pd


def annualise_funding(rate_per_interval, intervals_per_day=3):
    """Perpetual funding, per-interval to per-annum, simple."""
    return rate_per_interval * intervals_per_day * 365


def annualise_basis(spot, futures, days_to_expiry):
    """Dated futures basis as an annualised rate.

    Comparable to perpetual funding; their spread is a term-structure
    signal rather than a carry figure.
    """
    return (futures / spot - 1.0) * 365.0 / days_to_expiry


def funding_zscore(funding_annualised, window=90):
    """Rolling standardisation of an annualised funding series.

    `window` is in observations, not days. Funding regimes shift
    abruptly, so an extreme reading is often a statement about the
    denominator rather than about positioning.
    """
    rolling = funding_annualised.rolling(window)
    return (funding_annualised - rolling.mean()) / rolling.std(ddof=1)


def positioning_signal(z, direction="contrarian", cap=3.0):
    """Target weight in [-1, 1] from a funding z-score."""
    sign = -1.0 if direction == "contrarian" else 1.0
    return sign * np.clip(z, -cap, cap) / cap


def carry_adjusted_return(price_return, funding_annualised_rate,
                          days_held, position_sign):
    """Directional return net of the funding actually paid or received.

    A long pays positive funding and a short receives it, so under the
    continuation reading the carry term is the signal's own cost.
    Omitting it systematically flatters continuation backtests.
    """
    carry = funding_annualised_rate * days_held / 365.0
    return position_sign * (price_return - carry)
```

---

#### See Also

* [Funding Rate](/signals/funding-rate)
* [Basis](/signals/basis)
* [Momentum](/strategies/momentum)
* [Cash-and-Carry](/strategies/cash-carry)
* [Open Interest](/signals/open-interest)
* [Basis Unwind](/case-studies/basis-unwind)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)

---
