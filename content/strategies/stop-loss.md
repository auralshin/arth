### Stop-Loss and Take-Profit Frameworks

> info **Metadata** Level: Intermediate | Prerequisites: Volatility, ATR, Random Walks, Position Sizing | Tags: stop-loss, take-profit, exits, risk-management, skew, ruin

A **stop-loss** closes a position when price reaches a predetermined adverse level. A **take-profit** closes it at a predetermined favourable level. Together they define the exit rules of a strategy, and exit rules typically receive a fraction of the attention given to entry rules despite mattering at least as much.

They are also the most widely misunderstood component of a trading system. The common belief is that a stop-loss improves returns by "cutting losses short". Under the simplest model of prices it does no such thing: it changes the *shape* of the outcome distribution while leaving the expectation unchanged, and once costs are included it makes the expectation worse. Whatever case exists for stops has to be made on other grounds — and there are good ones. This page separates them.

> warning **Not Financial Advice** This page explains what exit rules do to a return distribution. It is not a recommendation to use any particular stop or target, and no exit rule protects against loss.

---

#### Why It Might Work: The Economic Rationale

Start with the null result, because everything else is a departure from it.

**Under a driftless random walk with no costs, no stopping rule has positive expected value.** If price follows a martingale, then by the optional stopping theorem the expected price at any bounded stopping time equals the price at entry. Placing a stop 5% below and a target 10% above does not create expected return; it produces a roughly two-thirds chance of a small loss and a one-third chance of a double-sized gain, with expectation zero. Add spread, commission, and slippage and the expectation is negative. See [Random Walks](/quant-math/random-walks).

So the honest question is: what has to be true for an exit rule to earn its cost? Four distinct answers, and they are not equally strong.

**1. Risk of ruin under leverage or a capital constraint.** This is the strongest argument and the only one that does not require a claim about the return process. With borrowed money, a margin requirement, an investor drawdown limit, or simply a finite bankroll, the *path* determines whether you are still trading tomorrow. Truncating the left tail preserves the ability to keep taking positive-expectation bets. The stop is not improving the expectation of any single trade; it is protecting the compounding of the sequence. See [Kelly Criterion](/quant-math/kelly) and [Leverage and Liquidation](/risk/leverage-liquidation).

**2. Thesis invalidation.** The stop encodes a statement about *information*: "if price reaches this level, the reason I put the position on is no longer valid." This is a legitimate and different claim from a risk claim, and it implies the stop level should be derived from the thesis — a support level, a spread relationship, a hedge ratio breakdown — not from a fixed percentage.

**3. Genuine continuation after adverse moves.** If returns exhibit positive serial dependence conditional on a large adverse move — that is, if things that have started falling tend to keep falling at your horizon — a stop has positive expected value directly. This is an empirical claim about the return process, it is true in some markets and horizons and false in others, and it must be tested rather than assumed. It is the same claim [momentum](/strategies/momentum) makes, applied to the loss side.

**4. Behavioural pre-commitment.** Discretionary traders reliably hold losers too long and cut winners too early — the disposition effect. A pre-committed exit removes the decision at the moment it is hardest to make well. This is an operational argument about the trader, not a statistical argument about the market, and it is none the worse for that.

**And the counter-case, which is real.** On a genuinely **mean-reverting** process, a stop-loss has *negative* expected value: it exits precisely when the deviation is largest and the expected return highest. Every relative-value and reversion strategy faces this directly. See [Pairs Trading](/strategies/pairs) and [Mean Reversion](/quant-math/mean-reversion).

---

#### Formal Definition

Common exit specifications for a long position entered at `P_entry` at time `t_entry`:

```text
fixed fractional stop:  exit if  P_t <= P_entry * (1 - s)
volatility stop:        exit if  P_t <= P_entry - k * ATR_n(t_entry)
trailing stop:          exit if  P_t <= max(P_entry .. P_t) * (1 - s)
chandelier stop:        exit if  P_t <= max(P_entry .. P_t) - k * ATR_n(t)
take profit:            exit if  P_t >= P_entry * (1 + g)
time stop:              exit if  t - t_entry >= H
```

where:

- `s` is the stop distance as a fraction of entry price
- `g` is the target distance as a fraction of entry price
- `k` is the volatility multiplier
- `ATR_n` is the average true range over `n` periods, a volatility measure in price units
- `H` is the maximum holding period in bars

**Volatility-scaled stops are the more defensible construction.** A fixed 3% stop means something entirely different on an instrument with 10% annualised volatility than on one with 80%. Scaling by ATR makes the stop distance a constant number of standard deviations, so the *probability* of being stopped out by noise is approximately constant across assets and regimes. See [ATR](/signals/atr).

The **break-even hit rate** for a rule with a fixed stop and target, ignoring costs:

```text
p_star = s / (s + g)
```

With a target twice the stop distance, `p_star = 1/3`. Including a round-trip cost `C` on a position of `N` units:

```text
p * N * g_price - (1 - p) * N * s_price - C = 0
```

Solving for `p` gives the true hurdle. The cost term matters far more than it looks, because a rule with tight stops trades often.

---

#### Worked Example: Sizing, Hurdle, and Gap

A long entered at 100.00 with a two-ATR stop. All figures are illustrative arithmetic, not a measured result.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Entry price</td><td>100.00</td></tr>
    <tr><td>ATR(14)</td><td>2.40</td></tr>
    <tr><td>Stop multiplier <code>k</code></td><td>2.0</td></tr>
    <tr><td>Reward-to-risk target</td><td>2.0</td></tr>
    <tr><td>Account equity</td><td>250,000</td></tr>
    <tr><td>Risk budget per trade</td><td>0.5% of equity</td></tr>
    <tr><td>Round-trip cost</td><td>10 bp of notional</td></tr>
  </tbody>
</table>

1. **Stop level**: `100.00 - 2.0 * 2.40 = 95.20`, so risk per unit is 4.80.
2. **Target level**: `100.00 + 2.0 * 4.80 = 109.60`, so reward per unit is 9.60.
3. **Position size**: risk budget is `250,000 * 0.005 = 1,250`, so units are `1,250 / 4.80 = 260.4`, rounded to **260 units** — a notional of 26,000 and an actual risk of `260 * 4.80 = 1,248`.
4. **Break-even hit rate, no costs**: `4.80 / (4.80 + 9.60) = 0.3333`, so 33.33%.
5. **Break-even hit rate with costs**: round-trip cost is `26,000 * 0.0010 = 26.00`. Solve `p * 2,496 - (1 - p) * 1,248 - 26 = 0`, giving `3,744p = 1,274` and `p = 0.3403`. The hurdle rises from 33.33% to **34.03%**.
6. **Gap risk**: suppose the market closes at 96.00 and reopens at 91.00 after an announcement. The stop is not a guaranteed price — it becomes a market order at 91.00. Realised loss is `260 * (100.00 - 91.00) = 2,340`, which is **1.9 times** the 1,248 that was budgeted.

Step 6 is the important one. The risk budget was defined in terms of a level, and the level was not honoured. Everything downstream — the position size, the portfolio-level risk aggregation, the drawdown expectation — was computed on an assumption that failed exactly when it mattered.

---

#### What Exits Do to the Return Distribution

Exit rules are distribution surgery. It is worth being precise about which moment each one attacks.

<table>
  <tbody>
    <tr><td><strong>Rule</strong></td><td><strong>Effect on the distribution</strong></td></tr>
    <tr><td>Stop-loss</td><td>Truncates the left tail, and <em>raises</em> the probability of a loss: many paths that would have recovered are closed at a small loss instead. Trades a lower probability of a large loss for a higher probability of a small one.</td></tr>
    <tr><td>Take-profit</td><td>Truncates the right tail. Raises the hit rate, lowers the average win, and removes positive skew.</td></tr>
    <tr><td>Trailing stop</td><td>Keeps the right tail open while ratcheting the floor. The cost is a higher exit frequency in choppy conditions.</td></tr>
    <tr><td>Time stop</td><td>Bounds capital lock-up and financing cost, and caps the tail of the holding-period distribution. Neutral on price expectation.</td></tr>
  </tbody>
</table>

The interaction with strategy type is decisive:

- **Trend-following depends on positive skew.** Its returns come from a small number of very large winners; the median trade is a small loss. Adding a take-profit to a trend system truncates exactly the outcomes it exists to capture, and it will improve the hit rate while destroying the expectation. This is the single most common way a working trend system is broken by "improvement".
- **Mean-reversion depends on negative skew.** It wins often and small, and loses rarely and large. A stop-loss cuts the divergence trade at its point of greatest expected return, but it is the only thing standing between the strategy and a permanent break in the relationship. There is no clean resolution here; the choice is between a negative-expectation rule and an unbounded tail.
- **Carry strategies have the same shape as mean reversion**, for the same reason: steady accrual punctuated by dislocations.

---

#### In Practice Across Asset Classes

**Equities.** Stops rest on prices that only exist during the session. Overnight gaps around earnings and announcements routinely jump straight through a stop level. Single stocks gap far more than indices, so per-name stops need wider budgets than index-level ones.

**Futures.** Contracts have daily price limits: in a limit move there is no trading through the limit, so a stop cannot execute at all until the market reopens or the limit expands. Overnight sessions are thin, and stop orders resting in a thin book are filled at whatever is there.

**FX.** Trades nearly continuously, so gaps are rarer, but weekend gaps and central-bank actions produce the largest ones. A famous class of event has moved a major pair double-digit percentages in minutes, filling stops far from their level.

**Fixed income.** Stops should be defined in yield or DV01 terms rather than price, since a fixed price distance means different risk across the curve.

**Options.** A stop on option premium is treacherous: the premium is a function of spot, volatility, and time, so a volatility spike can trigger a stop with no adverse move in the underlying at all. Risk on option books is managed through Greeks and scenario limits, not price stops. See [Greeks](/derivatives/greeks).

**On-chain markets.** A stop is either a transaction submitted when triggered — which is visible in the pending pool and exposed to being traded ahead of — or an order held by a keeper or venue, which introduces counterparty and liveness risk. Forced liquidations are stops set by the protocol rather than by the trader, and they execute at whatever price the on-chain liquidity provides during exactly the volatility event that triggered them. See [Slippage and Front-Running](/risk/slippage-frontrunning) and [Liquidations](/building-blocks/liquidations).

---

#### Assumptions and Failure Modes

- **Assumes the stop executes at the stop price.** It does not. A stop is a market order triggered by a level; the fill is wherever liquidity is. Gaps, limit moves, and liquidity holes all produce fills materially worse than the level.
- **Assumes stop levels are not visible.** Round numbers and obvious technical levels attract clustered stops, and clustered stops are a pool of forced market orders. On transparent venues this is directly observable and directly exploitable.
- **Assumes the market is not mean-reverting at the stop's timescale.** Where it is, the stop has negative expected value and the rule is paying to exit at the worst moment.
- **Assumes the parameter was not fitted.** Stop distance and target distance are continuous parameters directly connected to the P&L, which makes them the most over-optimised quantities in systematic trading. A grid search across `k` and reward-to-risk ratios will always produce an attractive combination, and it will almost always fail out of sample. See [Backtest Overfitting](/stat-methods/backtest-overfitting).
- **Assumes volatility is stable between entry and stop.** A stop set from ATR at entry is a fixed number of *entry-time* standard deviations. If volatility doubles, the same level is now a fraction of a standard deviation away and will be hit by noise. See [Volatility](/quant-math/volatility).
- **Assumes per-trade risk aggregates to portfolio risk.** Risking 0.5% on each of twenty correlated positions is not risking 0.5%; in a correlated shock every stop triggers together. See [Position Sizing](/quant-math/position-sizing).
- **Take-profits mistake hit rate for edge.** A high win rate purchased by truncating winners is a worse strategy that feels better, and this is a reliably repeated error.
- **Backtests fill stops optimistically.** Intraday high/low data cannot tell you whether the stop or the target was reached first within a bar, and the default assumption chosen by the backtester materially changes results. See [Backtest vs Live](/risk/backtest-vs-live).

---

#### Code

```python
import numpy as np
import pandas as pd


def average_true_range(high, low, close, window=14):
    """True range accounts for overnight gaps, which a high-minus-low
    range misses — precisely the moves that break price stops."""
    prior_close = close.shift(1)
    true_range = pd.concat([
        high - low,
        (high - prior_close).abs(),
        (low - prior_close).abs(),
    ], axis=1).max(axis=1)
    return true_range.ewm(alpha=1.0 / window, adjust=False).mean()


def size_from_risk_budget(equity, risk_fraction, stop_distance):
    """Units such that a stop-out costs `risk_fraction` of equity.

    This is a budget, not a guarantee: a gap through the stop realises
    more than the budgeted loss, and correlated positions stop together.
    """
    if stop_distance <= 0:
        return 0.0
    return np.floor(equity * risk_fraction / stop_distance)


def breakeven_hit_rate(stop_distance, target_distance,
                       notional=0.0, round_trip_cost_bp=0.0):
    """Win rate required for zero expectation, including costs."""
    cost = notional * round_trip_cost_bp / 10_000.0
    # p*target - (1-p)*stop - cost/units = 0, expressed per unit
    return (stop_distance + cost) / (stop_distance + target_distance)


def chandelier_exit(close, atr, multiplier=3.0, entry_index=0):
    """Trailing stop anchored to the running high since entry.

    Ratchets upward only: allowing it to fall would reintroduce the
    unbounded loss the stop exists to prevent.
    """
    running_high = close.iloc[entry_index:].cummax()
    return (running_high - multiplier * atr.iloc[entry_index:]).cummax()
```

---

#### See Also

* [ATR](/signals/atr)
* [Position Sizing](/quant-math/position-sizing)
* [Dynamic Position Sizing](/strategies/dynamic-sizing)
* [Drawdown](/quant-math/drawdown)
* [Kelly Criterion](/quant-math/kelly)
* [Failed Strategy](/case-studies/failed-strategy)

---
