### Slippage

> info **Metadata** Level: Intermediate | Prerequisites: Orderbooks vs AMMs, Volatility | Tags: slippage, execution, price-impact, implementation-shortfall, transaction-costs

Slippage is the difference between the price you expected and the price you got. It sounds like a rounding error and is frequently the largest single deduction from a strategy's gross return. For anything that trades often, slippage is not a friction applied to the strategy — it is a component of the strategy, and a signal that cannot pay for it is not a signal.

The word covers two distinct quantities that are worth separating from the outset. **Expected slippage** is a forecast made before trading, used to size positions and decide whether a trade is worth doing. **Realised slippage** is a measurement made afterwards, used to evaluate execution and to recalibrate the forecast. Confusing them produces the common pathology of a firm that models costs carefully, measures them separately, and never compares the two.

---

#### Formal Definition

Realised slippage is a signed comparison of execution price against a reference price:

```text
slippage_bps = 10000 * side * (P_exec - P_ref) / P_ref
```

where:

- `P_exec` is the size-weighted average execution price across all fills
- `P_ref` is the reference price, and the choice of reference is the whole argument
- `side` is `+1` for a buy and `-1` for a sell, so positive always means "worse than reference"

Three references are in common use, and they measure different things:

- **Decision price** — the price when the strategy generated the signal. Includes everything: delay, impact, and any drift while the order was worked.
- **Arrival price** — the price when the order reached the execution system. Isolates execution quality from decision-to-order delay.
- **Interval VWAP** — the volume-weighted average price over the execution window. Measures performance against the market during the same period, but is gameable by choosing when to trade.

The decomposition that ties them together is **implementation shortfall**, the total cost of turning a decision into a position:

```text
IS_bps = delay_bps + execution_bps + opportunity_bps + fees_bps
```

Each term uses the decision price as a common denominator so that the parts sum to the whole. See [Implementation Shortfall](/execution/implementation-shortfall).

---

#### Worked Example

A strategy decides to buy 100,000 shares. The order reaches the desk shortly afterwards and is worked through the day.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Decision price</td><td>50.00</td></tr>
    <tr><td>Arrival price</td><td>50.02</td></tr>
    <tr><td>Interval VWAP</td><td>50.06</td></tr>
    <tr><td>Average execution price</td><td>50.08</td></tr>
    <tr><td>Shares ordered / filled</td><td>100,000 / 80,000</td></tr>
    <tr><td>Price at end of day</td><td>50.30</td></tr>
  </tbody>
</table>

1. **Delay cost**: `(50.02 - 50.00) / 50.00 = 4.0 bps`. The market moved before the order started.
2. **Execution cost versus arrival**: `(50.08 - 50.02) / 50.00 = 12.0 bps`. This is the part the execution process controls.
3. **Shortfall on executed shares**: `4.0 + 12.0 = 16.0 bps`, or `80,000 * (50.08 - 50.00) = 6,400` in currency.
4. **Versus interval VWAP**: `(50.08 - 50.06) / 50.00 = 4.0 bps` of underperformance against the market's own average.
5. **Opportunity cost**: 20,000 shares went unfilled while the price rose to 50.30, costing `20,000 * (50.30 - 50.00) = 6,000`.
6. **Total implementation shortfall**: `(6,400 + 6,000) / (100,000 * 50.00) = 12,400 / 5,000,000 = 24.8 bps`.

The unfilled portion contributed almost half the total cost while showing up nowhere in the fill data. This is the standard way execution quality is flattered: trade passively, fill only when the market comes to you, report an excellent average price, and never account for the shares you failed to buy in a rising market. Any measure that ignores unfilled quantity rewards being slow.

> warning **A good VWAP is not a good outcome** Beating interval VWAP while missing a fifth of the order and paying 24.8 bps of shortfall is a worse result than crossing the spread immediately would have been. Benchmarks measure the trader; shortfall measures the fund.

---

#### The Components of Slippage

**Spread cost.** Crossing to trade immediately costs roughly the half-spread. It is unavoidable for a liquidity taker and is compensation to the maker for adverse selection, not a fee. See [Adverse Selection](/execution/adverse-selection).

**Temporary impact.** Consuming depth pushes the price away while you trade, and it reverts once you stop. This is the cost of demanding liquidity faster than it is replenished, and it is the component most responsive to trading slower.

**Permanent impact.** The portion of the move that does not revert, because the market inferred information from your flow. Trading slower reduces temporary impact but not permanent impact, and it increases exposure to drift.

**Delay and drift.** Time between decision and execution, during which the price moves — sometimes for reasons related to your own intent becoming visible. On a signal with fast decay, this dominates everything else.

**Opportunity cost.** The unfilled remainder, valued at the price it would have been bought at. Structurally invisible unless you deliberately record it.

**Fees.** Explicit and separable: commissions, exchange fees, taxes, and network fees on-chain. Not slippage, but part of the same cost budget. See [Fees & Routing](/microstructure/fees-routing).

The trade-off between temporary impact and drift is the entire subject of optimal execution: trade fast and pay impact, or trade slow and bear risk. See [Almgren-Chriss](/execution/almgren-chriss).

---

#### Expected Slippage: Modelling Before the Trade

A workable pre-trade model has two terms — one you always pay, and one that grows with how much of the market you consume:

```text
E[slippage_bps] = half_spread_bps + 10000 * k * sigma_daily * sqrt(Q / ADV)
```

where:

- `sigma_daily` is the instrument's daily volatility as a decimal
- `Q / ADV` is participation: order quantity divided by average daily volume
- `k` is a fitted coefficient, typically of order 0.5 to 1 but genuinely instrument- and venue-specific

The square-root form is empirical rather than derived, and it is one of the more robust regularities in execution research: cost grows with the square root of size, not linearly. Doubling the order raises expected impact by about 41%, not 100%.

For an order that is 5% of ADV in an instrument with 1.8% daily volatility, a 2 bps half-spread and `k = 0.5`:

```text
impact = 10000 * 0.5 * 0.018 * sqrt(0.05)
       = 10000 * 0.5 * 0.018 * 0.2236
       = 20.1 bps

total  = 2 + 20.1 = 22.1 bps
```

The coefficient `k` must be estimated from your own fills. Borrowing a number from a paper gives you a model with the right shape and the wrong level, which is worse than no model because it looks quantitative. See [Market Impact](/execution/market-impact).

For an on-chain swap the equivalent calculation is deterministic rather than statistical, because the pool's curve is known. In a constant-product pool, consuming a fraction `u` of the base reserve costs `u / (1 - u)` in average-price slippage, plus the swap fee. A 0.5% reserve consumption costs 50.25 bps before fees regardless of volatility — the uncertainty lies in whether the pool state you simulated is the state your transaction meets.

---

#### Measuring Realised Slippage

Measurement is only useful if it is systematic and if it feeds back into the model.

- **Record the decision price at decision time.** Reconstructing it later from a timestamp and a trade tape is unreliable and biased.
- **Record unfilled quantity and the price at cancellation.** Without this, opportunity cost is unmeasurable and passive strategies look better than they are.
- **Report the distribution, not the mean.** Slippage is right-skewed: most orders are cheap, and a few are very expensive. The mean is dominated by the tail, and the median hides it.
- **Condition on the variables that drive it.** Participation, volatility, time of day, spread at arrival and side. An unconditional average cost mixes together regimes that behave nothing alike.
- **Compare realised against predicted, per order.** The residual is what recalibrates `k`. Persistent one-sided residuals mean the model is misspecified, not that the market was unusual.
- **Watch for selection in the sample.** If the strategy cancels orders when conditions worsen, the completed orders are a biased sample of intended orders.

See [Transaction Cost Analysis](/execution/transaction-cost-analysis) for the full framework.

---

#### In Practice Across Venue Types

**Equities.** Liquidity is fragmented across lit books, dark pools and internalisers, so realised slippage depends heavily on routing. Volume is U-shaped through the day, which makes participation and therefore impact time-dependent. See [Smart Order Routing](/execution/smart-order-routing).

**Futures.** Depth is concentrated in the front contract, and slippage rises sharply around the roll as liquidity migrates. Spreads are usually one tick, so the tick size sets a floor on cost. See [Roll and Carry](/markets/roll-and-carry).

**Foreign exchange.** Quotes are firm only until a provider exercises last look. Rejection is a hidden slippage channel: the trades rejected are disproportionately the ones that were about to be profitable.

**Fixed income and credit.** Much trading is by request for quote rather than continuous markets. Slippage manifests as the difference between the level shown and the level dealt, and the act of asking several dealers is itself information that moves the price against you.

**Options.** Spreads are wide relative to option premium, especially away from the money. Slippage is better measured in implied-volatility points than in price, because the underlying moves during execution. See [Implied Volatility](/derivatives/implied-volatility).

**On-chain.** Curve slippage is computable exactly from pool state, but three additional costs apply: the swap fee, the network fee, and the risk that the state changes before inclusion. Ordering competition can insert trades before yours, converting a deterministic quote into a worse realised price. See [Slippage & Frontrunning](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **The reference price is assumed neutral.** It is not. Choosing arrival price hides delay; choosing interval VWAP hides timing decisions; choosing decision price is the most honest and the most unflattering.
- **Impact is assumed to depend only on size.** Volatility, spread, time of day and the presence of other participants trading the same signal all matter. Crowded trades have costs that a single-order model cannot see.
- **The market is assumed indifferent to your order.** Repeated, predictable flow gets anticipated, and the price moves before you arrive. Predictable schedules such as fixed-time rebalancing are the clearest case.
- **Slippage is assumed independent of returns.** It is negatively correlated with them: costs are highest in volatile, one-directional markets, which is when the strategy most wants to trade.
- **Backtest fills are assumed achievable.** Filling at the mid, or at a price with no queue assumption, silently deletes most of this page. See [Backtest vs Live](/risk/backtest-vs-live).
- **The square-root law is assumed universal.** It is a fitted regularity that holds over a middle range of participation. It underestimates cost at very high participation and is unreliable in thin instruments.
- **Simulated on-chain quotes are assumed to be executable.** Pool state at simulation is not pool state at inclusion, and the difference is exactly what slippage tolerances exist to bound.

> warning **Educational content only** This page explains how execution costs are modelled and measured. It is not advice on how to trade, and the coefficients used are illustrative.

---

#### Code

```python
def implementation_shortfall(decision_price, avg_fill_price, filled_qty,
                             ordered_qty, final_price, side=1):
    """Total cost of a decision, including the shares never bought.

    Opportunity cost on the unfilled remainder is the term most often
    omitted, and it is the one that penalises being too passive.
    """
    executed_cost = filled_qty * side * (avg_fill_price - decision_price)
    unfilled = ordered_qty - filled_qty
    opportunity_cost = unfilled * side * (final_price - decision_price)
    notional = ordered_qty * decision_price
    total = executed_cost + opportunity_cost
    return {"executed_cost": executed_cost,
            "opportunity_cost": opportunity_cost,
            "total_bps": 10_000 * total / notional}


def expected_slippage_bps(half_spread_bps, sigma_daily, participation, k=0.5):
    """Pre-trade cost forecast: unavoidable spread plus square-root impact.

    k must be fitted to your own fills. A borrowed value gives the right
    shape at the wrong level, which is worse than no model.
    """
    return half_spread_bps + 10_000 * k * sigma_daily * participation**0.5
```

---

#### See Also

* [Orderbooks vs AMMs](/microstructure/orderbooks-vs-amms)
* [Fees & Routing](/microstructure/fees-routing)
* [Market Impact](/execution/market-impact)
* [Implementation Shortfall](/execution/implementation-shortfall)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Backtest vs Live](/risk/backtest-vs-live)

---
