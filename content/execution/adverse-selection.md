### Adverse Selection

> info **Metadata** Level: Advanced | Prerequisites: Order Types, Market Impact, Orderbooks vs AMMs | Tags: execution, adverse-selection, toxicity, market-making, markouts

Adverse selection is the tendency for the trades you get to be the trades you least wanted. A resting limit order is a free option granted to the rest of the market: anyone may execute against it at their choosing, and they will choose to do so when it is in their interest. The fills therefore arrive disproportionately just before the price moves against the side you were on.

This is not a subtle statistical effect at the margin — it is the central economic fact of passive trading. A market maker whose quoted spread does not cover the losses from informed counterparties loses money on every round trip, no matter how tight the operational costs. And for a large institutional order, adverse selection is the mechanism by which patience converts into cost: the longer an order rests, the more of it is filled by exactly the participants who know the price is about to move.

---

#### Formal Definition

Split incoming flow into two types. **Uninformed** flow trades for reasons unrelated to short-horizon price direction — hedging, rebalancing, liquidity needs. **Informed** flow trades because it expects the price to move within the horizon that matters.

For a market maker quoting a half-spread `s` around a mid price:

```text
E[profit per share]  =  (1 - alpha) * s  +  alpha * (s - delta)
                     =  s  -  alpha * delta
```

where:

- `alpha` is the fraction of flow that is informed
- `delta` is the expected mid-price move against the maker, conditional on trading with informed flow
- `s` is the half-spread earned on every fill

Setting expected profit to zero gives the **breakeven half-spread**:

```text
s*  =  alpha * delta
```

This is the adverse-selection component of the spread. It is why the spread exists at all: even a market maker with zero inventory risk, zero capital cost, and zero operating expense must quote a positive spread, purely to break even against informed counterparties.

The empirical counterpart is the **markout**, the mid-price change measured at a horizon after a fill:

```text
markout(h)  =  side * (mid(t + h) - fill_price)     side = +1 buy, -1 sell
```

Positive markouts mean the fill was good; negative means it was adversely selected. Plotting markout against `h` produces the markout curve, the standard diagnostic for flow quality.

---

#### Worked Example

**The market maker's problem.** A maker quotes 99.98 bid / 100.02 offer around a 100.00 mid, so `s = 0.02`, a half-spread of 2 bps. Of the flow that hits these quotes, 10% is informed, and when informed flow trades the mid moves 0.30 in the trader's favour within the relevant horizon.

1. Uninformed fills: earn the half-spread, `0.9 * 0.02 = +0.018` per share
2. Informed fills: earn the half-spread but lose the move, `0.1 * (0.02 - 0.30) = 0.1 * (-0.28) = -0.028` per share
3. Expected: `0.018 - 0.028 = -0.010` per share

4. Breakeven half-spread: `s* = alpha * delta = 0.10 * 0.30 = 0.03`, i.e. **3 bps**, a quoted spread of 6 bps

The maker loses 1 cent per share — 1 bp — despite capturing the spread on nine trades out of ten, because the one bad trade in ten is 15 times the size of a good one. At 2 bps the business is unviable: the maker must widen to at least 3 bps, reduce `alpha` by refusing certain flow, or reduce `delta` by cancelling faster. Every real market-making system does all three.

**The passive trader's markout curve.** You post a bid at 99.98 with the mid at 100.00 and get filled. Tracking the mid afterwards:

<table>
  <tbody>
    <tr><td><strong>Horizon</strong></td><td><strong>Mid</strong></td><td><strong>Markout per share</strong></td><td><strong>bps</strong></td></tr>
    <tr><td>At fill</td><td>100.00</td><td>+0.02</td><td>+2</td></tr>
    <tr><td>+1 second</td><td>99.99</td><td>+0.01</td><td>+1</td></tr>
    <tr><td>+10 seconds</td><td>99.95</td><td>&minus;0.03</td><td>&minus;3</td></tr>
    <tr><td>+60 seconds</td><td>99.90</td><td>&minus;0.08</td><td>&minus;8</td></tr>
  </tbody>
</table>

The apparent 2 bps of captured spread decays and turns into an 8 bps loss within a minute. That is the shape of an adversely selected fill: profitable at the instant of execution, unprofitable once the information arrives.

> info **The markout horizon is the whole argument** A maker who can flatten within one second sees this fill as a winner. A maker holding for a minute sees a loser. Two participants with identical fills and different holding periods reach opposite conclusions about the same flow, which is why holding period and quoting strategy are inseparable.

---

#### Toxicity and What Makes Flow Toxic

"Toxic" flow is flow with persistently negative markouts for the liquidity provider. Toxicity is not a property of a counterparty's intentions; it is a property of the joint distribution of their trades and subsequent price moves. A pension fund rebalancing mechanically on the last day of the month can be highly toxic if everyone knows the rebalance is coming.

Practitioners measure it several ways. The simplest is the average markout at a chosen horizon, computed per counterparty, per venue, and per order type. Published measures also exist — order flow imbalance and volume-synchronised probability of informed trading are the best known — each of which attempts to infer `alpha` from observable trade and quote data. They differ in what they assume about how informed traders behave, and they disagree in practice; treat any single toxicity metric as one lens rather than a measurement.

Three responses are available to a liquidity provider, and they map exactly to the three terms in `s* = alpha * delta`.

**Widen `s`.** Simple, and it loses the profitable uninformed flow first, because uninformed traders are the price-sensitive ones: widening reduces losses and volume together. **Reduce `alpha`.** Segment the flow. This is the economic basis for internalisation, single-dealer platforms, retail wholesaling, and private orderflow arrangements: if you can quote only to flow you have measured as benign, you can quote tighter than the public market. It is also why the residual flow reaching the public book is more toxic than the average — the benign portion has been removed upstream.

**Reduce `delta`.** Cancel and re-quote faster, so the window in which a stale quote can be picked off shrinks. This is the direct economic motivation for latency investment; see [Latency Risk](/microstructure/latency-risk).

The taker's mirror image matters too. If your executions consistently show *positive* markouts, you are the informed side — good for your profit and loss, and a reason liquidity providers will progressively widen to you, refuse to internalise you, or route you to venues where you pay more.

---

#### In Practice Across Asset Classes

**Equities.** Retail flow is widely regarded as relatively benign and is heavily competed for by wholesalers; the flow that remains on lit exchanges is correspondingly more toxic. Dark pools vary enormously in toxicity, and measuring venue-level markouts is a standard part of [routing](/execution/smart-order-routing).

**Futures.** A single anonymous book prevents counterparty segmentation, so `alpha` cannot be reduced by choosing whom to trade with; makers compete on `delta` instead — cancellation speed — which is why futures markets have among the highest quote-to-trade ratios anywhere. **FX.** Segmentation is the norm rather than the exception: dealers stream different prices to different clients based on measured flow quality. Last look exists largely as an adverse-selection defence, allowing a dealer to reject a trade when the market has moved in the interval between quote and acceptance. Whether that is risk management or a free option held by the dealer is genuinely contested.

**Fixed income.** In request-for-quote, adverse selection operates before any trade: a dealer who is asked for a price in size learns that someone wants to trade and must price the possibility that the enquiry went to several dealers. The winner of a competitive enquiry is by construction the dealer who mispriced it most — a winner's-curse problem that dealers explicitly price for.

**On-chain.** Automated market maker liquidity providers are the purest case of adverse selection in finance: the pool quotes a mechanical price and cannot cancel, so arbitrageurs trade against it whenever the external price moves. The resulting loss is the economic core of what is measured as [impermanent loss](/building-blocks/impermanent-loss), and it is unavoidable for a passive constant-function pool. Because pool quotes are stale by construction between blocks, `delta` is bounded by the block time rather than by the provider's reaction speed. See [AMMs Depth](/protocols/amms-depth), [Concentrated Liquidity](/protocols/concentrated-liquidity), and [MEV Overview](/building-blocks/mev-overview).

---

#### Assumptions and Failure Modes

- **Flow separates cleanly into informed and uninformed.** It does not. Most flow is partially informative, and the same counterparty is informed in some conditions and not others. The two-type model is a device, not a description.
- **`alpha` and `delta` are stable.** Both spike together in stressed conditions: informed participants trade more, and the moves are larger. The breakeven spread widens exactly when widening is most damaging to the market's function.
- **Markouts measure adverse selection.** They measure adverse selection *plus* your own market impact plus drift: a large passive order that pushes the market and then sees it revert produces markouts that look like adverse selection and are not.
- **The markout horizon is well chosen.** Results are extremely sensitive to it — a strategy can look profitable at one second and unprofitable at one minute, so reporting a single horizon without justification is close to meaningless.
- **Segmentation is a durable edge.** Flow quality shifts as counterparties change behaviour, and any classification learned from history decays. A counterparty measured as benign will not stay benign if it becomes profitable to exploit that classification.
- **Adverse selection is only a market maker's problem.** Any resting order is exposed, including a patient institutional [limit order](/execution/order-types). The cost appears as a low fill rate on the good days and a high fill rate on the bad ones.

> warning **A high fill rate on passive orders is not good news** If your resting orders always fill, they are filling when someone wants them to. Fill rate and markout must be read together; either alone is misleading.

---

#### Code

```python
import numpy as np


def breakeven_half_spread(informed_fraction, adverse_move):
    """s* = alpha * delta. Everything else a maker charges sits on top."""
    return informed_fraction * adverse_move


def maker_pnl_per_share(half_spread, informed_fraction, adverse_move):
    return half_spread - informed_fraction * adverse_move


breakeven_half_spread(0.10, 0.30)       # 0.03, i.e. 3 bps on a price of 100
maker_pnl_per_share(0.02, 0.10, 0.30)   # -0.01 -> the quote is too tight


def markout_bps(fills, mid_at, horizons):
    """Average markout at several horizons.

    fills: list of (timestamp, side, price) with side +1 buy, -1 sell.
    Report every horizon; a single one hides the shape of the curve.
    """
    return {h: float(np.mean([side * (mid_at(ts + h) - px) / px * 1e4
                              for ts, side, px in fills]))
            for h in horizons}
```

---

#### See Also

* [Order Types](/execution/order-types)
* [Market Impact](/execution/market-impact)
* [Smart Order Routing](/execution/smart-order-routing)
* [Execution Benchmarks](/execution/execution-benchmarks)
* [Latency Risk](/microstructure/latency-risk)
* [Market Making Lite](/strategies/mm-lite)

---
