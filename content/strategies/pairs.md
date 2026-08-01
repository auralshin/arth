### Pairs Trading and Relative Value

> info **Metadata** Level: Advanced | Prerequisites: Stationarity, Linear Regression, Cointegration | Tags: pairs-trading, relative-value, cointegration, mean-reversion, spread

Pairs trading takes offsetting positions in two related instruments when their relative price moves away from its usual level, and closes them when it returns. It is the simplest member of the **relative value** family, which also includes yield-curve butterflies, index arbitrage, convertible arbitrage, and the credit-default-swap basis. What unites them is the source of return: not a view on direction, but a view on the *distance* between two things that ought to move together.

The strategy has a specific statistical prerequisite that is routinely confused with a different, easier one. Pairs trading requires the two price *levels* to be tied together — a property called **cointegration**. It does not require, and is not implied by, high correlation of returns. Getting this wrong is the most common reason a pairs book that looked excellent in a backtest loses money continuously in production.

> warning **Not Financial Advice** This page explains how relative-value spreads are constructed, tested, and traded, and how they fail. It is not a recommendation to trade any pair.

---

#### Why It Might Work: The Economic Rationale

The trade is only sound when there is a **mechanism** holding the two prices together. Statistics can tell you a relationship held in the past; only a mechanism gives you reason to expect it to hold tomorrow. The mechanisms come in descending order of strength:

**Hard arbitrage links.** The same claim in two wrappers: a stock and its depositary receipt, two share classes of the same company, a futures contract and its deliverable basket, a token and its wrapped representation, a redeemable stablecoin and the asset backing it. Here the link is enforced by an explicit conversion or delivery mechanism, and the spread's bounds are set by the cost of exercising it. The trade earns the deviation minus the friction, and the risk is that the conversion mechanism itself fails.

**Substitution and shared exposure.** Two firms in the same industry face the same input costs, the same demand cycle, and the same regulation, so the ratio of their values reflects only firm-specific factors. Two points on the same yield curve are driven by the same policy expectations. There is no forced convergence here, only an economic pull, and the spread can stay wide for a long time or never come back.

**Flow and constraint.** A large index rebalance, a fund liquidation, or a quarter-end balance-sheet constraint pushes one leg without touching the other. The relative-value trader is supplying liquidity to that flow and is compensated for absorbing it — the same economics as [market making](/strategies/mm-lite), expressed as a spread rather than as a quote.

**What would have to be true.** For a pairs trade to have positive expected return, the spread must be genuinely mean-reverting *out of sample*, the reversion must be fast enough relative to financing and borrow costs, and the mechanism producing it must still be operating. If the only evidence is that the spread reverted historically, you have a fitted result — and with `N` instruments there are `N * (N - 1) / 2` candidate pairs, so a search over a few hundred instruments examines tens of thousands of hypotheses. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### Correlation Is Not Cointegration

This distinction is the statistical heart of the strategy and deserves precision.

**Correlation** is a property of *returns*. It measures whether two series tend to move up and down together from one period to the next. It is computed on differences, is scale-free, and carries no information about where the levels end up.

**Cointegration** is a property of *levels*. Two price series that are individually non-stationary — each behaving like a random walk, with no tendency to return to any particular value — are cointegrated if some linear combination of them *is* stationary. That stationary combination is the spread, and its existence is exactly the claim that the two prices cannot drift apart indefinitely.

The two properties are close to independent:

<table>
  <tbody>
    <tr><td><strong>Case</strong></td><td><strong>Return correlation</strong></td><td><strong>Cointegrated?</strong></td><td><strong>Consequence</strong></td></tr>
    <tr><td>Two random walks with correlated increments and different drifts</td><td>High</td><td>No</td><td>Prices drift apart without bound. The "spread" is itself a random walk, so it has no mean to revert to and every level is equally likely. A z-score computed on it is meaningless.</td></tr>
    <tr><td>Two share classes of one company, traded asynchronously</td><td>Moderate</td><td>Yes</td><td>Return correlation is diluted by non-synchronous prints and microstructure noise, but the levels are tied by a conversion right. The trade is sound.</td></tr>
    <tr><td>Two unrelated instruments over a short window</td><td>High by chance</td><td>No</td><td>The classic false positive from a large pair search.</td></tr>
  </tbody>
</table>

The practical consequence: a screen ranked by return correlation will surface pairs that share a common risk factor and will say nothing about whether their prices are anchored to each other. A screen must test the levels. The standard procedure is the **Engle–Granger two-step** — regress one log price on the other, then test the residual for a unit root — or the **Johansen** procedure when more than two series are involved. Both are covered in [Cointegration](/stat-methods/cointegration), with the underlying stationarity tests in [Unit Roots](/stat-methods/unit-roots).

> warning **A cointegration test is a hypothesis test, and it is being run many times** Applying an Engle–Granger test at the 5% level across 10,000 candidate pairs yields roughly 500 spurious "cointegrated" pairs when none are. The screen must be corrected for the number of tests, and the surviving pairs must still be justified by a mechanism.

---

#### Formal Definition

Work in logs, so that the hedge ratio is a proportional relationship rather than a fixed dollar amount:

```text
S_t = log(P_A,t) - beta * log(P_B,t)
```

where `beta` is the **hedge ratio**, typically estimated by ordinary least squares of `log(P_A)` on `log(P_B)` over a formation window, or by total least squares when both series are measured with error.

The trading signal is the standardised spread:

```text
z_t = (S_t - mu_S) / sigma_S
```

with `mu_S` and `sigma_S` estimated on a rolling window that ends strictly before `t`. Using full-sample estimates is a look-ahead that manufactures reversion where none exists.

```text
enter short spread:  z_t >= +z_in      (sell A, buy beta units of B)
enter long spread:   z_t <= -z_in      (buy A, sell beta units of B)
exit:                |z_t| <= z_out
stop:                |z_t| >= z_stop   or  t - t_entry >= H
```

A useful model for the spread is the **Ornstein–Uhlenbeck process**:

```text
dS_t = theta * (mu - S_t) * dt + sigma * dW_t

half_life = ln(2) / theta
```

where:

- `theta` is the speed of reversion, estimated by regressing `S_t - S_{t-1}` on `S_{t-1}`
- `half_life` is the expected time for a deviation to decay by half

The half-life is the single most useful diagnostic in the strategy. It sets the holding period, which sets the financing and borrow cost, which determines whether the spread's amplitude is worth capturing at all. A spread with a half-life of six months and an amplitude of 2% is not a trade. See [Ornstein–Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck).

---

#### Worked Example: One Round Trip

Two instruments with an estimated hedge ratio of `beta = 1.0` in logs, so the spread is the log ratio. The formation window gives `mu_S = 0.693147` (a ratio of exactly 2.00) and `sigma_S = 0.030`. Entry at `z_in = 2.0`, exit at `z_out = 0.0`. All numbers are illustrative arithmetic, not a measured result.

<table>
  <tbody>
    <tr><td><strong>Stage</strong></td><td><strong>P_A</strong></td><td><strong>P_B</strong></td><td><strong>Ratio</strong></td><td><strong>log ratio</strong></td><td><strong>z</strong></td></tr>
    <tr><td>Day 0</td><td>53.00</td><td>25.00</td><td>2.120</td><td>0.751416</td><td>1.94</td></tr>
    <tr><td>Day 1 (entry)</td><td>54.00</td><td>25.00</td><td>2.160</td><td>0.770108</td><td>2.57</td></tr>
    <tr><td>Day 31 (exit)</td><td>52.00</td><td>26.00</td><td>2.000</td><td>0.693147</td><td>0.00</td></tr>
  </tbody>
</table>

1. **Day 0**: `z = (0.751416 - 0.693147) / 0.030 = 1.94`. Below the entry threshold, so no position.
2. **Day 1**: `z = (0.770108 - 0.693147) / 0.030 = 2.57`. The spread is rich — A is expensive relative to B — so the trade is short A, long B.
3. **Sizing**: with `beta = 1.0` in logs the legs are matched by value. At 100,000 per leg: short `100,000 / 54.00 = 1,851.85` units of A, long `100,000 / 25.00 = 4,000` units of B. Gross exposure 200,000, net exposure zero.
4. **Day 31, short leg**: A fell from 54.00 to 52.00, so `1,851.85 * 2.00 = 3,703.70`.
5. **Day 31, long leg**: B rose from 25.00 to 26.00, so `4,000 * 1.00 = 4,000.00`.
6. **Gross P&L**: `3,703.70 + 4,000.00 = 7,703.70`, which is 3.85% on 200,000 of gross exposure.
7. **Costs**: roughly 400,000 of notional traded across entry and exit at 5 basis points one-way is about 200. Borrowing 100,000 of A for 30 days at a 1% annual fee is `100,000 * 0.01 * 30 / 365 = 82`. Net P&L is about 7,422.

Note what produced the profit. Neither leg needed to move in a predicted direction — A fell and B rose, but a version where both rose, with B rising more, would have paid identically. The trade is on the ratio. Note also that the borrow fee is a *continuous* cost against a profit that only arrives on convergence, which is why the half-life matters more than the amplitude.

---

#### Implementation Considerations

**The hedge ratio is an estimate and it drifts.** `beta` fitted on two years of data is not the `beta` of the next two. Re-estimating frequently makes the spread definition move under the position; re-estimating rarely lets the hedge decay. Neither is free, and a strategy sensitive to this choice is fragile. Note also that dollar-neutral is not risk-neutral: matching notional does not match volatility, beta, sector exposure, or duration, so a spread between a high-beta and a low-beta instrument carries residual market exposure even with equal dollar amounts.

**Rolling statistics are a moving target.** As `sigma_S` is re-estimated, a widening spread inflates the denominator, so `z` can fall while the position loses money. This is a genuine and under-appreciated hazard: the exit signal can arrive from the statistics rather than from convergence.

**The stop-loss paradox.** On a genuinely mean-reverting spread, a wider deviation implies a *higher* expected return. A stop-loss therefore exits at the moment of maximum expected value. Its justification is not expectation but survival: it bounds the loss from the case where the relationship has broken and no longer reverts. Since you cannot distinguish "temporarily wider" from "permanently broken" in real time, the stop is a bet on which is more likely. See [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss).

**Test out of sample, with purging.** Overlapping spread observations are heavily serially correlated, so naive cross-validation leaks. See [Purged Cross-Validation](/ml-finance/purged-cross-validation).

---

#### In Practice Across Asset Classes

**Equities.** The classic venue: same-sector pairs, dual-listed share classes, depositary receipts against ordinaries, and index arbitrage against the constituent basket. Short-leg availability, borrow cost, and recall risk are the binding practical constraints, and corporate actions — mergers, spin-offs, index deletions — permanently break relationships. See [Short Selling](/markets/short-selling) and [Corporate Actions](/markets/corporate-actions).

**Fixed income.** On-the-run against off-the-run issues, butterflies across the curve, and swap spreads. Cointegration here has a strong structural basis, since the instruments are contractual claims on overlapping cash flows, but the spreads are small and the trades are run at high leverage — which converts a modest divergence into a margin event. See [Yield Curves](/markets/yield-curves).

**Futures and commodities.** Calendar spreads between delivery months of the same contract are the purest form, with the link enforced by storage and delivery economics. Processing spreads — crude against refined products, soybeans against meal and oil — are cointegrated by a physical production relationship, so the hedge ratio comes from the process rather than from a regression. See [Calendar Spreads](/markets/calendar-spreads) and [Commodities](/markets/commodities).

**Credit.** The basis between a bond's spread and the corresponding credit default swap is tied by a replication argument, and its deviations are largely a funding and balance-sheet story. See [CDS](/credit/cds) and [Credit Spreads](/credit/credit-spreads).

**FX.** Cross-rate consistency is enforced by triangular arbitrage and is tight. Longer-horizon relative-value in FX rests on parity conditions that hold weakly at best. See [FX Carry and Parity](/markets/fx-carry-parity).

**On-chain markets.** The strongest pairs are ones with an explicit redemption mechanism — a wrapped asset against its underlying, a liquid staking token against the staked asset, a stablecoin against its collateral. Here the mechanism is legible in code, which is a far better prior than a cointegration test. The risk correspondingly shifts from "does the relationship hold statistically" to "does the redemption path work under stress" — a smart contract, oracle, and liquidity question rather than a statistical one. See [Stablecoins](/building-blocks/stablecoins) and [Oracle Manipulation](/risk/oracle-manipulation).

---

#### Assumptions and Failure Modes

- **Assumes cointegration, and tests for it are low-powered.** Cointegration tests need long samples to detect slow reversion, and the same long sample makes a structural break more likely. This is a genuine bind, not a technique problem.
- **Assumes the relationship survives.** Mergers, defaults, regulatory change, index reconstitution, and business-model divergence all end the link permanently. When they do, the spread does not revert — it re-bases, and the position is a directional bet nobody chose to make.
- **Assumes the short leg is available and stays available.** Borrow can be recalled at the worst moment, forcing a close at the widest point. On-chain, the analogue is a lending market running out of the asset or repricing its rate.
- **Assumes leverage is survivable, and that the crowd is not doing the same trade.** Spreads are small, so relative value is levered, and levered convergence trades are the standard mechanism by which a correct thesis produces a total loss. Mark-to-market losses arrive before convergence and margin calls do not wait for the half-life; worse, popular spreads are held by many participants with similar risk limits, so one deleveraging widens the spread and triggers the next. See [Leverage and Liquidation](/risk/leverage-liquidation).
- **Negatively skewed by construction.** Many small convergence profits punctuated by rare large divergence losses. Sharpe ratios computed between breaks are systematically flattering. See [Sharpe Ratio](/quant-math/sharpe).
- **Assumes stable second moments.** `sigma_S` estimated in calm conditions understates the crisis distribution, so `z` thresholds calibrated in one regime fire far too often in another. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes the pair was not selected by the search.** With tens of thousands of candidates, the top-ranked pairs by in-sample reversion are dominated by luck. Only a pre-specified mechanism protects against this. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm


def hedge_ratio(log_price_a, log_price_b):
    """OLS hedge ratio and residual spread. Fit on a formation window
    only — refitting on the full sample is look-ahead."""
    design = sm.add_constant(log_price_b)
    fit = sm.OLS(log_price_a, design).fit()
    beta = fit.params.iloc[1]
    return beta, log_price_a - beta * log_price_b


def reversion_half_life(spread):
    """Half-life of an OU process, from regressing the change in the
    spread on its level. A non-negative slope means no reversion was
    detected and the pair should not be traded on this basis.
    """
    lagged = spread.shift(1).dropna()
    delta = spread.diff().dropna()
    fit = sm.OLS(delta, sm.add_constant(lagged)).fit()
    theta = -fit.params.iloc[1]
    return np.log(2.0) / theta if theta > 0 else np.inf


def spread_positions(spread, window=60, z_in=2.0, z_out=0.5, z_stop=4.0):
    """Position in the spread: +1 is long A / short beta*B.

    Rolling mean and standard deviation are shifted by one bar so the
    signal at t uses only information available strictly before t.
    """
    mu = spread.rolling(window).mean().shift(1)
    sd = spread.rolling(window).std().shift(1)
    z = (spread - mu) / sd

    position = pd.Series(0.0, index=spread.index)
    current = 0.0
    for t in range(len(z)):
        zt = z.iloc[t]
        if np.isnan(zt):
            current = 0.0
        elif current == 0.0:
            if zt >= z_in:
                current = -1.0
            elif zt <= -z_in:
                current = 1.0
        elif abs(zt) <= z_out or abs(zt) >= z_stop:
            current = 0.0
        position.iloc[t] = current
    return position
```

---

#### See Also

* [Cointegration](/stat-methods/cointegration)
* [Unit Roots](/stat-methods/unit-roots)
* [Mean Reversion](/quant-math/mean-reversion)
* [Ornstein–Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck)
* [Delta-Neutral Strategies](/strategies/delta-neutral)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)

---
