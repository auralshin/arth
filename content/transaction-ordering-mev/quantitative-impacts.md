### Quantitative Impacts

> info **Metadata** Level: Advanced | Prerequisites: MEV Taxonomy, Slippage, AMMs 101 | Tags: mev, execution-cost, slippage, basis-points, sandwiching, tca

Most discussion of MEV is qualitative — who is being harmed, whether extraction is legitimate, what fairness would look like. This page does the arithmetic instead. A user swaps, sees a quote, and receives something worse. That gap is a number, it decomposes into named parts, and each part behaves differently as the trade gets bigger.

The decomposition matters because the parts have different remedies. The venue's fee is a posted price you cannot negotiate. Your own price impact is a function of size against depth and is reduced by trading smaller or routing wider. The ordering cost is the residual, and it is the only part that exists because someone chose a sequence. Users who conflate the three usually blame the wrong one.

---

#### Formal Definition

For a swap, the **effective price** is the realised exchange rate including everything:

```text
effective_price = amount_in / amount_out
```

Realised cost is that price measured against a reference, in basis points:

```text
cost_bps = 10000 * (effective_price - reference_price) / reference_price
```

where:

- `reference_price` is a stated counterfactual: the pool mid before the block, the quote shown at submission, or an external market price
- `amount_in` is what the user paid, gas excluded
- `amount_out` is what the user received

The reference choice is not cosmetic. Measured against the pre-block mid, the number includes the user's own impact. Measured against the quote shown at submission, it isolates what changed after the user committed. This page uses the pre-block mid and decomposes:

```text
cost_bps = fee_bps + own_impact_bps + ordering_bps
```

where `own_impact_bps` is what the same trade would have cost executing first against pre-block state, and `ordering_bps` is the residual attributable to what the assembler put in front of it.

---

#### The Closed Form for a Constant-Product Pool

For a pool with reserves `X` (quote asset) and `Y` (base asset), fee rate `f`, and `g = 1 - f`, the output of swapping `v` of the quote asset in is:

```text
amount_out = (Y * g * v) / (X + g * v)
```

Dividing through gives an exact expression for the effective price, with `mid = X / Y`:

```text
effective_price = mid * (1 / g + v / X)
```

which splits the cost cleanly, since `1/g - 1 = f / (1 - f)`:

```text
cost_bps = 10000 * f / (1 - f)   +   10000 * v / X
           (fee, size-independent)  (own impact, linear in size)
```

Take a constructed pool of 10,000,000 USDC and 5,000 ETH — a mid of 2,000 — charging 30 basis points. The fee term is `10000 * 0.003 / 0.997 = 30.1` bps for every trade, and the impact term is simply the trade as a fraction of the quote reserve:

<table>
  <tbody>
    <tr><td><strong>Swap size (USDC)</strong></td><td><strong>ETH out</strong></td><td><strong>Effective price</strong></td><td><strong>Fee (bps)</strong></td><td><strong>Own impact (bps)</strong></td><td><strong>Total (bps)</strong></td></tr>
    <tr><td>10,000</td><td>4.9800</td><td>2,008.02</td><td>30.1</td><td>10.0</td><td>40.1</td></tr>
    <tr><td>50,000</td><td>24.8014</td><td>2,016.02</td><td>30.1</td><td>50.0</td><td>80.1</td></tr>
    <tr><td>100,000</td><td>49.3579</td><td>2,026.02</td><td>30.1</td><td>100.0</td><td>130.1</td></tr>
    <tr><td>250,000</td><td>121.5943</td><td>2,056.02</td><td>30.1</td><td>250.0</td><td>280.1</td></tr>
  </tbody>
</table>

The linearity is specific to the constant-product curve and to fees charged on input. Concentrated liquidity, stableswap curves, and orderbook venues all have different impact functions — see [AMMs in Depth](/protocols/amms-depth) — but the decomposition survives.

---

#### Worked Example: A Sandwiched Swap

Same constructed pool: 10,000,000 USDC, 5,000 ETH, mid 2,000, fee 30 bps. A user submits a swap of 100,000 USDC for ETH with a 2% slippage tolerance. An extractor sees it and brackets it with a front-run of 100,000 USDC and a matching back-run. Every figure below is computed from the formulas above.

<table>
  <tbody>
    <tr><td><strong>Step</strong></td><td><strong>Action</strong></td><td><strong>Reserves after (USDC / ETH)</strong></td></tr>
    <tr><td>0</td><td>Initial state</td><td>10,000,000 / 5,000.0000</td></tr>
    <tr><td>1</td><td>Extractor buys with 100,000 USDC, receives 49.3579 ETH</td><td>10,100,000 / 4,950.6421</td></tr>
    <tr><td>2</td><td>User buys with 100,000 USDC, receives 48.3915 ETH</td><td>10,200,000 / 4,902.2506</td></tr>
    <tr><td>3</td><td>Extractor sells 49.3579 ETH, receives 101,372.16 USDC</td><td>10,098,627.84 / 4,951.6085</td></tr>
  </tbody>
</table>

1. **The un-sandwiched quote.** Executing first, the user would have received `49.3579` ETH at an effective price of `2,026.02`, a total cost of **130.1 bps** against the mid.
2. **What the user actually got.** After the front-run the pool mid is `10,100,000 / 4,950.6421 = 2,040.14`, and the user's effective price is `2,040.14 * (1/0.997 + 100,000/10,100,000) = 2,066.48`.
3. **The shortfall.** `49.3579 - 48.3915 = 0.9664` ETH, which is `0.9664 / 49.3579 = 1.958%` of the quoted output. Expressed as price degradation it is `2,066.48 / 2,026.02 - 1 = 1.997%`, since a 1.958% quantity loss is a 1.997% price increase.
4. **The decomposition.** Against the pre-block mid of 2,000, the realised cost is `10000 * 66.48 / 2000 = 332.4` bps, splitting as **30.1 fee + 100.0 own impact + 202.3 ordering**. The ordering term is more than the other two combined.
5. **The extractor's gross profit.** `101,372.16 - 100,000 = 1,372.16` USDC, before gas and before whatever it bid for the ordering position.

**Where the money went.** Compare the two worlds. Without the sandwich the pool would have finished at `10,100,000 / 4,950.6421`; with it, at `10,098,627.84 / 4,951.6085`. The differences are exact: the pool holds `0.9664` ETH *more* — precisely the user's shortfall, which stayed in the pool — and `1,372.16` USDC *less*, precisely the extractor's profit, which came out of it.

Valuing both at the post-trade mid of `2,039.46`, the user gave up `0.9664 * 2,039.46 = 1,970.89` USDC of value, which splits exactly:

<table>
  <tbody>
    <tr><td><strong>Recipient</strong></td><td><strong>Value (USDC)</strong></td><td><strong>Share</strong></td></tr>
    <tr><td>Extractor</td><td>1,372.16</td><td>69.6%</td></tr>
    <tr><td>Liquidity providers</td><td>598.73</td><td>30.4%</td></tr>
    <tr><td>Total lost by the user</td><td>1,970.89</td><td>100.0%</td></tr>
  </tbody>
</table>

> info **Extraction is a transfer, and not a clean one** Nearly a third of what this user lost stayed with liquidity providers rather than reaching the extractor — the extractor's two legs paid fees, and the pool ends up holding a different mix of assets. The extractor's profit is a lower bound on user cost, never an estimate of it.

Note also the terminal price. Without the sandwich the pool would have ended at `2,040.14`; with it, at `2,039.46`. The sandwich barely moved where the price finished. It was a transfer, not price discovery.

---

#### What the Slippage Tolerance Actually Buys

The user's minimum-output parameter is a hard bound, and it is the extractor's budget. With tolerance `s`, the worst achievable outcome is exactly `(1 - s)` times the quote:

```text
max_ordering_loss = s * quoted_out
```

At `s = 2%` on a quote of `49.3579` ETH, the cap is `0.9872` ETH. The extractor above took `0.9664`, which is `0.9664 / 0.9872 = 97.9%` of the budget — sizing the front-run to consume the tolerance without tripping the revert is the entire optimisation. At `s = 0.5%` the cap would have been `0.2468` ETH, worth about 494 USDC at the pre-trade mid, and no choice of front-run size could have exceeded it.

That is why the tolerance is the highest-leverage user-side parameter, and why tightening it is not free: a tight bound reverts more often during genuine volatility, and a revert still costs gas while leaving the position unfilled. [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses) develops the trade-off.

---

#### Aggregating Into a Cost Metric

To compare against traditional execution analysis, express cost as basis points of notional traded and treat gas separately, because gas does not scale with size.

Suppose gas costs the user 12 USD regardless of trade size. As a fraction of notional that is `10000 * 12 / 10,000 = 12.0` bps on a 10,000 USDC swap and `10000 * 12 / 250,000 = 0.48` bps on a 250,000 USDC swap. Own impact runs the other way, rising linearly with size. The two are equal where `12 / v = v / 10,000,000`, giving `v = sqrt(1.2e8)`, about **11,000 USDC** in this constructed pool — under that size gas dominates, above it impact does.

The practical consequence: a user optimising a small swap should think about gas and routing, and a user optimising a large one should think about depth and ordering. The same framework as [Transaction Cost Analysis](/execution/transaction-cost-analysis) applies, with ordering as an extra term that off-chain venues do not have in the same form.

---

#### Assumptions and Failure Modes

- **The counterfactual is unobservable.** "What the user would have got executing first" is a simulation against a state that never existed. It is a model output, not a measurement, and it inherits every assumption in the simulation.
- **Single-pool arithmetic understates real routing.** Real swaps split across pools and hops. Each leg has its own depth and its own exposure, and the decomposition must be computed per leg then aggregated.
- **The extractor's profit is not the user's loss.** As shown above, fees absorb a material share. Studies that infer user harm from extractor profit understate it; studies that infer it from the full price move overstate it by including the user's own impact.
- **Constant-product linearity does not generalise.** Concentrated liquidity has depth that changes discretely as ticks are crossed, so impact is piecewise and can jump. Stableswap curves are almost flat near the peg and steep away from it.
- **Valuation of cross-asset flows is convention-dependent.** Reconciling a loss denominated in ETH against a profit denominated in USDC requires a price, and the price moves within the block. Pre-block, post-block, and external references give different answers for the same event.
- **Gas is assumed constant.** In practice congestion and extraction are correlated: the blocks where ordering costs most are also the blocks where gas costs most, so the two terms are not independent.

---

#### Code

```python
def amm_out(reserve_in, reserve_out, amount_in, fee=0.003):
    """Constant-product output with fee charged on input."""
    effective_in = amount_in * (1 - fee)
    return reserve_out * effective_in / (reserve_in + effective_in)


def sandwich(x0, y0, victim_in, attacker_in, fee=0.003):
    """Simulate front-run, victim swap, back-run against one pool.

    Returns the victim's shortfall in base units and the attacker's
    gross profit in quote units, before gas and before any bid paid
    for the ordering position.
    """
    quoted = amm_out(x0, y0, victim_in, fee)

    got = amm_out(x0, y0, attacker_in, fee)
    x1, y1 = x0 + attacker_in, y0 - got

    victim_got = amm_out(x1, y1, victim_in, fee)
    x2, y2 = x1 + victim_in, y1 - victim_got

    # The back-run returns exactly the base units acquired, so the
    # attacker ends flat in the base asset and long the difference.
    returned = amm_out(y2, x2, got, fee)
    return quoted - victim_got, returned - attacker_in


shortfall, profit = sandwich(10_000_000, 5_000, 100_000, 100_000)
# shortfall ~ 0.9664 ETH, profit ~ 1372.16 USDC
```

---

#### See Also

* [MEV Taxonomy](/transaction-ordering-mev/mev-taxonomy)
* [Mitigation and Defenses](/transaction-ordering-mev/mitigation-and-defenses)
* [Statistical Modeling](/transaction-ordering-mev/statistical-modeling)
* [Slippage](/microstructure/slippage)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Market Impact](/execution/market-impact)

---
