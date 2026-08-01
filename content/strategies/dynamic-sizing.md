### Dynamic Position Sizing with Volatility

> info **Metadata** Level: Intermediate | Prerequisites: Volatility, Returns, Position Sizing | Tags: volatility-targeting, sizing, leverage, risk-budget, ewma, kelly

Dynamic position sizing scales exposure inversely to a forecast of volatility, so that the *risk* contributed by a position stays roughly constant even as the asset's behaviour changes. A fixed notional allocation does the opposite: it holds the money constant and lets the risk float, which means the strategy is quietly taking three times as much risk in a crisis as it was six months earlier.

This is the standard construction in managed futures and risk-parity portfolios, and it is one of the few techniques in systematic trading whose primary claim — that volatility is forecastable at short horizons — is supported by an unusually robust empirical regularity. Its secondary claim, that this improves risk-adjusted returns rather than merely stabilising risk, is weaker and worth stating separately.

> warning **Not Financial Advice** This page explains how exposure is scaled to a risk target and where that scaling fails. It is not a recommendation to use leverage or any particular target.

---

#### Why It Might Work: The Economic Rationale

The technique rests on two claims that should not be bundled together, because one is far better supported than the other.

**Claim 1: volatility is predictable at short horizons. This is strong.** Volatility clusters — large moves follow large moves, calm follows calm — and it is among the most reliably documented properties of financial return series, observed broadly across asset classes and sample periods. A simple exponentially weighted estimate of recent squared returns forecasts next-period volatility far better than an unconditional average does. This claim alone justifies volatility targeting as a **risk-control** technique: if you want stable risk, and volatility is forecastable, you can achieve it. See [Volatility](/quant-math/volatility) and [GARCH](/stat-methods/garch).

**Claim 2: returns are not proportional to volatility, so the scaling adds return too. This is weaker.** If expected return scaled exactly with volatility — that is, if the Sharpe ratio were constant across volatility regimes — then volatility targeting would change only the leverage, not the risk-adjusted return. The case for a genuine improvement rests on high-volatility periods historically failing to deliver proportionally higher returns. That is a claim about a particular market over a particular sample, and it must be checked rather than assumed.

**A third, purely mechanical benefit.** Compounded growth is approximately `mu - sigma^2 / 2`. Because the drag term is quadratic in volatility, a strategy that reduces exposure when volatility spikes suffers less drag than one that does not, even with identical average exposure. This is arithmetic rather than an empirical claim, and it holds regardless of Claim 2.

**And the cost, which is structural.** Volatility targeting is **procyclical leverage**: it levers up when markets are calm and delevers into stress. Calm periods are when a volatility shock is most damaging, because the position is largest. And the deleveraging happens *after* the volatility has arrived, since the estimator is backward-looking. When many participants run the same rule at the same time, the forced selling is itself a source of volatility. See [Liquidity Cycles](/regimes-macro/liquidity-cycles).

**What would have to be true.** For dynamic sizing to help rather than merely reshuffle, volatility must be forecastable with enough lead time to act on, the cost of the resulting turnover must be small relative to the benefit, and the strategy's leverage must remain within what the balance sheet and the venue permit at the point where the forecast is lowest.

---

#### Formal Definition

**Volatility targeting** sets the weight to the ratio of a target to a forecast:

```text
w_t = sigma_target / sigma_hat_t

w_t = min(w_t, L_max)
```

where:

- `sigma_target` is the desired annualised volatility of the position
- `sigma_hat_t` is the forecast annualised volatility, using data up to `t-1` only
- `L_max` is a leverage cap

The cap is not a refinement. As `sigma_hat_t` approaches zero the formula demands unbounded leverage, and a near-zero volatility estimate is precisely the situation in which the estimate is least trustworthy.

**The EWMA volatility estimator**, the standard choice for its responsiveness and its single parameter:

```text
sigma2_t     = lambda * sigma2_{t-1} + (1 - lambda) * r_{t-1}^2

sigma_hat_t  = sqrt( sigma2_t * periods_per_year )
```

where `lambda` controls memory — a common daily choice is 0.94, giving a half-life of about 11 trading days. Note the `r_{t-1}` subscript: the estimate used to size the position held from `t` must not contain the return earned over that period.

**Risk-budget sizing**, the equivalent formulation when the risk is expressed as a stop distance rather than a volatility:

```text
units = (risk_fraction * Equity) / (k * ATR_n)
```

**Fractional Kelly**, the growth-optimal formulation:

```text
f = phi * mu / sigma^2
```

where `phi` in `(0, 1]` is the Kelly fraction. Full Kelly (`phi = 1`) maximises long-run growth under exactly known parameters and is extremely fragile to an overestimated `mu`; practitioners use a fraction, commonly a quarter to a half, because halving the fraction gives up a modest amount of growth while sharply reducing the drawdown. See [Kelly Criterion](/quant-math/kelly).

**Multi-asset sizing requires covariance, not just volatilities.** Sizing each position to its own volatility target does not produce a portfolio at that target, because the positions are correlated:

```text
sigma_p = sqrt( w' * Sigma * w )
```

Scaling `w` by `sigma_target / sigma_p` targets the portfolio. Inverse-volatility weighting is only a portfolio-level risk control when correlations are equal. See [Covariance](/quant-math/covariance) and [Optimization](/quant-math/optimization).

---

#### Worked Example: Regimes and an EWMA Update

Target volatility of 12% annualised on 1,000,000 of equity, leverage capped at 2.0. All figures are illustrative arithmetic, not a measured result.

<table>
  <tbody>
    <tr><td><strong>Regime</strong></td><td><strong>Forecast vol</strong></td><td><strong>Raw weight</strong></td><td><strong>Capped weight</strong></td><td><strong>Notional</strong></td></tr>
    <tr><td>Calm</td><td>8%</td><td>1.50</td><td>1.50</td><td>1,500,000</td></tr>
    <tr><td>Normal</td><td>16%</td><td>0.75</td><td>0.75</td><td>750,000</td></tr>
    <tr><td>Stressed</td><td>30%</td><td>0.40</td><td>0.40</td><td>400,000</td></tr>
    <tr><td>Very calm</td><td>4%</td><td>3.00</td><td>2.00</td><td>2,000,000</td></tr>
  </tbody>
</table>

The last row is where the cap earns its place: the rule wanted three times leverage on the basis of an unusually quiet stretch.

Now the update mechanics. Suppose `lambda = 0.94` and the current daily variance estimate is `sigma2 = 0.0001`, so daily volatility is 1.00% and annualised volatility is `0.0100 * sqrt(252) = 15.87%`. The weight is `0.12 / 0.1587 = 0.7559`.

A single day returns -3.00%:

1. **Update the variance**: `0.94 * 0.0001 + 0.06 * (0.03)^2 = 0.000094 + 0.000054 = 0.000148`
2. **New daily volatility**: `sqrt(0.000148) = 0.012166`, so 1.2166%
3. **Annualise**: `0.012166 * sqrt(252) = 0.012166 * 15.8745 = 0.1931`, so 19.31%
4. **New weight**: `0.12 / 0.1931 = 0.6214`
5. **Turnover**: the weight fell from 0.7559 to 0.6214, so `0.1345 * 1,000,000 = 134,500` of notional is sold. At 10 basis points, the cost is about 135, or 1.35 basis points of equity.

Two observations. First, the response is substantial but not violent — a 3% day cuts the position by about 18%, which is the point of the exponential weighting. Second, the sale happens *after* the loss, at the new lower price. The estimator is backward-looking by construction, so a volatility-targeted strategy always takes the first shock at full size.

---

#### Implementation Considerations

**Rebalance bands.** Recomputing the weight every day and trading the difference generates continuous small trades whose costs add up. A no-trade band — rebalance only when the target weight differs from the current one by more than, say, 10% relative — removes most of the turnover and almost none of the risk control.

**Estimator choice is a trade-off, not an optimisation.** A short window reacts quickly and is noisy, so the position itself becomes a source of turnover. A long window is stable and late. `lambda`, or equivalently the half-life, is the single most consequential parameter in the whole construction, and fitting it on the same data used to evaluate the strategy is straightforward overfitting.

**Asymmetric response.** Volatility rises faster than it falls, and an estimator that treats up-moves and down-moves symmetrically will delever too slowly on the way in and relever too slowly on the way out. Asymmetric estimators address this at the cost of another parameter.

**Interaction with the signal.** If the signal itself is stronger in high-volatility regimes, volatility targeting systematically shrinks the position exactly when the edge is largest. The two components cannot be designed independently and then combined; the interaction has to be examined.

**Realised versus implied.** Where an options market exists, implied volatility is a forward-looking alternative that does not lag. It carries a variance risk premium — it is typically above subsequent realised volatility — so it must be de-biased before being used as a forecast. See [Implied Volatility](/derivatives/implied-volatility).

---

#### In Practice Across Asset Classes

**Futures and managed futures.** The native home of the technique. Each contract's position is sized so its risk contribution matches a target, using the contract's point value and its own volatility, then the whole portfolio is scaled to a fund-level target. Contracts are indivisible, so rounding matters for small books.

**Equities.** Sizing is usually done through a risk model rather than a raw volatility estimate, decomposing each name's risk into factor and idiosyncratic components so that correlated positions are not double-counted. See [Factor Models](/stat-methods/factor-models) and [PCA](/stat-methods/pca).

**FX.** Volatility regimes are strongly tied to carry unwinds, so a volatility-targeted carry book delevers into exactly the episodes that define its return distribution. The interaction between the sizing rule and the signal is unusually strong here.

**Fixed income.** Risk is expressed in DV01, not notional volatility. Sizing by price volatility across the curve gives the long end far too much weight. See [Duration and Convexity](/markets/duration-convexity).

**Options.** Volatility is an input to the instrument's value, not just to its risk, so sizing by notional or by price volatility is meaningless. Positions are sized against vega, gamma, and scenario losses. See [Greeks](/derivatives/greeks).

**On-chain markets.** Volatility estimates are noisy because the history is short and regime-poor, and the leverage the formula requests in a calm stretch may exceed what a venue permits or what a collateral pool can support. Rebalancing costs are lumpy, so tight bands are unaffordable, and forced liquidation is a hard boundary that the smooth formula does not model. See [Leverage and Liquidation](/risk/leverage-liquidation).

---

#### Assumptions and Failure Modes

- **Assumes the volatility forecast leads the risk.** It lags. Every volatility-targeted strategy takes the first day of a shock at pre-shock size, and the largest single-day losses in such strategies happen before any deleveraging occurs.
- **Assumes volatility captures the risk.** It does not capture jumps. A gap or a limit move is not described by a standard deviation estimated from continuous returns, and a position sized to a 12% volatility target can lose far more than that in one event. See [Jumps](/quant-math/jumps).
- **Assumes leverage is available and safe.** In calm regimes the formula demands leverage, and leverage introduces margin calls, funding costs, and liquidation thresholds that the sizing formula knows nothing about. The cap `L_max` is doing more work than any other line in the implementation.
- **Assumes the drag of turnover is small.** For a fast estimator on a costly instrument it is not. Turnover from the sizing rule is entirely separate from turnover from the signal and must be budgeted separately.
- **Assumes independence across positions.** Sizing each leg to its own target says nothing about portfolio risk when correlations rise. In a stress episode, correlations converge and a book that was at target becomes a multiple of it. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes procyclicality is tolerable.** Selling into declines and buying into calm is, in aggregate, destabilising. When enough capital follows the same rule, the deleveraging is itself the shock.
- **Kelly-style sizing assumes `mu` is known.** It is not, and it is estimated with enormous error. Overestimating `mu` by a factor of two under full Kelly produces a position that is growth-negative, and the resulting drawdowns are far larger than the formula suggests.
- **The estimator parameters are fittable.** Half-life, target, cap, and rebalance band form a four-dimensional grid, and the best combination in-sample tells you little. See [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Code

```python
import numpy as np
import pandas as pd


def ewma_volatility(returns, lam=0.94, periods_per_year=252):
    """Exponentially weighted annualised volatility forecast.

    The output is shifted by one period so the estimate used to size the
    position at t contains no information from t itself.
    """
    variance = returns.pow(2).ewm(alpha=1.0 - lam, adjust=False).mean()
    return (variance * periods_per_year).pow(0.5).shift(1)


def vol_target_weight(vol_forecast, target_vol=0.12, max_leverage=2.0):
    """Exposure scaled inversely to forecast volatility.

    The cap is essential: as the forecast approaches zero the raw
    formula demands unbounded leverage, and a near-zero estimate is
    exactly when the estimate is least reliable.
    """
    return (target_vol / vol_forecast).clip(upper=max_leverage).fillna(0.0)


def apply_rebalance_band(target_weights, band=0.10):
    """Only trade when the target moves more than `band` in relative
    terms. Removes most sizing turnover for very little risk drift."""
    held = []
    current = 0.0
    for target in target_weights:
        if np.isnan(target):
            current = 0.0
        elif current == 0.0 or abs(target - current) > band * max(abs(current), 1e-9):
            current = target
        held.append(current)
    return pd.Series(held, index=target_weights.index)


def portfolio_scaling(weights, covariance, target_vol):
    """Scale a whole book to a portfolio volatility target.

    Sizing each leg to its own target does not target the portfolio,
    because the legs are correlated.
    """
    portfolio_vol = np.sqrt(weights @ covariance @ weights)
    return weights * (target_vol / portfolio_vol)
```

---

#### See Also

* [Position Sizing](/quant-math/position-sizing)
* [Kelly Criterion](/quant-math/kelly)
* [Volatility](/quant-math/volatility)
* [Stop-Loss and Take-Profit Frameworks](/strategies/stop-loss)
* [Rebalancing](/quant-math/rebalancing)
* [GARCH](/stat-methods/garch)

---
