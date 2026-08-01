### How to Read Strategy Write-Ups

> info **Metadata** Level: Beginner | Prerequisites: Returns, Volatility, Sharpe Ratio | Tags: strategy, methodology, evaluation, backtesting, overfitting

Every strategy description you will ever read — in this section, in a journal article, in a pitch deck, on a forum — makes a claim of the same shape: *there is a rule mapping observable information to a position, and following that rule earns more than the risk it takes*. The rule is the easy part. Anyone can write down "buy when the 50-day average crosses the 200-day average". The claim underneath it — that this particular mapping harvests a real risk premium or a real inefficiency — is where all the difficulty lives.

This page is a reading protocol. It tells you what to look for, in what order, and which omissions should make you stop reading. Every other page in the Strategy Design section is written to this shape deliberately: economic rationale first, mechanical rules second, arithmetic third, failure modes last and longest.

> warning **Not Financial Advice** Arth explains how strategies are constructed and how they fail. Nothing here is a recommendation to trade any instrument, venue, or rule set.

---

#### What a Strategy Actually Claims

Strip away the presentation and a systematic strategy is a function producing a weight, plus a cost model:

```text
w_t = f(I_t ; theta)

R_p,t+1 = w_t * R_t+1  -  c * |w_t - w_t-1|
```

where:

- `w_t` is the position held from `t` to `t+1`, as a fraction of capital
- `I_t` is the information set available strictly at or before time `t`
- `theta` is the parameter vector (lookbacks, thresholds, stop distances)
- `R_t+1` is the asset return over the next period
- `c` is the one-way cost per unit of notional traded — spread, commission, slippage, financing, gas

Three things follow immediately, and they organise everything else on this page.

**The strategy earns nothing unless `w_t` is correlated with `R_t+1`.** All the complexity of the signal is in service of that one correlation. If a write-up never states *why* such a correlation should exist, it has not made an argument.

**`I_t` is a claim about time, and it is routinely violated.** Using a closing price to take a position at that same close, using a security list that reflects today's index membership, using a volatility estimate computed over the full sample — each quietly moves future information into `I_t` and each one manufactures performance from nothing.

**The cost term is not a detail.** It scales with turnover, and turnover is the one thing a fast rule always has in abundance.

---

#### Worked Example: The Cost Term Is the Whole Argument

Suppose a rule flips between fully long and fully short 12 times a year. Each flip trades 2.0 units of notional (out of one side, into the other), so annual turnover is 24 units of notional per unit of capital. Take a realistic all-in one-way cost of 10 basis points — half the quoted spread, plus commission, plus market impact.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Signal flips per year</td><td>12</td></tr>
    <tr><td>Notional traded per flip</td><td>2.0 &times; capital</td></tr>
    <tr><td>Annual turnover</td><td>24.0 &times; capital</td></tr>
    <tr><td>One-way cost <code>c</code></td><td>10 bp</td></tr>
  </tbody>
</table>

1. **Annual cost drag**: `24.0 * 0.0010 = 0.024`, or 2.4% of capital per year.
2. If the strategy's gross expected return is 6% and its volatility is 15%, gross Sharpe is `0.06 / 0.15 = 0.40`.
3. Net expected return is `0.06 - 0.024 = 0.036`, so net Sharpe is `0.036 / 0.15 = 0.24`.
4. Now double the trading frequency without improving the signal. Turnover becomes 48, drag becomes 4.8%, and net expected return is 1.2% — Sharpe 0.08.

This arithmetic is illustrative, not a measured result. Its point is structural: **the same signal at twice the frequency is not twice as good, and is often worse.** When a write-up quotes gross returns, or quotes costs as "assumed 1 bp", the number that matters has not been computed.

---

#### The Seven Questions

Read any strategy description against this list. The absence of an answer is itself an answer.

<table>
  <tbody>
    <tr><td><strong>Question</strong></td><td><strong>What a weak answer looks like</strong></td></tr>
    <tr><td>Why should this work?</td><td>"The indicator identifies momentum." That restates the rule. A real answer names a risk being borne, a constraint being relieved, or a behaviour being exploited.</td></tr>
    <tr><td>Who is on the other side, and why are they willing?</td><td>Silence. Every unit of your profit is someone's loss or someone's paid-for insurance. If nobody plausibly wants that trade, the edge is imaginary.</td></tr>
    <tr><td>How many variants were tested?</td><td>"We used 14 and 30." Search over lookbacks, thresholds, assets and date ranges inflates the best result whether or not any edge exists.</td></tr>
    <tr><td>What is the turnover, and at what cost?</td><td>Costs quoted as a single basis-point number with no dependence on size or volatility regime.</td></tr>
    <tr><td>What is the benchmark?</td><td>Comparison against zero. A long-biased rule on a rising asset must be compared against holding the asset.</td></tr>
    <tr><td>What does the loss distribution look like?</td><td>Mean and Sharpe only. Strategies that sell insurance look excellent on two moments and are defined by the third and fourth.</td></tr>
    <tr><td>What is the capacity?</td><td>No mention of size. An edge that survives at 100,000 units of capital and dies at 100,000,000 is a different object.</td></tr>
  </tbody>
</table>

---

#### Rationale Before Rules

The most common failure in strategy writing is a well-specified rule attached to no argument. This matters because the space of rules is effectively infinite, and any finite dataset contains rules that fit it well by chance. The only defence that scales is a prior: a reason, formed before looking at the data, that a particular relationship should exist.

Broadly, three families of argument can support a strategy, and they carry different burdens of proof.

- **Risk premium.** You are paid because you hold something others want to avoid — equity market risk, illiquidity, default risk, the risk of losing badly in a crisis. This is the most durable family, because the compensation persists as long as the aversion does. The burden of proof is to name the risk and show that the strategy's losses do in fact cluster where that risk bites.
- **Structural or constraint-driven.** Someone is a forced or price-insensitive participant: an index fund that must trade at the close, a bank with a balance-sheet limit at quarter-end, a protocol that must rebalance mechanically. You are paid to relieve the constraint. The burden of proof is to identify the constrained participant and show the constraint still binds.
- **Behavioural or informational.** Participants systematically underreact, anchor, or misprice. This is the weakest family — not because it is untrue, but because it is the easiest to assert and the hardest to falsify, and because the edge decays as it becomes known.

If a write-up's rationale does not fit into one of these, be sceptical rather than impressed.

---

#### In Practice Across Asset Classes

The reading protocol is constant; what counts as a credible rationale is not.

**Equities.** Deep literature and a huge cross-section mean the multiple-testing problem is at its worst. A new equity signal must clear a much higher bar than a new signal in a thinly studied market, and must be shown to survive controls for the well-documented factors. See [Factor Models](/stat-methods/factor-models).

**Futures and commodities.** Rationales tend to be structural — hedging pressure, storage economics, roll mechanics. The return series itself is a construction, so ask how contracts were stitched together before believing any result. See [Roll and Carry](/markets/roll-and-carry).

**FX.** Carry and value arguments dominate, and both are explicitly claims about compensated risk. The relevant loss distribution is sharply negatively skewed, so mean-and-variance summaries are especially misleading.

**Fixed income.** Returns are dominated by a small number of factors (level, slope, curvature). Any strategy claim must be shown to be something other than a repackaged duration bet. See [Yield Curves](/markets/yield-curves).

**On-chain markets.** History is short, regimes are few, token incentives distort measured returns, and costs are lumpy and state-dependent. The estimation-error problem is at its most severe here, so the rationale has to carry proportionally more weight than the backtest.

---

#### Assumptions and Failure Modes

- **Assumes the backtest measured the strategy, not the search.** If many variants were tried, the reported result describes the search process. See [Backtest Overfitting](/stat-methods/backtest-overfitting) and [Multiple Testing](/stat-methods/multiple-testing).
- **Assumes the information set respected time.** Look-ahead through restated data, survivorship-filtered universes, or full-sample normalisation inflates results in ways that are invisible in the equity curve.
- **Assumes fills at observed prices.** Backtests fill at prices that existed because nobody like you was trading. See [Slippage](/microstructure/slippage) and [Market Impact](/execution/market-impact).
- **Assumes the regime persists.** A rule fitted across one monetary or liquidity regime encodes that regime. See [Regimes Overview](/regimes-macro/regimes-overview).
- **Assumes independence of observations.** Overlapping windows and serially correlated returns mean the effective sample size is far smaller than the row count, which makes every significance test optimistic.
- **Assumes the benchmark is zero.** Most rules with a long bias inherit the underlying's drift. Attribution against a passive benchmark is not optional. See [Buy and Hold](/strategies/buy-hold).

---

#### Code

```python
import numpy as np


def net_returns(weights, asset_returns, one_way_cost_bp=10.0):
    """Strategy returns after turnover costs.

    weights[t] is the position held from t to t+1 and must be built
    only from information available at t. Shifting it here is the
    single most common source of accidental look-ahead.
    """
    weights = np.asarray(weights, dtype=float)
    asset_returns = np.asarray(asset_returns, dtype=float)

    gross = weights[:-1] * asset_returns[1:]
    traded = np.abs(np.diff(weights))
    cost = traded * (one_way_cost_bp / 10_000.0)
    return gross - cost


def turnover_breakeven(gross_annual_return, annual_turnover, one_way_cost_bp):
    """Cost drag as a fraction of gross return. Above 1.0 the rule is
    a transfer to intermediaries, however good the signal looks."""
    drag = annual_turnover * (one_way_cost_bp / 10_000.0)
    return drag / gross_annual_return
```

---

#### See Also

* [Buy and Hold](/strategies/buy-hold)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Sharpe Ratio](/quant-math/sharpe)
* [Why Backtest](/simulation/why-backtest)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---
