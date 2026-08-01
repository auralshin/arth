### Market Making Lite

> info **Metadata** Level: Advanced | Prerequisites: Order Books, Volatility, Slippage | Tags: market-making, inventory, adverse-selection, spread, liquidity, quoting

A market maker posts a price at which it will buy and a price at which it will sell, and stands ready to trade at both. The difference is the **spread**, and it is the fee charged for a service: immediacy. Someone who wants to trade now, rather than waiting for a natural counterparty, pays that fee.

The strategy sounds like a toll booth and is not. Against the spread stand two costs that determine whether the business is viable at all. The first is **inventory risk**: every fill leaves an unwanted position that moves before it can be unwound. The second is **adverse selection**: some of the counterparties know something, and against them the maker systematically buys before prices fall and sells before they rise. A market maker who understands only the spread and neither of these will quote too tight and lose money reliably.

> warning **Not Financial Advice** This page explains the economics and mechanics of quoting. It is not a recommendation to make markets, which requires infrastructure, capital, and in many venues a regulatory licence.

---

#### Why It Might Work: The Economic Rationale

**The maker is paid for supplying immediacy.** Buyers and sellers do not arrive at the same instant. Without an intermediary willing to hold the asset in between, an urgent seller would have to wait, or accept a much worse price from whoever happened to be looking. The market maker bridges the gap in time by holding inventory, and the spread is the rent on that service. This is a real economic function and a genuine source of return, independent of any view on price.

**The compensation must cover two distinct costs.** The classical literature splits them, and the split is worth keeping straight because they call for different responses:

- **Inventory cost** (Stoll; Ho and Stoll; Avellaneda and Stoikov). After a fill, the maker holds a position it did not want. That position has variance, and the maker is risk-averse. The spread must compensate for the variance carried between the fill and the offsetting trade. The response is to **skew quotes** — shade both sides in the direction that unloads inventory.

- **Adverse selection cost** (Glosten and Milgrom; Kyle). A fraction of order flow comes from participants with better information. Against them, every fill is a loss, because they buy from the maker only when the maker's ask is too low. The response is to **widen** — and to widen more when the probability of informed flow is higher, which is why spreads blow out before scheduled announcements. See [Adverse Selection](/execution/adverse-selection).

**What would have to be true.** For quoting to be profitable, the realised spread capture across all fills must exceed the sum of adverse-selection losses, inventory variance costs, exchange fees, and infrastructure cost. That is a demanding condition, and the reason it is met at all is that a meaningful share of order flow is *uninformed* — hedging, rebalancing, liquidation, and retail flow that trades for reasons unrelated to short-term price. Market making is, at bottom, a bet on the mix of the flow you receive. Where that mix is unfavourable — a venue where informed participants concentrate, or a market where you are consistently last to see information — no spread is wide enough.

---

#### Formal Definition

The Avellaneda–Stoikov framework gives a compact and interpretable pair of quotes. Start with the **reservation price**, the mid adjusted for the inventory the maker is carrying:

```text
r_t = S_t - q_t * gamma * sigma^2 * (T - t)
```

Then the total spread between the two quotes:

```text
spread_total = gamma * sigma^2 * (T - t) + (2 / gamma) * ln(1 + gamma / kappa)

bid_t = r_t - spread_total / 2
ask_t = r_t + spread_total / 2
```

where:

- `S_t` is the current mid price
- `q_t` is inventory in units, positive when long
- `gamma` is the maker's risk aversion
- `sigma` is the volatility of the mid, in price units per unit time
- `T - t` is the remaining time to the risk horizon
- `kappa` is the decay rate of fill probability with distance from mid — a large `kappa` means orders arrive only very close to mid

The two terms of `spread_total` are exactly the two costs above: the first is the inventory-risk term, rising with risk aversion, volatility, and horizon; the second is the term that captures the trade-off between fill rate and margin per fill.

The **adverse-selection break-even** is a separate and equally important condition. Let `alpha` be the fraction of fills that come from informed flow, `m` the expected adverse move in the mid conditional on a fill being informed, and `h` the half-spread:

```text
E[P&L per fill] = (1 - alpha) * h + alpha * (h - m) = h - alpha * m

break-even:  h = alpha * m
```

With `alpha = 0.15` and `m = 4.0` price units, the half-spread must exceed 0.60 simply to break even against informed flow — before inventory risk, before fees. This is why "the spread looks wide, I will undercut it" is usually a mistake rather than an opportunity.

---

#### Worked Example: One Round Trip, and Where the Spread Went

Parameters: `S = 100.00`, `gamma = 0.1`, `sigma^2 = 4.0`, `T - t = 1`, `kappa = 1.5`. All figures are illustrative arithmetic, not a measured result.

1. **Spread width**: `0.1 * 4.0 * 1 + (2 / 0.1) * ln(1 + 0.1 / 1.5) = 0.4000 + 20 * ln(1.066667) = 0.4000 + 20 * 0.064539 = 1.6908`, so the half-spread is 0.8454.

<table>
  <tbody>
    <tr><td><strong>State</strong></td><td><strong>Mid</strong></td><td><strong>Inventory q</strong></td><td><strong>Reservation r</strong></td><td><strong>Bid</strong></td><td><strong>Ask</strong></td></tr>
    <tr><td>Start</td><td>100.00</td><td>0</td><td>100.00</td><td>99.1546</td><td>100.8454</td></tr>
    <tr><td>After buy fill</td><td>99.50</td><td>+1</td><td>99.10</td><td>98.2546</td><td>99.9454</td></tr>
    <tr><td>Illustrative, q = +2</td><td>100.00</td><td>+2</td><td>99.20</td><td>98.3546</td><td>100.0454</td></tr>
  </tbody>
</table>

2. **First fill**: someone sells to the maker at the bid of 99.1546. Inventory becomes +1, cash becomes -99.1546.
3. **The mid moves against the position**: it falls to 99.50. The seller was, at least partly, informed.
4. **Quotes reprice**: with `q = +1`, the reservation price is `99.50 - 1 * 0.1 * 4.0 * 1 = 99.10`, which is 0.40 *below* the new mid. The maker is now shading both quotes downward to encourage a sale. The new ask is 99.9454.
5. **Second fill**: someone buys from the maker at 99.9454. Inventory returns to 0, cash becomes `-99.1546 + 99.9454 = +0.7908`.
6. **Attribution**: the quoted spread was 1.6908, but the round trip realised 0.7908. The 0.9000 difference decomposes exactly: **0.50 lost to the mid moving against the inventory** (adverse selection), and **0.40 given up as inventory skew** to get the position off. Both are real costs, and neither appears in a calculation that multiplies fill count by quoted spread.

This decomposition is the core diagnostic of a quoting business. A maker who tracks only gross spread captured is measuring the revenue line and ignoring the two largest expense lines.

---

#### Inventory Risk and Adverse Selection in Practice

**Inventory is a directional position you did not choose.** Its risk scales with `sigma * sqrt(holding_time)` and with the size of the position. Three standard controls, in increasing order of aggression: skew the quotes (as above), widen the side that would add to inventory, and hedge the inventory outright in a correlated instrument. The third converts inventory risk into basis risk. See [Delta-Neutral Strategies](/strategies/delta-neutral).

**Adverse selection is not fraud and cannot be eliminated.** It is the structural cost of posting a firm price into a market where information arrives asynchronously. It shows up as **markout**: the mid price a fixed interval after each fill, measured relative to the fill price. A consistently negative markout at 1 second means the maker is being picked off by fast participants; a negative markout only at 5 minutes means the flow carries slower fundamental information. These call for different responses — the first is a latency problem, the second is a pricing problem.

**Order flow is not homogeneous.** Where venue rules permit it, segmenting flow by counterparty and quoting differently is the single largest lever in the business, and is a substantial part of why retail order flow is valuable to intermediaries.

**Queue position matters as much as price.** On a venue with price-time priority, being first in the queue at a given price is worth a great deal: the orders at the front of the queue are filled by the benign flow that arrives before the price moves, and the orders at the back are disproportionately filled by the flow that moves it.

---

#### In Practice Across Asset Classes

**Equities.** Fragmented across many venues with maker-taker fee schedules, so a meaningful share of the economics is the rebate rather than the spread. Tick size sets a floor on the spread and therefore determines whether queue position or price improvement is the binding competition. See [Smart Order Routing](/execution/smart-order-routing).

**Futures.** Single venue per contract, central limit order book, strict price-time priority. Competition is over speed and queue position rather than venue selection, and the tick is often binding on liquid contracts.

**FX.** No central exchange. Liquidity is provided by banks and non-bank makers on multiple platforms, with "last look" — a brief window in which a quote can be rejected — materially changing the adverse-selection economics, since the maker can decline the fills that look toxic.

**Options.** The maker quotes hundreds of strikes and expiries simultaneously, so quoting is really surface fitting. Delta is hedged immediately; the retained exposure is vega and gamma across the surface. Adverse selection appears as being lifted on exactly the strikes where the surface was mispriced. See [Vol Surface](/derivatives/vol-surface).

**Fixed income and credit.** Largely request-for-quote rather than a continuous book. The dealer commits principal risk on a single large trade and holds inventory for days, so inventory risk dominates and adverse selection takes the form of a client who is asking several dealers at once.

**On-chain markets.** An automated market maker is a market maker with a fixed, published quote schedule that cannot be updated between blocks. That is the strongest possible form of adverse selection: an arbitrageur observing a price move elsewhere trades against the stale curve with certainty. The resulting cost is known as **loss-versus-rebalancing**, and it is the AMM analogue of the markout above — the systematic gap between the pool's outcome and simply holding the rebalanced portfolio. Concentrated liquidity is range-based quoting, which raises fee capture per unit of capital and raises exposure to exactly this effect. See [AMMs 101](/building-blocks/amms-101), [Concentrated Liquidity](/protocols/concentrated-liquidity), and [LP Business](/strategies/lp-business).

---

#### Assumptions and Failure Modes

- **Assumes a favourable flow mix.** If informed flow rises — around announcements, during a dislocation, or on a venue that attracts it — the break-even half-spread rises with it. Quoting an unchanged spread into changed flow is the most direct way to lose money.
- **Assumes quotes can be updated in time.** The model treats quoting as continuous. In reality quotes are stale between updates, and a stale quote in a fast market is a free option written to the market. Latency is not a performance detail; it is the size of that option. See [Latency Risk](/microstructure/latency-risk).
- **Assumes volatility is known.** `sigma` enters both the skew and the width. An estimate that lags a volatility spike leaves quotes far too tight exactly when they should be widest. See [GARCH](/stat-methods/garch).
- **Assumes the arrival model is stable.** `kappa` is fitted to historical fill data. Fill intensity as a function of distance from mid changes with the competitive landscape, and a `kappa` fitted in one regime produces systematically wrong spreads in another.
- **Assumes inventory can be unwound.** In a one-way market there is nobody on the other side. Inventory limits that are never tested in normal conditions are the constraint that binds during a crash, and a maker who keeps quoting a falling market accumulates the entire market's unwanted position.
- **Assumes fees and rebates persist.** Where a large share of revenue is a rebate, the strategy is exposed to an exchange's fee schedule as a business risk.
- **Capacity is bounded by flow, not by capital.** The revenue is proportional to volume traded against the quotes. Doubling capital does not double the flow; it usually means quoting tighter for the same flow, which erodes the margin.
- **Backtests of quoting strategies are especially unreliable.** They must simulate whether the maker's own order would have been filled, and queue position, fill probability, and the market's reaction to the maker's presence are all being assumed rather than observed. See [Backtest vs Live](/risk/backtest-vs-live) and [Order Book Simulation](/simulation/orderbook).

---

#### Code

```python
import numpy as np


def reservation_price(mid, inventory, risk_aversion, variance, time_left):
    """Inventory-adjusted mid. Shifts away from the side that would
    increase an already unwanted position."""
    return mid - inventory * risk_aversion * variance * time_left


def optimal_spread(risk_aversion, variance, time_left, arrival_decay):
    """Avellaneda-Stoikov total spread: inventory-risk term plus the
    fill-rate / margin trade-off term."""
    inventory_term = risk_aversion * variance * time_left
    liquidity_term = (2.0 / risk_aversion) * np.log(
        1.0 + risk_aversion / arrival_decay
    )
    return inventory_term + liquidity_term


def quotes(mid, inventory, risk_aversion, variance, time_left,
           arrival_decay, max_inventory=None):
    """Two-sided quotes with an inventory skew.

    Pulling a side entirely once the position limit is hit is a hard
    control the continuous model does not provide, and it is what stops
    a one-way market from filling the book indefinitely.
    """
    r = reservation_price(mid, inventory, risk_aversion, variance, time_left)
    half = optimal_spread(risk_aversion, variance, time_left, arrival_decay) / 2.0

    bid, ask = r - half, r + half
    if max_inventory is not None:
        if inventory >= max_inventory:
            bid = None
        if inventory <= -max_inventory:
            ask = None
    return bid, ask


def markout(fill_price, mid_after, side):
    """Signed P&L per unit against the mid some interval after the fill.

    Persistently negative markouts mean the flow is informed relative to
    the maker's update speed; this is the number that decides whether a
    quoting business works, not the gross spread captured.
    """
    return (mid_after - fill_price) if side == "buy" else (fill_price - mid_after)
```

---

#### See Also

* [Adverse Selection](/execution/adverse-selection)
* [Order Books vs AMMs](/microstructure/orderbooks-vs-amms)
* [Market Impact](/execution/market-impact)
* [Latency Risk](/microstructure/latency-risk)
* [Order Book Simulation](/simulation/orderbook)
* [LP Business](/strategies/lp-business)

---
