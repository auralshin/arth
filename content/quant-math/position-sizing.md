### Position Sizing

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Drawdown, Volatility | Tags: position-sizing, risk, leverage, capital-allocation

Position sizing converts a view into an exposure. A signal says which direction; sizing says how much, and it is the decision that determines whether a correct view survives long enough to pay. Two traders with identical signals and identical entry prices can produce entirely different outcomes, one compounding steadily and the other liquidated in a routine drawdown, purely from sizing.

The recurring theme is that size should be set by risk rather than by conviction or by capital. An equal-currency allocation across instruments with different volatilities is not an equal allocation of risk; it is a large bet on the most volatile instrument and a rounding error on the least. Almost every sizing rule in practice is a way of equalising something other than notional.

---

#### Formal Definition

**Volatility targeting.** To make a position contribute a target volatility, scale inversely with the asset's own volatility:

```text
w = sigma_target / sigma_asset
notional = w * capital
```

where:

- `sigma_target` is the annualised volatility you want the position to contribute
- `sigma_asset` is the asset's annualised volatility
- `w` is the fraction of capital, which may exceed 1 for low-volatility assets

**Risk-per-trade sizing.** Fix the loss incurred if the stop is reached:

```text
units = (risk_fraction * capital) / stop_distance_per_unit
```

where `risk_fraction` is the share of capital risked on the idea, typically a small number, and `stop_distance_per_unit` is the currency distance from entry to the exit level.

**Portfolio level.** Individually sized positions do not automatically produce the intended portfolio risk. For `n` positions each contributing standalone volatility `s` with equal pairwise correlation `rho`:

```text
sigma_portfolio = s * sqrt( n + n*(n-1)*rho )
```

Correlation, not the count of positions, determines the result.

**Kelly connection.** The growth-optimal fraction is `(mu - r) / sigma^2`. If the excess return `mu - r` is assumed roughly constant, this is proportional to `1 / sigma^2`, and the volatility of the resulting position is proportional to `1 / sigma` — which is exactly volatility targeting. Volatility targeting is fractional Kelly under a constant-edge assumption. See [Kelly Criterion](/quant-math/kelly).

---

#### Worked Example

Capital is `£500,000`.

**Volatility targeting.** The strategy should contribute `10%` annualised volatility. The asset's estimated annualised volatility is `25%`.

1. `w = 10% / 25% = 0.40`
2. Notional exposure `0.40 * £500,000 = £200,000`

If volatility subsequently doubles to `50%`, the rule halves the position: `w = 10% / 50% = 0.20`, notional `£100,000`. The position shrinks as risk rises, mechanically and without a view.

**Risk-per-trade.** The same capital, risking `0.5%` on one idea. Entry at `50.00`, stop at `48.00`.

3. Risk budget: `0.005 * £500,000 = £2,500`
4. Stop distance: `50.00 - 48.00 = £2.00` per unit
5. Units: `£2,500 / £2.00 = 1,250`
6. Notional: `1,250 * £50.00 = £62,500`, which is `12.5%` of capital

Now tighten the stop to `49.00`. The risk budget is unchanged, but the distance halves to `£1.00`, so the size doubles to `2,500` units and `£125,000` notional — `25%` of capital. **The stop distance is the leverage dial.** A tight stop on a volatile instrument produces a very large position and a high probability of being stopped out by noise. Setting the stop from a volatility measure such as Average True Range rather than from a round number keeps the two decisions consistent. See [ATR](/signals/atr).

**Portfolio aggregation.** Four positions, each sized to contribute `5%` annualised volatility:

<table>
  <tbody>
    <tr>
      <td><strong>Average pairwise correlation</strong></td>
      <td><strong>Portfolio volatility</strong></td>
    </tr>
    <tr><td>0.0</td><td>10.0%</td></tr>
    <tr><td>0.5</td><td>15.8%</td></tr>
    <tr><td>1.0</td><td>20.0%</td></tr>
  </tbody>
</table>

The same four positions produce anything from 10% to 20% portfolio volatility depending only on correlation. Sizing each leg correctly in isolation does not size the portfolio.

> warning **Correlation is the sizing input most often left out** A book of twelve independently sized positions in a single sector is one position in twelve pieces. Size against the portfolio covariance, not against a list.

---

#### Sizing Against a Drawdown Budget

Volatility targeting controls dispersion; it does not directly control the depth of a decline. A cruder but more directly meaningful constraint works backwards from tolerance:

```text
leverage <= tolerable_drawdown / historical_unlevered_drawdown
```

If a strategy's historical maximum drawdown was `12%` and the mandate cannot survive worse than `20%`, this caps leverage at about `1.67x`. Two warnings apply. Drawdown does not scale linearly with leverage once financing costs and forced deleveraging enter. And the historical maximum drawdown is a single observation from one path — the future worst case will very likely exceed it. Treat the ratio as an upper bound to be discounted, not a target. See [Drawdown](/quant-math/drawdown).

**Distance to forced exit** is the constraint that overrides everything else. For a collateralised position, size is bounded by how far the market can move before someone else closes the trade for you, not by how much loss you are willing to accept.

---

#### In Practice Across Asset Classes

- **Equities.** Sizing is usually expressed as a percentage of a benchmark weight or as a factor exposure rather than as raw notional, because the mandate constrains active risk rather than total risk. Liquidity caps — a maximum share of average daily volume — frequently bind before risk limits do. See [Market Impact](/execution/market-impact).
- **Futures.** Contracts are indivisible, so sizing rounds to whole contracts, which is a material constraint for small accounts in large-multiplier contracts. Exposure is set by notional, but capital consumed is initial margin, so the two must be tracked separately. See [Futures 101](/markets/futures-101).
- **FX.** Positions in several pairs share underlying currency exposures, so sizing must be done on net currency exposure rather than per pair. Sizing each cross independently double-counts the shared leg.
- **Fixed income.** Size is set in duration or DV01 terms rather than notional, because a given cash amount of a 2-year and a 30-year bond carry vastly different risk. Equal notional across the curve is an enormous bet on the long end. See [Duration & Convexity](/markets/duration-convexity).
- **Credit.** Position size is bounded by what can be exited, and issue size and recent traded volume matter more than volatility. Volatility-based sizing on smoothed marks produces positions far too large.
- **Options.** Notional is close to meaningless. Sizing is done in delta, gamma, and vega terms, and a position that is small in premium can be enormous in gamma. See [Greeks](/derivatives/greeks).
- **On-chain.** The binding constraint is the liquidation threshold. A position with `£100,000` of collateral and `£50,000` borrowed sits at 50% loan-to-value; if liquidation triggers at 80%, the collateral can fall only to `£62,500` before forced closure — a `37.5%` decline. Sizing must be set against that distance, not against a volatility target, and must allow for oracle lag and for slippage during a cascade. See [Liquidations](/building-blocks/liquidations).

---

#### Assumptions and Failure Modes

- **Volatility is estimated, and it is stale.** A rolling estimate reflects the recent past. When volatility jumps, the rule sizes down only after the loss has been taken. See [Rolling Windows](/quant-math/rolling-windows).
- **Volatility targeting is procyclical.** Everyone using it sells the same assets after the same volatility spike. The rule that protects an individual book can amplify a market-wide move.
- **Correlations rise in stress.** A portfolio sized to a 10% target under normal correlations can deliver far more when correlations converge towards one. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Volatility is not the risk that matters for jumpy assets.** For anything with gap risk — credit, pegged currencies, single names before an announcement — the relevant measure is the size of the jump, not the standard deviation of ordinary days. See [Jump Processes](/quant-math/jumps).
- **Sizing rules ignore liquidity.** A position that is correct on risk may be impossible to exit at the marked price. Exit capacity, not entry availability, sets the real limit.
- **Rebalancing to a target has a cost.** Continuous volatility targeting generates continuous turnover. In a market with meaningful spreads or gas costs, the tracking benefit can be smaller than the trading cost. See [Rebalancing](/quant-math/rebalancing).
- **Backtested sizing assumes fills at the model price.** A rule that scales down in a crisis assumes there was a buyer. See [Backtest vs Live](/risk/backtest-vs-live).

---

#### Code

```python
import numpy as np

def volatility_target_weight(target_vol, asset_vol, max_leverage=None):
    """Fraction of capital to allocate for a target volatility contribution.

    A cap matters: low measured volatility produces very large weights,
    and low measured volatility is often a measurement artefact.
    """
    weight = target_vol / asset_vol
    return weight if max_leverage is None else min(weight, max_leverage)


def units_from_risk_budget(capital, risk_fraction, stop_distance_per_unit):
    """Position size such that hitting the stop loses exactly the risk budget."""
    return (capital * risk_fraction) / stop_distance_per_unit


def scale_to_portfolio_target(weights, covariance_matrix, target_vol):
    """Rescale a whole book so its combined volatility hits the target.

    Sizing legs individually ignores correlation; this fixes it at the book level.
    """
    w = np.asarray(weights, dtype=float)
    current_vol = np.sqrt(w @ np.asarray(covariance_matrix, dtype=float) @ w)
    return w * (target_vol / current_vol)
```

---

#### See Also

* [Kelly Criterion](/quant-math/kelly)
* [Rebalancing](/quant-math/rebalancing)
* [Drawdown](/quant-math/drawdown)
* [Volatility](/quant-math/volatility)
* [Optimization](/quant-math/optimization)
* [Leverage & Liquidation](/risk/leverage-liquidation)
* [Dynamic Sizing](/strategies/dynamic-sizing)

---
