### Smart Order Routing

> info **Metadata** Level: Advanced | Prerequisites: Order Types, Fees & Routing, Latency Risk | Tags: execution, routing, fragmentation, venues, latency

Liquidity for a single instrument is rarely in one place. In fragmented markets the same stock trades on a dozen lit exchanges, several dark pools, and inside broker internalisers, each with its own fee schedule, matching rules, and latency. A **smart order router (SOR)** decides which venues to send child orders to, in what sizes, and in what sequence.

The routing decision looks like a comparison-shopping problem and is not. Displayed prices are stale by the time your order arrives, quoted size is an option the maker can withdraw, and — the part that dominates everything else — the act of taking liquidity at one venue tells everyone at the other venues that a buyer exists. Routing logic is therefore itself a source of cost, not merely a way of minimising it.

---

#### What the Router Is Optimising

A naive router ranks venues by displayed price. A complete one ranks by **all-in expected cost**:

```text
effective_cost_per_share = price + fee - rebate
                         + P(no_fill) * cost_of_reroute
                         + signalling_cost(venue, size)
```

where:

- `fee` and `rebate` come from the venue's maker-taker schedule; inverted venues pay the taker and charge the maker
- `P(no_fill)` is the probability the displayed size is gone when the order lands — a latency and queue question — and `cost_of_reroute` is what the next-best venue will cost after that failed attempt, including any price move it caused
- `signalling_cost` is the deterioration in the remaining venues caused by having traded on this one

Only the first line is observable before the fact. The other two are estimated from the router's own history, which is why routing quality is largely a data problem.

> info **Fees break ties; they do not beat prices** In a market with a one-cent tick, the spread between fee tiers is a fraction of a cent. Fee optimisation therefore only matters when choosing among venues quoting the *same* price. A router that crosses a full tick to capture a rebate is losing money.

---

#### Worked Example

You want 10,000 shares. Three venues all display the same price, 20.02, with different fee schedules and sizes:

<table>
  <tbody>
    <tr><td><strong>Venue</strong></td><td><strong>Size at 20.02</strong></td><td><strong>Taker fee per share</strong></td><td><strong>All-in cost per share</strong></td></tr>
    <tr><td>A (maker-taker)</td><td>4,000</td><td>+0.0030</td><td>20.0230</td></tr>
    <tr><td>B (low fee)</td><td>3,000</td><td>+0.0010</td><td>20.0210</td></tr>
    <tr><td>C (inverted)</td><td>5,000</td><td>&minus;0.0020 (rebate)</td><td>20.0180</td></tr>
  </tbody>
</table>

**Route 1 — sweep in venue order A, B, C** (a common default, driven by connectivity order rather than economics): 4,000 from A, 3,000 from B, 3,000 from C.

1. `4,000 * 20.0230 = 80,092` and `3,000 * 20.0210 = 60,063`
2. `3,000 * 20.0180 = 60,054`, giving a total of `200,209`, average **20.02090**

**Route 2 — rank by all-in cost**: 5,000 from C, 3,000 from B, 2,000 from A.

1. `5,000 * 20.0180 = 100,090` and `3,000 * 20.0210 = 60,063`
2. `2,000 * 20.0230 = 40,046`, giving a total of `200,199`, average **20.01990**

The saving is `200,209 - 200,199 = 10.00`, or 0.10 cents per share — `0.0010 / 20.02 = 0.50 bps`. Real, worth capturing, and small.

**Route 3 — the same all-in ranking, but leaked.** Suppose the router sends to A first (largest displayed size, so it looks safest), and the fill is observed. Market makers on C withdraw: only 1,500 of the 5,000 remains at 20.02, and the balance must be taken at 20.03 on A with a 0.0030 fee.

1. `4,000 * 20.0230 = 80,092` and `3,000 * 20.0210 = 60,063`
2. `1,500 * 20.0180 = 30,027` and `1,500 * 20.0330 = 30,049.50`
3. Total `200,231.50`, average **20.02315**

Against the best achievable 20.01990, that is `0.00325` per share, or `0.00325 / 20.02 = 1.62 bps` — **more than three times the entire fee optimisation**. The sequencing decision cost more than the fee decision, and it did so through a channel no pre-trade cost model based on displayed prices can see. That is the routing problem in miniature: getting the arithmetic right on fees is easy and worth half a basis point, while getting the information leakage right is hard and worth several times more.

---

#### Simultaneity, Latency, and Fading

If venues could be hit at exactly the same instant, leakage from sequencing would vanish. They cannot, because the router sits at a finite distance from each matching engine and the distances differ. The practical response is **latency-aware release**: rather than sending all child orders at the same moment, send them at staggered moments calculated so they *arrive* together. A router 200 microseconds from venue C and 800 microseconds from venue A sends to A first, then to C 600 microseconds later, so both land at once. Achieving this requires measured, stable one-way latencies to each venue — an infrastructure problem before it is an algorithm problem. See [Latency Risk](/microstructure/latency-risk).

Even perfect simultaneity does not eliminate fading. Quoted size is an option the maker holds, and a maker who sees a large print anywhere can cancel everywhere within their own reaction time — the router is competing on speed with participants whose entire business is that competition.

**Dark venues** change the calculus. Executing at the midpoint saves half the spread and displays nothing, but fill is uncertain and the counterparty who chose to trade with you there may know something. Routers typically probe dark venues first with part of the order — cheap if it fills, informative if it does not — then sweep lit venues for the balance.

---

#### In Practice Across Asset Classes

**Equities.** The canonical fragmented market and the reason SORs exist. Regulation in several jurisdictions requires routing away from a venue quoting a worse price than the national best, which constrains the search but does not solve it — the rules protect displayed top-of-book, not depth or all-in cost.

**Futures.** Essentially no routing problem: each contract trades on one exchange, so the SOR degenerates to order-type and timing choice. Routing reappears across *related* instruments — choosing between the front month, a calendar spread, and an ETF proxy is a routing decision in economic terms. **Fixed income.** Routing means choosing which dealers to include in a request-for-quote and whether to disclose direction. Asking more dealers improves the best quote and worsens every quote, because each additional dealer learns of the enquiry; the optimum is a small number, and it is a genuine trade-off rather than a search problem.

**FX.** Routing across ECNs and single-dealer platforms, complicated by last look: a quote accepted may still be rejected, so `P(no_fill)` is not merely a latency estimate but a counterparty behaviour estimate. Routers maintain per-counterparty rejection statistics and treat a high-rejection venue as expensive even when its quotes look best.

**On-chain.** Aggregators are routers: they split a swap across pools and multi-hop paths to minimise combined curve slippage and fees. Three differences from traditional routing. Pool state is fully observable, so pre-trade cost is computable exactly rather than estimated. Each additional hop or split costs gas, which places a hard floor on useful fragmentation — the marginal split must save more slippage than it costs in gas. And the route is public in the mempool before it settles, so the router's own transaction can be front-run or sandwiched, making private orderflow channels part of the routing decision. See [Fees & Routing](/microstructure/fees-routing), [Gas & Mempool](/microstructure/gas-mempool), and [MEV Overview](/building-blocks/mev-overview).

---

#### Assumptions and Failure Modes

- **Displayed quotes are available and fill probability is stable.** Quotes are indications with a lifetime measured in microseconds, so a router calibrated on displayed depth over-forecasts liquidity. Fill probability collapses precisely in volatile conditions, so historical rates estimated in calm markets are the wrong input for stressed ones.
- **Venues are independent.** They are not. The same market makers quote on many venues and pull everywhere at once, so depth across venues is far more correlated than a naive sum suggests.
- **The router's own history is an unbiased sample.** It is not: the router only observes outcomes on venues it chose to use, so venues it stopped routing to have no recent data and stay excluded. Deliberate exploration is required to keep the model honest, and it is expensive.
- **Fee schedules are static.** Tiered schedules depend on monthly volume, so the true marginal fee depends on where the firm sits in its tier at that moment — a fact most routers ignore.
- **Best execution equals best price.** Regulatory definitions typically encompass price, cost, speed, likelihood of execution and settlement, and size, so a router optimised purely on price can be simultaneously optimal and non-compliant.

> warning **Routing logic is measurable only against itself** There is no counterfactual: you cannot observe what the other route would have produced, because taking it would have changed the market. Routing quality is inferred from controlled randomisation across routes, which costs money and which most desks do not do.

---

#### Code

```python
def route_by_all_in_cost(venues, quantity, side="buy"):
    """Allocate a marketable order across venues by fee-inclusive price.

    venues: list of dicts with price, size, fee_per_share (negative = rebate).
    Ignores fill probability and signalling, which usually dominate — see above.
    """
    if side == "buy":   # cheapest all-in cost first
        ranked = sorted(venues, key=lambda v: v["price"] + v["fee_per_share"])
    else:               # highest all-in proceeds first
        ranked = sorted(venues, key=lambda v: v["price"] - v["fee_per_share"],
                        reverse=True)
    allocation, remaining, cash = [], quantity, 0.0
    for v in ranked:
        take = min(v["size"], remaining)
        if take <= 0:
            break
        fee = v["fee_per_share"] if side == "buy" else -v["fee_per_share"]
        allocation.append((v["name"], take))
        cash += take * (v["price"] + fee)
        remaining -= take
    filled = quantity - remaining
    return allocation, (cash / filled if filled else None), remaining


venues = [{"name": "A", "price": 20.02, "size": 4000, "fee_per_share": 0.0030},
          {"name": "B", "price": 20.02, "size": 3000, "fee_per_share": 0.0010},
          {"name": "C", "price": 20.02, "size": 5000, "fee_per_share": -0.0020}]
route_by_all_in_cost(venues, 10_000)
# ([('C', 5000), ('B', 3000), ('A', 2000)], 20.0199, 0)


def release_offsets(latencies_us):
    """Send-time offsets so child orders arrive together: the slowest
    venue is sent first, everything else waits by the difference."""
    slowest = max(latencies_us.values())
    return {v: slowest - lat for v, lat in latencies_us.items()}


release_offsets({"A": 800, "B": 450, "C": 200})   # {'A': 0, 'B': 350, 'C': 600}
```

---

#### See Also

* [Order Types](/execution/order-types)
* [Adverse Selection](/execution/adverse-selection)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Execution Overview](/execution/execution-overview)
* [Fees & Routing](/microstructure/fees-routing)
* [Latency Risk](/microstructure/latency-risk)

---
