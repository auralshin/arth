### Binomial Trees

> info **Metadata** Level: Intermediate | Prerequisites: No-arbitrage & replication, Expectation | Tags: derivatives, binomial, risk-neutral, backward-induction, american-options

The binomial tree is the smallest model in which an option can be priced properly. Time moves in discrete steps, the price can go up or down at each step, and at every node you solve a two-equation replication problem. It is crude, and it is also the clearest possible demonstration that option prices come from hedging costs rather than from forecasts. Everything Black-Scholes does, the tree does first, with arithmetic instead of stochastic calculus.

It is not only a teaching device. Trees remain the practical tool for American exercise, for discrete dividends, and for any payoff where you need to compare "hold" against "exercise" at every date. A lattice handles those naturally; a closed-form formula does not.

---

#### Formal Definition

Over one period the asset price `S` moves to `S * u` or `S * d`, with `d` below `1` and `u` above `1`. Let `R = exp(r * dt)` be the gross risk-free return over the period. The **risk-neutral probability** is:

```text
p = (R - d) / (u - d)
```

and the price of any claim paying `V_up` or `V_down` at the end of the period is:

```text
V = (p * V_up + (1 - p) * V_down) / R
```

where:

- `u`, `d` are the up and down gross returns, satisfying `d` below `R` below `u` (otherwise the tree admits arbitrage)
- `p` is a probability only in the sense that it lies strictly between 0 and 1; it is not anybody's forecast
- `R` is the per-period gross growth of cash

The hedge ratio at the node is:

```text
delta = (V_up - V_down) / (S * u - S * d)
```

`p` falls out of the replication algebra of [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication): once you solve for `delta` and the bond holding, the resulting price can always be rewritten as a discounted expectation under `p`. The rewriting is a convenience, not an extra assumption.

> info **Why it is called risk-neutral** Under `p`, the expected gross return on the asset is `p * u + (1 - p) * d = R`. Every asset earns the risk-free rate, which is how a risk-neutral investor would price. Real investors are not risk-neutral; the measure absorbs risk preferences into the probabilities so the discounting can use `r`. See [Change of Measure](/stochastic-calculus/change-of-measure).

---

#### Worked Example: One Step

Set `S = 100`, `u = 1.1`, `d = 0.9`, and `R = 1.02` for the period. Price a European call struck at `K = 100`.

1. **Risk-neutral probability**: `p = (1.02 - 0.9) / (1.1 - 0.9) = 0.12 / 0.20 = 0.60`
2. **Terminal payoffs**: up node `S = 110`, payoff `10`. Down node `S = 90`, payoff `0`
3. **Price**: `(0.60 * 10 + 0.40 * 0) / 1.02 = 6.00 / 1.02 = 5.8824`

Cross-check by replication. `delta = (10 - 0) / (110 - 90) = 0.5`. Borrow `B` such that `0.5 * 90 + 1.02 * B = 0`, giving `B = -44.1176`. Cost today: `0.5 * 100 - 44.1176 = 5.8824`. The two routes agree exactly, as they must.

---

#### Worked Example: Two Steps and Backward Induction

Keep the same `u`, `d`, `R` and add a second period. The lattice recombines: an up-then-down move lands on the same node as down-then-up.

<table>
  <tbody>
    <tr><td><strong>Time</strong></td><td><strong>Nodes</strong></td><td><strong>Call payoff, K = 100</strong></td></tr>
    <tr><td>0</td><td>100</td><td>—</td></tr>
    <tr><td>1</td><td>110, 90</td><td>—</td></tr>
    <tr><td>2</td><td>121, 99, 81</td><td>21, 0, 0</td></tr>
  </tbody>
</table>

Work backwards from expiry:

1. **Node at 110**: `(0.60 * 21 + 0.40 * 0) / 1.02 = 12.60 / 1.02 = 12.3529`
2. **Node at 90**: `(0.60 * 0 + 0.40 * 0) / 1.02 = 0`
3. **Root**: `(0.60 * 12.3529 + 0.40 * 0) / 1.02 = 7.4118 / 1.02 = 7.2664`

The closed form confirms it: only the up-up path pays, so the price is `p^2 * 21 / R^2 = 0.36 * 21 / 1.0404 = 7.56 / 1.0404 = 7.2664`.

**Backward induction** is the general algorithm: write the payoff at every terminal node, then repeatedly replace each node by the discounted risk-neutral average of its two children until you reach the root. For an `n`-step recombining tree there are `n + 1` terminal nodes and roughly `n^2 / 2` interior nodes, so the cost is quadratic in `n`.

---

#### American Exercise

Backward induction extends to American options with one extra line: at each node, take the larger of continuing and exercising.

```text
V_node = max( exercise value , (p * V_up + (1 - p) * V_down) / R )
```

Price an American put struck at `K = 100` on the same two-step tree. Terminal payoffs: `max(100 - 121, 0) = 0`, `max(100 - 99, 0) = 1`, `max(100 - 81, 0) = 19`.

1. **Node at 110**: continuation `(0.60 * 0 + 0.40 * 1) / 1.02 = 0.3922`. Exercise value `max(100 - 110, 0) = 0`. Hold. Value `0.3922`
2. **Node at 90**: continuation `(0.60 * 1 + 0.40 * 19) / 1.02 = 8.20 / 1.02 = 8.0392`. Exercise value `max(100 - 90, 0) = 10`. **Exercise.** Value `10.0000`
3. **Root, American**: `(0.60 * 0.3922 + 0.40 * 10.0000) / 1.02 = 4.2353 / 1.02 = 4.1522`
4. **Root, European** (using the continuation value 8.0392 at the down node): `(0.60 * 0.3922 + 0.40 * 8.0392) / 1.02 = 3.4510 / 1.02 = 3.3833`

The **early exercise premium** is `4.1522 - 3.3833 = 0.7689`, about 23% of the European price. It comes entirely from the one node where exercising beat holding.

Two observations. First, the American price is computed by the same recursion; only the node update changes. Second, the exercise decision at a node depends on the values at later nodes, which is why you cannot decide it forwards — the optimal exercise boundary is an output of the recursion, not an input.

---

#### Choosing u and d: Convergence to Black-Scholes

To make the tree approximate a continuous [geometric Brownian motion](/quant-math/gbm) with volatility `sigma`, choose the step sizes so that the tree's per-step log-return has the right variance. The Cox-Ross-Rubinstein parameterisation is:

```text
dt = T / n
u  = exp(sigma * sqrt(dt))
d  = 1 / u
p  = (exp(r * dt) - d) / (u - d)
```

The per-step log return is `+/- sigma * sqrt(dt)`, so its variance is `sigma^2 * dt` — matched by construction. As `n` grows, the binomial distribution of the terminal log price converges to a normal by the [central limit theorem](/quant-math/lln-clt), and the tree price converges to the Black-Scholes price.

For `S = K = 100`, `r = 0`, `sigma = 20%`, `T = 1`, a European call:

<table>
  <tbody>
    <tr><td><strong>Steps n</strong></td><td>1</td><td>2</td><td>4</td><td>10</td><td>50</td><td>100</td><td>500</td><td>1000</td></tr>
    <tr><td><strong>Tree price</strong></td><td>9.967</td><td>7.059</td><td>7.488</td><td>7.769</td><td>7.926</td><td>7.946</td><td>7.962</td><td>7.964</td></tr>
  </tbody>
</table>

The Black-Scholes value is `7.9656`. Convergence is `O(1/n)` and, more awkwardly, it **oscillates**: prices alternate above and below the limit depending on where the strike falls relative to the terminal nodes. Averaging consecutive `n` and `n + 1` results, or using a tree whose nodes are centred on the strike, removes most of the oscillation. Doubling `n` to chase a fourth decimal is usually the wrong response.

> warning **Never estimate a Greek by differencing a coarse tree** Because convergence oscillates, `(V(S + h) - V(S - h)) / (2h)` computed on a small tree can be badly wrong even when `V` itself looks converged. Read delta and gamma off the tree's own nodes at time step 1 and 2 instead, or use a fine tree.

---

#### In Practice Across Asset Classes

**US single-stock equities.** This is where trees earn their keep. American exercise plus discrete cash dividends is exactly the case closed-form models handle badly. The standard treatment models the stock as a dividend-free process plus the present value of known dividends, keeping the tree recombining.

**Index options.** European and continuously dividend-paying, so a closed form is available and trees are used mainly for validation or for exotic payoffs.

**Options on futures.** The drift of a future under the risk-neutral measure is zero, so `p = (1 - d) / (u - d)`. American exercise on futures options is genuinely valuable in both directions, because there is no cost of carry to defer.

**FX.** Both currencies pay interest, so the risk-neutral drift is `r_domestic - r_foreign` and `p` uses that difference. Early exercise of an in-the-money option is optimal when the foreign rate is high enough. See [FX 101](/markets/fx-101).

**Rates.** Trees on the short rate — Ho-Lee, Black-Derman-Toy, Hull-White — are the standard tool for Bermudan swaptions and callable bonds, because the exercise decision is the whole product. These trees are calibrated to fit the entire initial [yield curve](/markets/yield-curves), which a constant-`u`-and-`d` equity tree does not attempt.

**Commodities.** Convenience yield enters as a negative carry term, and mean reversion in the spot process means a simple recombining tree with constant `u` and `d` misprices long-dated options. Trinomial trees or [Ornstein-Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck) lattices are used instead.

**On-chain.** A [perpetual future](/building-blocks/perpetual-futures) has no expiry and therefore no terminal layer to induct backwards from, so trees do not apply directly. They do apply to on-chain options and, more usefully, to modelling [liquidation](/building-blocks/liquidations) boundaries, which are structurally the same problem as an exercise boundary: at each node, compare the value of holding against the value of a forced action.

---

#### Assumptions and Failure Modes

- **Exactly two outcomes per period.** The real distribution has fat tails; a two-point distribution has none until many steps are compounded. Short-dated tree prices for far out-of-the-money strikes are unreliable for this reason.
- **Constant volatility across the tree.** Real markets have a [volatility surface](/derivatives/vol-surface). A single `sigma` will price at-the-money correctly and the wings wrongly. Implied trees calibrate `u` and `d` node by node to fix this, at the cost of stability.
- **Recombination requires constant proportional moves.** Discrete cash dividends, or any absolute-size shift, break recombination and turn a quadratic algorithm into an exponential one unless you restructure the process.
- **Oscillating convergence.** Prices near a strike converge non-monotonically, so "run more steps until it stops moving" is a poor stopping rule.
- **No jumps and no gaps.** The tree cannot move further than `u` or `d` in one step. A model calibrated to weekly steps cannot produce an overnight gap larger than one step's move.
- **The exercise boundary is only as good as the grid.** With few steps, the American premium is estimated from a handful of nodes and is coarse. Reported early exercise premia from small trees should be treated as indicative.

---

#### Code

```python
import math


def binomial_price(spot, strike, rate, sigma, years, steps, is_call, american=False):
    """Cox-Ross-Rubinstein lattice. Handles European or American exercise.

    Values are stored in a single array and overwritten in place, so memory
    is O(steps) rather than O(steps^2).
    """
    dt = years / steps
    up = math.exp(sigma * math.sqrt(dt))
    down = 1.0 / up
    growth = math.exp(rate * dt)
    prob = (growth - down) / (up - down)

    prices = [spot * up**j * down**(steps - j) for j in range(steps + 1)]
    values = [
        max(p - strike, 0.0) if is_call else max(strike - p, 0.0) for p in prices
    ]

    for step in range(steps - 1, -1, -1):
        for j in range(step + 1):
            values[j] = (prob * values[j + 1] + (1 - prob) * values[j]) / growth
            if american:
                node = spot * up**j * down**(step - j)
                intrinsic = max(node - strike, 0.0) if is_call else max(strike - node, 0.0)
                values[j] = max(values[j], intrinsic)
    return values[0]
```

---

#### See Also

* [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication)
* [Black-Scholes](/derivatives/black-scholes)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Exotic Options](/derivatives/exotics)
* [Geometric Brownian Motion](/quant-math/gbm)
* [Numerical Schemes](/stochastic-calculus/numerical-schemes)

---
