### Simulating LP Returns Under Different Price Paths

> info **Metadata** Level: Advanced | Prerequisites: AMMs 101, Impermanent Loss, Brownian Motion | Tags: simulation, liquidity-provision, impermanent-loss, lvr, path-dependence, monte-carlo

A liquidity provider's return is the sum of two terms with completely different structures. One is a deterministic function of where the price ends up, and it is never positive. The other is an accumulation of fees over every trade that occurred along the way, and it depends on the entire path rather than the endpoint. Simulating an LP position means generating price paths, evaluating both terms, and asking under what conditions the second exceeds the first.

Framing it that way makes the position recognisable. The endpoint term is negative convexity: the LP is short gamma, obliged to sell the asset that is rising and buy the one that is falling. The path term is a fee stream that grows with activity. **An LP is short realised variance and long realised volume**, and the whole exercise is establishing whether the venue's fee rate compensates the variance it is exposed to.

---

#### Formal Definition

For a constant-product pool with reserves `x` and `y` under `x * y = K`, the marginal price is `P = y / x`. Substituting gives the reserves and the position value as functions of price alone:

```text
x(P)  = sqrt(K / P)
y(P)  = sqrt(K * P)
V(P)  = x(P) * P + y(P) = 2 * sqrt(K * P)
```

So pool value scales with the square root of price. Writing `r = P / P_0` for the price ratio since deposit, and comparing against simply holding the initial basket:

```text
V_lp(r)   / V_lp(1)   = sqrt(r)
V_hodl(r) / V_lp(1)   = (1 + r) / 2
IL(r)                 = 2 * sqrt(r) / (1 + r) - 1
```

where:

- `V_lp` is the value of the liquidity position, ignoring fees
- `V_hodl` is the value of the two assets had they simply been held
- `IL(r)` is **impermanent loss**: the LP's shortfall against holding, as a fraction

`IL` is at most zero, equals zero only at `r = 1`, and is symmetric in the log of `r` — a halving and a doubling cost identically.

<table>
  <tbody>
    <tr><td><strong>Price ratio</strong></td><td>0.25</td><td>0.50</td><td>0.80</td><td>1.00</td><td>1.25</td><td>2.00</td><td>4.00</td></tr>
    <tr><td><strong>IL</strong></td><td>-20.00%</td><td>-5.72%</td><td>-0.62%</td><td>0.00%</td><td>-0.62%</td><td>-5.72%</td><td>-20.00%</td></tr>
  </tbody>
</table>

The decisive property for simulation is that `IL` **depends only on the final price**. Every path ending at the same place produces the same impermanent loss, whether it went there directly or oscillated violently first. Fees do not share that property at all, and the entire richness of the problem lives in that asymmetry.

---

#### The Continuous-Time Cost: Loss Versus Rebalancing

Impermanent loss compares against holding. A more informative benchmark for a systematic view is the **rebalancing portfolio**: a position holding the same delta as the pool at every instant, trading at the external market price rather than along the pool curve. The gap between the two is **loss-versus-rebalancing (LVR)**, and it isolates the cost of being the party arbitrageurs trade against.

For `V(P) = 2 * sqrt(K * P)` under a driftless geometric Brownian motion, Itô's lemma gives the drift directly:

```text
V'(P)  =  sqrt(K / P)                      the pool's delta
V''(P) = -0.5 * sqrt(K) * P^(-3/2)
dV     =  V' dP + 0.5 * V'' * sigma^2 * P^2 dt
       =  V' dP - (sigma^2 / 8) * V dt
```

The rebalancing portfolio earns `V' dP` with no second term, so the pool underperforms it at a rate of `sigma^2 / 8` of position value per unit time. A Monte Carlo over 30,000 paths at 60% annual volatility recovers 4.41% against the quoted 4.50%. The gap is compounding rather than simulation error: `sigma^2 / 8` is a continuous *rate*, and over a full year it accumulates to `1 - exp(-0.045) = 4.40%`. See [Itô's Lemma](/stochastic-calculus/ito-lemma) for the machinery.

This gives a clean break-even. Fee income must cover the LVR rate:

1. **LVR at 60% annualised volatility**: `0.60^2 / 8 = 4.50%` per year.
2. **Fee income at a 0.30% tier**: `0.003 * turnover * 365` per year, where turnover is daily volume divided by pooled value.
3. **Break-even turnover**: `0.045 / (0.003 * 365) = 4.11%` of pooled value traded per day.

<table>
  <tbody>
    <tr><td><strong>Annualised volatility</strong></td><td><strong>LVR per year</strong></td><td><strong>Break-even daily turnover at 0.30%</strong></td></tr>
    <tr><td>30%</td><td>1.13%</td><td>1.03%</td></tr>
    <tr><td>60%</td><td>4.50%</td><td>4.11%</td></tr>
    <tr><td>100%</td><td>12.50%</td><td>11.42%</td></tr>
    <tr><td>150%</td><td>28.13%</td><td>25.69%</td></tr>
  </tbody>
</table>

The quadratic term is what makes this useful. Doubling volatility quadruples the cost while volume would have to quadruple to keep pace, and volume and volatility do rise together but not reliably by that factor. This single relationship explains most of why LP returns disappoint in volatile pairs and hold up in stable ones.

> warning **Fee income is not free of the same flow** Much of the volume paying you fees is the arbitrage flow generating the LVR. The break-even above is a necessary condition, not an argument that fee-paying volume is independent of the cost.

---

#### Simulating the Path-Dependent Part

Only fees require simulation, but they require it properly. A minimal design specifies five things:

- **The price process.** Geometric Brownian motion is the default and understates tail moves; adding jumps or a stochastic volatility component changes the fee-to-IL balance materially. See [Brownian Motion](/stochastic-calculus/brownian-motion) and [Jumps](/quant-math/jumps).
- **The volume process.** The weakest part of every LP simulation. Volume is endogenous — it responds to volatility, to the fee tier, and to how much liquidity is present — and treating it as an exogenous constant assumes away the mechanism that determines whether the position works.
- **Your share of the pool.** Fees accrue pro rata. Adding liquidity dilutes the share, so a position sized against observed fee income earns less than that income implies.
- **The range, for a concentrated position.** Inside its range a concentrated position behaves like a constant-product pool with amplified virtual reserves; outside it, it holds one asset entirely and earns nothing. See [Concentrated Liquidity](/protocols/concentrated-liquidity).
- **The rebalancing rule and its cost.** Every range adjustment realises the conversion and pays gas. A rule that rebalances on every crossing performs very differently from one that rebalances on a schedule.

Concentration breaks the path-independence of the loss term as well. Because the position converts entirely once price leaves the range, its terminal value depends on *whether and when* the boundary was crossed, not only on where the price finished. A path that exits and returns is not equivalent to one that never left. This is the practical reason concentrated positions must be simulated over paths rather than evaluated over endpoints, while a constant-product position can be evaluated in closed form.

---

#### Code

```python
import numpy as np


def simulate_lp(spot0, sigma, days, paths, fee_rate, daily_turnover, seed=0):
    """Decompose constant-product LP performance into fees and impermanent loss.

    Impermanent loss uses only the terminal price -- it is path independent.
    Fees accumulate along the path, which is the entire reason to simulate.
    Turnover here is exogenous; that is the model's weakest assumption, not a
    convenience, because volume responds to the volatility driving the loss.
    """
    rng = np.random.default_rng(seed)
    dt = 1.0 / 365.0
    shocks = rng.standard_normal((paths, days))
    log_path = np.cumsum(-0.5 * sigma**2 * dt + sigma * np.sqrt(dt) * shocks, axis=1)
    prices = spot0 * np.exp(log_path)

    ratio = prices[:, -1] / spot0
    impermanent_loss = 2 * np.sqrt(ratio) / (1 + ratio) - 1

    # Fees compound on position value, which itself tracks sqrt(price).
    value_factor = np.sqrt(prices / spot0)
    fees = (fee_rate * daily_turnover * value_factor).sum(axis=1)

    return {
        "mean_il": impermanent_loss.mean(),
        "mean_fees": fees.mean(),
        "mean_net": (impermanent_loss + fees).mean(),
        "loss_fraction": float((impermanent_loss + fees < 0).mean()),
    }


def lvr_rate(sigma):
    """Continuous-time cost of being the pool rather than the rebalancer."""
    return sigma**2 / 8


def break_even_turnover(sigma, fee_rate, periods_per_year=365):
    """Daily volume, as a fraction of pooled value, that offsets LVR."""
    return lvr_rate(sigma) / (fee_rate * periods_per_year)
```

---

#### Assumptions and Failure Modes

- **Assumes volume is exogenous.** It is not. Volume responds to volatility, to fee tier, and to the depth you added. A simulation using historical volume implicitly assumes your capital would not have changed it.
- **Assumes your share is constant.** Other providers enter when returns look good and leave when they do not, so realised fee share is mean-reverting in a way a fixed share cannot express.
- **Assumes the price process is calibrated to the right regime.** LVR is quadratic in volatility, so a volatility estimate that is 30% too low understates the cost by nearly half. See [GARCH](/stat-methods/garch).
- **Assumes fees accrue continuously.** In concentrated positions they accrue only in range, and time out of range is a total stop on income while the loss term is already realised.
- **Assumes rebalancing is free.** Gas per adjustment sets a hard floor on economic range width and on how often narrowing is worthwhile.
- **Assumes no competition for the same flow.** Liquidity supplied just in time for a large trade captures the fee on it without bearing the position, which reduces what a passive position earns from precisely the largest trades.
- **Assumes prices are the pool's prices.** Simulating against an external price series ignores that the pool's own price is what arbitrageurs move, and the two coincide only up to the fee band.

> warning **Educational content only** This page describes how to model a liquidity position. It is not a recommendation to provide liquidity, and every figure above is illustrative arithmetic rather than a result from any live pool.

---

#### See Also

* [Impermanent Loss](/building-blocks/impermanent-loss)
* [Concentrated Liquidity](/protocols/concentrated-liquidity)
* [LP Business Models](/strategies/lp-business)
* [Brownian Motion](/stochastic-calculus/brownian-motion)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Why Backtest and Simulate?](/simulation/why-backtest)

---
