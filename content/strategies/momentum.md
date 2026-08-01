### Simple Momentum on Price

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, Autocorrelation | Tags: momentum, trend-following, cross-sectional, time-series, risk-premium

Momentum is the claim that an asset's recent relative performance carries information about its next-period return — that winners keep winning and losers keep losing, over horizons of roughly one month to one year. It is among the oldest systematic strategies in existence, running continuously in managed futures programmes since long before electronic markets, and it is one of the few rules with a documented presence across equities, bonds, currencies, and commodities.

It is also the strategy most likely to be implemented without any thought about *why* it should work, because the rule is trivial to write down. That gap matters: momentum has a specific and unpleasant loss profile, and the mechanisms that generate its returns are the same mechanisms that generate its crashes.

> warning **Not Financial Advice** This page describes how momentum rules are constructed, what economic arguments support them, and how they fail. It is not a recommendation to trade.

---

#### Why It Might Work: The Economic Rationale

Momentum contradicts the simplest form of market efficiency, so any credible account must explain what friction or preference sustains it. Four families of explanation are standard, and they are not mutually exclusive.

**Slow information diffusion.** News does not reach all participants at once, and it is not fully incorporated on arrival. Analyst estimates are revised gradually, institutional mandates take weeks to reallocate, and coverage is uneven. Under this account, price adjusts to new information over weeks rather than instants, and a momentum position is a bet on the remainder of an incomplete adjustment. The prediction it makes is testable: momentum should be stronger where information is harder to process — smaller firms, less-covered instruments, more complex news.

**Behavioural underreaction and delayed overreaction.** Participants anchor on prior beliefs and update too slowly, then, once a trend is established, extrapolate it too far. The disposition effect — a reluctance to realise losses and a tendency to bank gains early — creates exactly the pattern of sticky supply above the entry price that slows a rally.

**Flow and constraint.** Some participants must trade in the direction of price. Trend-following programmes add to positions as trends extend; risk-parity and volatility-targeted books reduce exposure as volatility rises after a fall; margin calls force selling into declines. This is a mechanical, not a psychological, story, and it implies momentum is partly a crowding phenomenon that intensifies with the assets under management following it.

**Risk compensation.** Momentum's returns may be payment for a specific risk: the risk of the sharp reversal. A momentum book is, by construction, long whatever has been going up — which after a severe bear market means it is short the assets most likely to rebound violently. Under this account, momentum's premium is compensation for occasionally losing a great deal in a short time, and the crashes are not a flaw but the price being paid.

**What would have to be true.** For momentum to have positive expected return net of costs, price changes must exhibit positive serial dependence at the chosen horizon that is large enough to overcome turnover costs, and the mechanism sustaining it must not have been arbitraged away. If the only evidence is a backtest, the strategy is indistinguishable from a search result. See [Autocorrelation](/quant-math/autocorrelation) and [Backtest Overfitting](/stat-methods/backtest-overfitting).

---

#### Formal Definition

**Time-series momentum** takes a position in each asset based on its own past return:

```text
M_t(k) = P_t / P_{t-k} - 1

w_t = sign( M_t(k) )
```

**Cross-sectional momentum** ranks assets against each other and takes offsetting positions:

```text
rank assets by M_t(k, s) = P_{t-s} / P_{t-k} - 1
long  the top q assets,  weight  +1 / (2 * n_long)  each
short the bottom q assets, weight -1 / (2 * n_short) each
```

where:

- `k` is the formation lookback, conventionally 12 months
- `s` is the **skip period**, conventionally 1 month, omitted from the signal
- `q` is the number of assets on each side (a decile, quintile, or fixed count)
- `n_long`, `n_short` are the counts actually held

The skip period is not decoration. At horizons under a month, returns tend to exhibit *reversal* rather than continuation, driven by liquidity provision and bid-ask bounce. Including the most recent month in a 12-month signal mixes two effects with opposite signs. The "12-1" convention exists to separate them. See [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion).

**Volatility scaling** is standard practice, because raw momentum weights give the most volatile asset the most risk:

```text
w_scaled,i = w_i * (sigma_target / sigma_hat_i)
```

See [Dynamic Position Sizing](/strategies/dynamic-sizing).

---

#### Worked Example: One Cross-Sectional Rebalance

Five assets, ranked on 12-month return with the most recent month skipped. Long the top two, short the bottom two, equal weight, half the gross on each side. All numbers are illustrative arithmetic constructed for this example, not measured results.

<table>
  <tbody>
    <tr><td><strong>Asset</strong></td><td><strong>12-1 return</strong></td><td><strong>Rank</strong></td><td><strong>Weight</strong></td><td><strong>Next-month return</strong></td></tr>
    <tr><td>A</td><td>+34%</td><td>1</td><td>+0.50</td><td>-2.0%</td></tr>
    <tr><td>B</td><td>+12%</td><td>2</td><td>+0.50</td><td>+3.0%</td></tr>
    <tr><td>E</td><td>+5%</td><td>3</td><td>0.00</td><td>+1.5%</td></tr>
    <tr><td>C</td><td>-3%</td><td>4</td><td>-0.50</td><td>+1.0%</td></tr>
    <tr><td>D</td><td>-18%</td><td>5</td><td>-0.50</td><td>-4.0%</td></tr>
  </tbody>
</table>

1. **Long leg contribution**: `0.50 * (-0.020) + 0.50 * (0.030) = -0.010 + 0.015 = +0.005`
2. **Short leg contribution**: `-0.50 * (0.010) + -0.50 * (-0.040) = -0.005 + 0.020 = +0.015`
3. **Gross portfolio return**: `+0.005 + 0.015 = +0.020`, so +2.0% on 1.0 units of gross exposure.
4. **The short leg did the work.** Notice that the top-ranked asset lost money and the portfolio still profited. Cross-sectional momentum is a bet on *ordering*, not on direction — a property that makes it roughly market-neutral in normal conditions and dangerously not so during a reversal.
5. **Costs.** If the ranking changes such that half the book turns over monthly, annual turnover is on the order of 12 units of notional. At 10 basis points one-way that is 1.2% per year of drag against a strategy whose gross premium is measured in single-digit percentages.

---

#### Implementation Considerations

**Rebalance frequency versus signal decay.** A 12-month signal changes slowly, so daily rebalancing mostly trades noise. Monthly or fortnightly rebalancing with a no-trade buffer around the rank boundary captures most of the signal at a fraction of the turnover.

**Ranking on returns embeds a volatility bias.** The highest 12-month returns tend to belong to the highest-volatility assets, so an unadjusted ranking systematically overweights volatile names. Ranking on risk-adjusted momentum — `M_t(k) / sigma_hat` — removes much of this, and changes the strategy's character considerably.

**Neutralisation.** In equities, a raw cross-sectional momentum book takes large unintended sector and factor bets, because sectors trend together. Sector-neutral or beta-neutral construction isolates the momentum effect at the cost of some raw return. See [Factor Models](/stat-methods/factor-models).

**Signal construction is a choice, not a discovery.** Lookback, skip, rank cutoff, weighting scheme, rebalance frequency and neutralisation are at least six free parameters. Testing them all and reporting the best combination produces a result that describes the search. Pre-specify, or account for the search explicitly. See [Multiple Testing](/stat-methods/multiple-testing).

---

#### In Practice Across Asset Classes

**Equities.** The classic cross-sectional application, run on a large universe with sector neutralisation and a skip month. Costs and short-borrow availability bind on the short leg, and the effect concentrates in smaller, less liquid names — precisely where capacity is lowest. See [Short Selling](/markets/short-selling).

**Futures and managed futures.** The classic *time-series* application. A trend programme holds long and short positions across dozens of contracts sized to a common volatility target. The return series depends on how contracts are stitched across rolls, and the roll itself contributes carry that must be separated from the trend signal. See [Futures 101](/markets/futures-101) and [Roll and Carry](/markets/roll-and-carry).

**FX.** Momentum and carry interact: high-yielding currencies tend to trend upward until they do not, so a momentum signal in FX partially overlaps a carry position and inherits its crash risk. See [FX Carry and Parity](/markets/fx-carry-parity).

**Fixed income.** Momentum is mostly a duration and curve trend. Sizing must be in risk terms (DV01) rather than notional, or a single long-dated instrument dominates the book.

**Commodities.** Trends are frequently driven by physical supply and inventory dynamics, and momentum interacts strongly with the term structure — backwardated markets both trend and pay positive roll. Disentangling the two is a real modelling problem, not a technicality. See [Commodities](/markets/commodities).

**On-chain markets.** High volatility makes raw momentum signals look strong, and short history makes them impossible to validate. Costs are lumpy and state-dependent, funding costs apply to leveraged legs, and the effective universe changes composition rapidly, which makes cross-sectional ranking unstable.

---

#### Assumptions and Failure Modes

- **Assumes positive serial dependence at the chosen horizon.** In range-bound markets the sign flips repeatedly and the strategy pays costs on every flip. Whipsaw is not a bug; it is the strategy's behaviour when its core assumption is absent.
- **Assumes the reversal risk is acceptable.** Momentum's return distribution is negatively skewed. The worst episodes are short, violent rebounds after severe declines, when the short leg — full of beaten-down, high-beta names — rallies hardest. Sharpe ratios computed outside such an episode are uninformative about them. See [Sharpe Ratio](/quant-math/sharpe).
- **Assumes volatility is stable enough to size against.** Momentum crashes coincide with volatility spikes, so a volatility-targeted momentum book deleverages *after* the damage. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Assumes capacity.** The effect is strongest where liquidity is weakest. Impact costs scale with size in a way backtests using observed prices do not capture. See [Market Impact](/execution/market-impact).
- **Assumes the crowd has not arrived.** Momentum is a widely known, widely traded signal. Crowding amplifies returns while positions build and amplifies losses when they unwind, and neither effect is visible in a price-only backtest.
- **Assumes stable universe composition.** Cross-sectional ranks are meaningless if constituents enter and leave for reasons correlated with past returns — which delisting and index deletion both are.
- **Parameter sensitivity is the overfitting surface.** If results collapse when the lookback moves from 12 months to 10, the finding was noise. Robustness across neighbouring parameters is weak evidence of a real effect; sensitivity is strong evidence against.

---

#### Code

```python
import numpy as np
import pandas as pd


def momentum_signal(prices, lookback=252, skip=21):
    """12-1 style momentum: return over `lookback`, excluding the most
    recent `skip` bars where short-horizon reversal dominates.

    prices: DataFrame indexed by date, one column per asset.
    """
    return prices.shift(skip) / prices.shift(lookback) - 1.0


def cross_sectional_weights(signal_row, n_per_side=2):
    """Equal-weight long the top names and short the bottom names,
    gross exposure 1.0 split evenly across the two sides."""
    ranked = signal_row.dropna().sort_values(ascending=False)
    if len(ranked) < 2 * n_per_side:
        return pd.Series(0.0, index=signal_row.index)

    weights = pd.Series(0.0, index=signal_row.index)
    weights[ranked.index[:n_per_side]] = 0.5 / n_per_side
    weights[ranked.index[-n_per_side:]] = -0.5 / n_per_side
    return weights


def time_series_momentum(prices, lookback=252, vol_window=60,
                         target_vol=0.10, periods_per_year=252):
    """Long/short each asset on its own trend, scaled to a common
    volatility target so no single asset dominates portfolio risk."""
    trend = np.sign(prices / prices.shift(lookback) - 1.0)
    realised = (prices.pct_change()
                      .rolling(vol_window)
                      .std() * np.sqrt(periods_per_year))
    # Cap leverage: a near-zero vol estimate would otherwise demand
    # an unbounded position exactly when the estimate is least reliable.
    scale = (target_vol / realised).clip(upper=3.0)
    return trend * scale
```

---

#### See Also

* [Momentum vs Mean Reversion](/signals/momentum-vs-mean-reversion)
* [Moving Average Crossovers](/signals/ma-crossovers)
* [Dynamic Position Sizing](/strategies/dynamic-sizing)
* [Autocorrelation](/quant-math/autocorrelation)
* [Factor Models](/stat-methods/factor-models)
* [Backtest Overfitting](/stat-methods/backtest-overfitting)

---
