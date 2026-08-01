### Hedging LP Positions with Perps

> info **Metadata** Level: Advanced | Prerequisites: Perpetual Futures, Delta-Hedged LP, Funding Rate | Tags: hedging, perpetuals, funding, liquidation, basis, rebalancing, defi

The theoretical case for hedging a liquidity position is settled: the position has a known delta, that delta is unrewarded risk, and removing it isolates the market-making business. See [Delta-Hedged LP Strategies](/strategies/delta-hedged-lp) for that argument. This page is about the part that actually determines whether the trade works — the plumbing.

A perpetual futures hedge introduces four costs that do not appear anywhere in the gamma arithmetic: margin capital that cannot be deployed into the pool, a funding rate that can point either way, transaction costs on every rebalance, and a liquidation engine that does not know or care that your losing leg is offset by a gain locked inside a smart contract on another system. Any of the four can consume the entire edge. The last one can consume the position.

> warning **Not Financial Advice** This page describes the mechanics and failure modes of hedging with leveraged instruments. Hedges implemented with leverage introduce liquidation risk that unhedged positions do not have.

---

#### Sizing the Hedge

The hedge ratio is not estimated. For a full-range constant-product position, the delta in units of the risky asset is exactly the pool's reserve of that asset:

```text
Delta_full_range = x(P) = sqrt(k / P)
```

For a concentrated position with liquidity `L` over `[Pa, Pb]`, while in range:

```text
Delta_in_range = L * (1 / sqrt(P) - 1 / sqrt(Pb))
```

Outside the range the delta is a constant: `L * (1/sqrt(Pa) - 1/sqrt(Pb))` below `Pa`, and zero above `Pb`. **The delta of a concentrated position is therefore discontinuous in its own gradient at the boundaries**, which is the practical reason narrow-range positions are hard to hedge: the hedge requirement changes fastest exactly where the position is most likely to be moved.

Three sizing decisions follow and none is automatic:

**Which asset is the numeraire.** For a risky-versus-stablecoin pool there is one delta to hedge. For a pool of two volatile assets there are two, and hedging both requires two perpetual legs — or one leg plus the acceptance of residual exposure to the pair's ratio.

**Whether to hedge accrued fees.** Uncollected fees sit in the pool partly denominated in the risky asset and carry delta of their own. On a high-fee position over a long period this is not negligible, and it is easy to omit because the fee balance is not part of the liquidity formula.

**Where the margin comes from.** The hedge needs collateral in a separate account. That capital earns nothing in the pool, so the return must be computed on total capital deployed, not on the pool position alone.

---

#### Worked Example: Full Capital Accounting

An illustrative full-range position and its hedge. All numbers are chosen for the arithmetic.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Pool position value</td><td>200,000</td></tr>
    <tr><td>Price <code>P0</code></td><td>2,000</td></tr>
    <tr><td>Pool reserves</td><td>50 risky, 100,000 numeraire</td></tr>
    <tr><td>Hedge</td><td>short 50 units, 100,000 notional</td></tr>
    <tr><td>Hedge leverage</td><td>5x</td></tr>
    <tr><td>Maintenance margin</td><td>0.5% of notional</td></tr>
    <tr><td>Funding rate</td><td>0.01% per 8 hours, longs pay shorts</td></tr>
  </tbody>
</table>

**Capital.**

1. **Hedge margin**: `100,000 / 5 = 20,000`
2. **Total capital deployed**: `200,000 + 20,000 = 220,000`

Every return figure must be computed against 220,000, not 200,000. A 10% rate on the pool position is a 9.1% rate on the business.

**Funding.**

3. **Annualised funding**: `0.0001 * 3 * 365 = 10.95%`
4. **Annual funding received** on the 100,000 short: `10,950`
5. **As a rate on total capital**: `10,950 / 220,000 = 4.98%`

When funding is positive, the hedge is not a cost — it is a second revenue line, and a large one relative to the fee business it is protecting. This is the same carry described in [Cash-and-Carry](/strategies/cash-carry), and it means a hedged liquidity position is really three trades stacked: a market-making book, a short volatility position, and a funding-carry position. When funding inverts, the third leg becomes a drag of the same magnitude, and nothing about the first two changes to compensate. See [Funding Rate](/signals/funding-rate).

**Liquidation.**

6. **Liquidation price** of the short, solving `margin - 50 * (P - 2,000) = 0.005 * 50 * P`:

```text
20,000 + 100,000 = P * (50 + 0.25)
P_liq = 120,000 / 50.25 = 2,388.06
```

7. **Required move**: `2,388.06 / 2,000 - 1 = +19.4%`
8. **Pool value at that price**: `2 * sqrt(5,000,000 * 2,388.06) = 218,543`, a gain of `18,543`
9. **Hedge loss at that price**: `50 * 388.06 = 19,403`

The economics were fine — combined, the two legs are down only 860, the ordinary gamma cost of a 19.4% move. The *operations* failed. The hedge is liquidated at a 19.4% rally while 18,543 of offsetting gain sits inside a liquidity position that cannot be used as margin on the perpetual venue. After liquidation the trader holds an unhedged liquidity position, having realised the entire hedge loss and none of the pool gain.

This is the characteristic failure of the strategy and it is not a tail event. A 19.4% move is routine for a pair whose volatility justifies hedging in the first place. **The binding constraint is not whether the hedge is correct but whether it survives being correct.**

---

#### Rebalance Frequency and Cost

As the price moves, the pool's reserve of the risky asset changes and the hedge drifts out of line. The delta of a full-range position scales as `1 / sqrt(P)`, so a rebalance band expressed in delta terms translates into a wide band in price terms:

<table>
  <tbody>
    <tr><td><strong>Delta drift tolerated</strong></td><td><strong>Upward price move</strong></td><td><strong>Downward price move</strong></td></tr>
    <tr><td>2%</td><td>+4.1%</td><td>-3.9%</td></tr>
    <tr><td>5%</td><td>+10.8%</td><td>-9.3%</td></tr>
    <tr><td>10%</td><td>+23.5%</td><td>-17.4%</td></tr>
  </tbody>
</table>

Take the 5% band with 60% annualised volatility. The band is roughly `±0.100` in log price, so the expected time to first touch is `0.100^2 / 0.60^2 = 0.0278` years, about **10.2 days**, implying around **36 rebalances per year**. Each rebalance trades about 5% of the 100,000 hedge notional — 5,000 — and at 5 basis points all-in that is 2.50 per rebalance, or roughly **90 per year**.

Against a position earning tens of thousands, 90 is nothing. That result is counterintuitive and it deserves emphasis, because it corrects the usual intuition about hedging cost:

> info **Rebalancing frequency is not the expensive part** The expected gamma cost is `(1/2) * Gamma * E[(dP)^2]` regardless of how often you rehedge. Hedging more often reduces the variance of your tracking error around that cost; it does not reduce the cost. The real levers are funding, margin capital, and surviving liquidation — not the rebalance schedule.

That said, the schedule is not irrelevant, and the trade-off is genuine in both directions:

- **Too infrequent** leaves large unhedged delta between rebalances. The expected cost is unchanged but the realised outcome becomes lumpy, and a single large move while badly hedged is exactly what a risk limit exists to prevent.
- **Too frequent** on a chain with meaningful gas, or a venue with wide spreads, turns a negligible cost into a material one. The general result for delta hedging under proportional transaction costs is a no-trade band whose width scales with the cube root of the cost rate — hedge on a delta threshold, not on a clock. See [Delta Hedging](/derivatives/delta-hedging).
- **Rebalance on the wrong trigger** and the schedule itself becomes a signal. Rehedging at fixed times of day concentrates trades into predictable windows, which is an execution problem before it is a hedging one. See [Market Impact](/execution/market-impact).

---

#### Basis Risk Between the Legs

The hedge is a different instrument, on a different venue, marked against a different price. Four gaps open up and none closes by rebalancing harder.

**Pool price versus index price.** The liquidity position's delta is defined against the pool's own marginal price. The perpetual marks against its index — typically a composite of centralised venues. Under stress these diverge, so the hedge is sized against one price and settled against another.

**Perpetual price versus index price.** A perpetual can trade at a premium or discount to its own index; that is what funding exists to correct. The hedge's mark-to-market therefore moves with positioning as well as with price. See [Basis](/signals/basis).

**Asset identity.** A pool may hold a wrapped, bridged, or staked representation of the asset the perpetual tracks. Those are correlated instruments, not the same instrument, and the correlation is highest when it is least needed.

**Oracle and settlement.** Liquidation on the hedge is triggered by the venue's oracle. A brief oracle dislocation can liquidate a hedge that was never economically underwater. See [Oracle Manipulation](/risk/oracle-manipulation).

---

#### Assumptions and Failure Modes

- **Assumes margin can be moved between venues faster than the price moves.** It usually cannot. Withdrawing from a pool, bridging, and depositing as margin is a multi-step process with latency and cost, and it is needed precisely during the moves when everything is congested. Pre-fund the hedge account for the move you think is extreme, then assume that estimate is too small.
- **Assumes funding stays favourable.** Step 5 contributed 4.98% on total capital. Funding is a floating rate set by positioning, and a hedged liquidity provider is structurally short the perpetual — the same side as every basis trader. When that side becomes crowded, funding falls or inverts, and it does so for everyone at once.
- **Assumes the hedge is not itself a crowded trade.** If a large share of the pool's liquidity is hedged the same way, the unwind is correlated. Forced buying of the perpetual to close shorts is a rally, which liquidates the remaining short hedges.
- **Assumes leverage is a free choice.** Lower leverage on the hedge means more idle margin and a lower return; higher leverage means a nearer liquidation price. Step 6 is the entire trade-off in one equation, and the honest reading is that a hedge on 5x leverage cannot survive a 20% move.
- **Assumes the pool position is liquid on exit.** Unwinding requires withdrawing from the pool at the price prevailing then, with slippage, gas, and possibly an out-of-range position that has already converted to one asset.
- **Ignores the tax and accounting treatment of a two-legged position.** Realised losses on the hedge and unrealised gains in the pool are not necessarily symmetric in any jurisdiction, and cash must be found for the realised leg.
- **Assumes the delta calculation stays valid.** A concentrated position that exits its range has a delta that stops responding to price entirely. Continuing to rebalance against a formula that no longer applies converts a hedge into a directional position. See [Concentrated Liquidity LP](/strategies/concentrated-lp).
- **Two venues means two counterparties.** The position is only hedged if both settle. Venue failure, withdrawal suspension, or a chain halt turns one hedged book into two unhedged ones. See [Leverage and Liquidation](/risk/leverage-liquidation).

> warning **The hedge protects against price, not against being liquidated** A hedge sized correctly on economics and financed incorrectly on margin will be closed at the worst moment, leaving exactly the exposure it was opened to remove.

---

#### Code

```python
import numpy as np


def lp_delta(k, price):
    """Risky-asset delta of a full-range constant-product position."""
    return np.sqrt(k / price)


def concentrated_delta(liquidity, price, lower, upper):
    """Risky-asset delta of a concentrated position, including out of range.

    Flat outside the range: continuing to rebalance against the in-range
    formula there is a common and expensive mistake.
    """
    clamped = np.clip(price, lower, upper)
    return liquidity * (1.0 / np.sqrt(clamped) - 1.0 / np.sqrt(upper))


def hedge_liquidation_price(entry_price, units_short, margin,
                            maintenance_rate=0.005):
    """Price at which a short perpetual hedge is liquidated.

    Solves margin - units * (P - entry) = maintenance_rate * units * P.
    """
    numerator = margin + units_short * entry_price
    return numerator / (units_short * (1.0 + maintenance_rate))


def funding_annualised(rate_per_interval, intervals_per_day=3):
    """Simple annualisation. A floating rate, not a locked-in return."""
    return rate_per_interval * intervals_per_day * 365


def rebalance_trigger_prices(entry_price, delta_band=0.05):
    """Prices at which a full-range hedge drifts beyond `delta_band`.

    Delta scales as 1/sqrt(P), so a tight delta band is a wide price band.
    """
    return (entry_price / (1.0 - delta_band) ** 2,
            entry_price / (1.0 + delta_band) ** 2)


def total_capital_rate(pool_pnl, funding_pnl, pool_value, hedge_margin):
    """Return on everything committed, including idle hedge collateral."""
    return (pool_pnl + funding_pnl) / (pool_value + hedge_margin)
```

---

#### See Also

* [Perpetual Futures](/building-blocks/perpetual-futures)
* [Funding Rate](/signals/funding-rate)
* [Delta-Hedged LP Strategies](/strategies/delta-hedged-lp)
* [Delta Hedging](/derivatives/delta-hedging)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [Cash-and-Carry](/strategies/cash-carry)
* [Perp DEX Architecture](/protocols/perp-dex)

---
