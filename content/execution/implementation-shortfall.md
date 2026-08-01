### Implementation Shortfall

> info **Metadata** Level: Advanced | Prerequisites: Execution Overview, Market Impact, TWAP & VWAP | Tags: execution, implementation-shortfall, perold, tca, participation

Implementation shortfall is the difference between the return of a hypothetical **paper portfolio** — one that transacts instantly and costlessly at the price prevailing when the decision was made — and the return of the real portfolio that had to be built through the market. Perold's framing is deliberately uncompromising: everything that separates the idea from the position is a cost, including the trades you decided not to complete.

Its virtue over benchmarks like VWAP is that nothing hides. Delay is captured because the clock starts at the decision, not at the order's arrival on the desk. Missed trades are captured because unfilled quantity is marked against a later price. And the number cannot be improved by trading in a way that flatters the benchmark, because the benchmark is a single price fixed before any trading occurred.

---

#### Formal Definition

For an order of `Q` shares with decision price `P_d`, of which `Q_f` filled at prices `p_j` on quantities `q_j`, with `Q_u = Q - Q_f` unfilled and a terminal price `P_end`:

```text
IS  =  paper_gain  -  actual_gain          expressed in bps of Q * P_d

paper_gain  =  Q * (P_end - P_d)
actual_gain =  Q_f * P_end  -  sum(q_j * p_j)  -  fees

equivalently, the additive form normally reported:

IS  =  delay  +  execution  +  opportunity  +  fees

delay       =  Q_f * (P_a - P_d)           decision price to arrival price
execution   =  Q_f * (P_avg - P_a)         arrival price to average fill
opportunity =  Q_u * (P_end - P_d)         the quantity that never traded
fees        =  commissions, exchange fees, taxes
```

where:

- `P_a` is the **arrival price** — the price when the order reached the market
- `P_avg` is the quantity-weighted average fill price, `sum(q_j * p_j) / Q_f`, and `P_end` is the terminal price used to mark the miss, conventionally the close of the order's horizon

All four terms are signed so that a positive value is a cost. For a sell order every price difference flips sign; the convention is to multiply by `+1` for a buy and `-1` for a sell.

> info **Two clocks, two prices** `P_d` is when the portfolio manager decided. `P_a` is when the trader could act. The gap between them is the desk's responsibility only if the desk caused it; for a systematic strategy it is the latency of the whole pipeline. Conflating the two — benchmarking against arrival and calling it shortfall — silently deletes the delay term.

---

#### Worked Example

A manager decides to buy 100,000 shares when the price is 25.00. The order reaches the market at 25.02. Four fills occur, 10,000 shares are cancelled unfilled, and the closing price is 25.20. Commission is 1 cent per share.

<table>
  <tbody>
    <tr><td><strong>Fill</strong></td><td><strong>Quantity</strong></td><td><strong>Price</strong></td><td><strong>Cash</strong></td></tr>
    <tr><td>1</td><td>30,000</td><td>25.05</td><td>751,500</td></tr>
    <tr><td>2</td><td>25,000</td><td>25.08</td><td>627,000</td></tr>
    <tr><td>3</td><td>20,000</td><td>25.12</td><td>502,400</td></tr>
    <tr><td>4</td><td>15,000</td><td>25.10</td><td>376,500</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>90,000</strong></td><td><strong>25.0822</strong></td><td><strong>2,257,400</strong></td></tr>
  </tbody>
</table>

Average fill price: `2,257,400 / 90,000 = 25.08222`. Paper notional: `100,000 * 25.00 = 2,500,000`.

**Top-down.**

1. Paper gain: `100,000 * (25.20 - 25.00) = 20,000`
2. Actual gain: `90,000 * 25.20 - 2,257,400 - 900 = 2,268,000 - 2,257,400 - 900 = 9,700`
3. **IS** `= 20,000 - 9,700 = 10,300`, which is `10,300 / 2,500,000 = 0.00412 = 41.2 bps`

**Decomposed.**

<table>
  <tbody>
    <tr><td><strong>Component</strong></td><td><strong>Calculation</strong></td><td><strong>Cash</strong></td><td><strong>bps</strong></td></tr>
    <tr><td>Delay</td><td>90,000 x (25.02 &minus; 25.00)</td><td>1,800</td><td>7.2</td></tr>
    <tr><td>Execution</td><td>90,000 x (25.08222 &minus; 25.02)</td><td>5,600</td><td>22.4</td></tr>
    <tr><td>Opportunity</td><td>10,000 x (25.20 &minus; 25.00)</td><td>2,000</td><td>8.0</td></tr>
    <tr><td>Fees</td><td>90,000 x 0.01</td><td>900</td><td>3.6</td></tr>
    <tr><td><strong>Total</strong></td><td>&mdash;</td><td><strong>10,300</strong></td><td><strong>41.2</strong></td></tr>
  </tbody>
</table>

Both routes give 41.2 bps, as they must. Three observations are worth more than the number itself.

**Execution dominates.** At 22.4 bps it is more than six times the commission everyone negotiates over. **Opportunity cost is real money.** Cancelling 10,000 shares in a rising market cost 8.0 bps — more than the entire commission bill — and it appears on no fill report anywhere, so a desk graded only on filled shares is rewarded for cancelling difficult orders.

**The sign of opportunity cost is path-dependent.** Had the stock closed at 24.80, the unfilled tail would have contributed `10,000 * (24.80 - 25.00) = -2,000`, an 8.0 bps *gain*, and total shortfall would have been 25.2 bps. The same execution decisions, a different market, a very different score. This is why single-order shortfall is noise and only the average over many orders is informative.

---

#### Participation Strategies and POV

An implementation-shortfall algorithm is the practical answer to the [Almgren–Chriss](/execution/almgren-chriss) problem: it trades faster than VWAP because it is penalised for the delay and opportunity terms that VWAP ignores. The usual control variable is the **participation rate** `rho`, your volume divided by total market volume over the same interval. In the example, if the market traded 900,000 shares while the order worked, participation was `90,000 / 900,000 = 10%`. Raising `rho` moves cost along the frontier: higher impact, lower delay and opportunity. Because impact is [concave in size](/execution/market-impact) but delay risk grows with the square root of time, the total is minimised at an interior rate rather than at either extreme.

A percentage-of-volume (POV) algorithm holds `rho` fixed. This has a specific and often-missed property: it makes the completion time uncertain. If volume dries up, a 10% POV order simply does not finish, converting execution cost into opportunity cost without asking permission. Most production implementations therefore add a deadline that overrides the participation cap near the end — at which point the algorithm is no longer POV.

> warning **Front-loading is not free urgency** Shortfall algorithms trade heavily early, which concentrates impact when the order's remaining size is largest and most detectable. Aggression that reduces the measured shortfall on an individual order can raise it on average by making the flow easier for others to identify — see [Adverse Selection](/execution/adverse-selection).

---

#### In Practice Across Asset Classes

**Equities.** The standard measure for institutional agency execution, and the one most consultants report. The main disputes are which timestamp counts as the decision, and whether the terminal price should be the close, the next open, or a horizon matched to the signal. **Futures.** Straightforward, with one wrinkle: on a rolled position the decision price must reference the same contract as the fills, or the roll itself pollutes the shortfall.

**FX.** The decision price is ambiguous because there is no single market price. Desks fix a reference rate from a chosen venue or composite, and the choice materially moves the answer, so shortfall figures from different providers on the same trade are not comparable. **Fixed income.** The decision price is usually a dealer's indicative level or an evaluated price rather than a traded one, so shortfall carries the pricing model's error and is measured against far wider spreads.

**On-chain.** Decision and arrival prices are unusually crisp — the pool state is readable at a known block. The delay term becomes block-inclusion latency and mempool wait; execution cost splits into pool fee, curve slippage, gas, and any value extracted by transaction orderers. Opportunity cost includes reverted transactions, which consume gas and deliver nothing. See [Gas & Mempool](/microstructure/gas-mempool), [Slippage](/microstructure/slippage), and [Slippage & Frontrunning](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **A decision price exists and is honestly recorded.** For discretionary orders it is a judgement call and the incentive is to record it late. Systematic strategies avoid this because the signal timestamp is machine-generated — an underrated advantage of a rules-based process.
- **The terminal price is the right mark for the miss.** Using the close is a convention: if the strategy would have continued the order tomorrow the close understates the miss, and if the alpha had already decayed it overstates it.
- **Shortfall separates trader skill from market movement.** It does not: a large part of any single order's shortfall is drift that would have occurred anyway. Only averages over many orders, ideally paired with a control group, say anything about skill.
- **Costs and alpha are independent.** They are correlated by construction: orders are generated when the price is about to move, so shortfall is systematically worse for the orders with the most edge. Estimating cost on a sample of your own orders therefore overstates the cost a random trader would pay — and understates how much of your edge is being consumed.
- **The distribution is well behaved.** Per-order shortfall is fat-tailed and skewed, so a handful of stressed-market orders dominate the mean and a median tells a different story. See [Hypothesis Testing](/stat-methods/hypothesis-testing). Fees, likewise, are small enough to fold into the total only outside high-turnover and on-chain contexts; elsewhere, burying them hides the one term that is fully controllable.

---

#### Code

```python
def implementation_shortfall(decision_px, arrival_px, fills, order_qty,
                             end_px, fees=0.0, side="buy"):
    """Perold implementation shortfall, decomposed, in basis points.

    fills: list of (quantity, price). Positive results are costs.
    """
    sign = 1.0 if side == "buy" else -1.0
    filled = sum(q for q, _ in fills)
    cash = sum(q * p for q, p in fills)
    paper_notional = order_qty * decision_px

    parts = {"delay": sign * filled * (arrival_px - decision_px),
             "execution": sign * (cash - filled * arrival_px),
             "opportunity": sign * (order_qty - filled) * (end_px - decision_px),
             "fees": fees}
    out = {k: v / paper_notional * 1e4 for k, v in parts.items()}
    out["total"] = sum(out.values())
    out["avg_fill_px"] = cash / filled if filled else None
    return out


fills = [(30_000, 25.05), (25_000, 25.08), (20_000, 25.12), (15_000, 25.10)]
implementation_shortfall(25.00, 25.02, fills, 100_000, 25.20, fees=900.0)
# {'delay': 7.2, 'execution': 22.4, 'opportunity': 8.0,
#  'fees': 3.6, 'total': 41.2, 'avg_fill_px': 25.0822...}
```

---

#### See Also

* [Execution Overview](/execution/execution-overview)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Almgren–Chriss](/execution/almgren-chriss)
* [Execution Benchmarks](/execution/execution-benchmarks)
* [TWAP & VWAP](/execution/twap-vwap)
* [Backtest vs Live](/risk/backtest-vs-live)

---
