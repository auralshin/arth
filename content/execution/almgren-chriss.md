### Almgren–Chriss

> info **Metadata** Level: Advanced | Prerequisites: Market Impact, Volatility, Expectation & Variance | Tags: execution, optimal-execution, almgren-chriss, efficient-frontier, risk-aversion

Almgren–Chriss is the standard framework for answering one question: given a position of `X` shares to liquidate, how fast should you trade? Trading quickly incurs large impact but leaves little time for the price to move against you. Trading slowly minimises impact but leaves you holding an unwanted position, exposed to volatility, for longer. Neither extreme is optimal, and the framework makes the trade-off explicit and solvable.

Its central contribution is conceptual rather than computational. Before Almgren–Chriss, "best execution" was framed as minimising expected cost — an objective whose answer is always "trade infinitely slowly". By adding the *variance* of the execution cost to the objective, the framework turns execution into a portfolio problem with an efficient frontier, and makes the trader's speed an explicit function of their risk aversion.

---

#### Formal Definition

Liquidate `X` shares over a horizon `T`, holding `x(t)` at time `t` with `x(0) = X` and `x(T) = 0`. The trading rate is `v(t) = -dx/dt`, and impact is linear in it:

```text
dS = sigma * dW  -  gamma * v(t) dt        (permanent impact)
execution price  =  S(t) - eta * v(t)      (temporary impact)

E[C]   =  (gamma / 2) * X^2  +  eta * integral_0^T v(t)^2 dt
Var(C) =  sigma^2 * integral_0^T x(t)^2 dt
```

where:

- `sigma` is the price volatility per unit time, in currency per share
- `gamma` is the permanent impact coefficient (currency per share, per share-per-unit-time)
- `eta` is the temporary impact coefficient, in the same units as `gamma`
- `dW` is a Brownian increment — see [Brownian Motion](/stochastic-calculus/brownian-motion)
- `C` is the total execution cost relative to the pre-trade price `S_0`

The permanent term `(gamma/2) * X^2` depends only on total size, not on the schedule, so it cannot be optimised away. Only the temporary term responds to how you trade. The objective is mean–variance in cost:

```text
minimise   E[C] + lambda * Var(C)

solution:  x(t) = X * sinh(kappa * (T - t)) / sinh(kappa * T)
           kappa = sqrt(lambda * sigma^2 / eta)
```

`lambda` is the **risk aversion parameter**, in units of inverse currency, and `kappa` is the urgency it implies. As `lambda -> 0`, `kappa -> 0` and the trajectory collapses to a straight line — a [TWAP](/execution/twap-vwap). As `lambda` grows, the schedule concentrates near `t = 0`.

---

#### Worked Example

To keep every number checkable, restrict attention to **constant-rate schedules** and choose only the horizon `T`. Then `v = X/T` and `x(t) = X(1 - t/T)`, so both integrals evaluate in closed form:

```text
temporary cost  =  eta * X^2 / T
Var(C)          =  sigma^2 * X^2 * T / 3
stdev(C)        =  sigma * X * sqrt(T / 3)
```

Liquidate `X = 1,000,000` shares of a 50.00 stock — a notional of 50,000,000 — with daily volatility `sigma = 0.75` per share (1.5% of 50) and `eta = 5e-7` per share per day. Cost and risk in basis points of notional:

<table>
  <tbody>
    <tr><td><strong>Horizon <code>T</code></strong></td><td><strong>Expected temporary cost</strong></td><td><strong>Timing risk (1 stdev)</strong></td></tr>
    <tr><td>1 day</td><td>500,000 &nbsp;(100.0 bps)</td><td>433,013 &nbsp;(86.6 bps)</td></tr>
    <tr><td>2 days</td><td>250,000 &nbsp;(50.0 bps)</td><td>612,372 &nbsp;(122.5 bps)</td></tr>
    <tr><td>5 days</td><td>100,000 &nbsp;(20.0 bps)</td><td>968,246 &nbsp;(193.6 bps)</td></tr>
    <tr><td>10 days</td><td>50,000 &nbsp;(10.0 bps)</td><td>1,369,306 &nbsp;(273.9 bps)</td></tr>
  </tbody>
</table>

Check the first row: `5e-7 * (1e6)^2 / 1 = 500,000`, and `0.75 * 1e6 * sqrt(1/3) = 750,000 * 0.5774 = 433,013`. This table *is* the efficient frontier — every row is achievable, none dominates another, and choosing among them requires a preference.

**Solving for the optimal horizon.** Minimise `f(T) = eta*X^2/T + lambda*sigma^2*X^2*T/3`:

```text
df/dT = -eta*X^2 / T^2 + lambda*sigma^2*X^2 / 3 = 0
T* = sqrt( 3*eta / (lambda * sigma^2) )
```

With these parameters, `lambda = 1e-6` gives `T* = 1.63` days, `lambda = 1e-7` gives `5.16` days, and `lambda = 1e-8` gives `16.33` days. Note the scaling: `T*` is proportional to `1 / sqrt(lambda)`, so cutting risk aversion tenfold lengthens the horizon by `sqrt(10) = 3.16`. The same square-root relationship governs `kappa` in the full solution.

At `lambda = 1e-7` and `T* = 5.164` days:

1. Expected temporary cost: `5e-7 * 1e12 / 5.164 = 96,824`, or **19.4 bps**
2. Risk term: `1e-7 * 0.5625 * 1e12 * 5.164 / 3 = 96,825` — equal to the cost term, a general property of an `a/T + b*T` objective
3. Timing risk (1 stdev): `0.75 * 1e6 * sqrt(5.164/3) = 984,000`, or **196.8 bps**

For the full sinh solution, `kappa = sqrt(1e-7 * 0.5625 / 5e-7) = sqrt(0.1125) = 0.335` per day — an urgency half-life of `ln(2)/0.335 = 2.07` days. Over a fixed five-day horizon the fraction remaining at days 0 through 5 is 1.00, 0.69, 0.46, 0.28, 0.13, 0.00, against TWAP's 1.00, 0.80, 0.60, 0.40, 0.20, 0.00. The optimal schedule front-loads: 31% of the position is gone after one day rather than 20%.

---

#### Reading the Risk Aversion Parameter

`lambda` is not observable and cannot be measured. It encodes how much expected cost you will pay to remove one unit of cost variance, and in practice it is set one of three ways. **Calibrate to behaviour**: pick the `lambda` that reproduces horizons the desk already considers sensible — circular but honest, and at least consistent across orders. **Tie it to the alpha**: if the signal decays with a known half-life, holding unexecuted size past that half-life forfeits the edge, which gives an economic anchor. **Constrain instead**: many desks discard `lambda` and solve "minimise expected cost subject to `stdev(C)` below a limit" — the same frontier read from the other axis, and easier to defend to a risk committee.

> warning **`lambda` is not a Sharpe-style risk aversion** It applies to the variance of *execution cost on a single order*, not to portfolio wealth. Importing a utility-theoretic risk aversion from portfolio choice gives numbers off by orders of magnitude, because the units differ.

---

#### In Practice Across Asset Classes

**Equities.** The framework's native setting. The main adaptations are a U-shaped intraday volume profile — which makes constant-rate trading unnatural — and the need for a volume-adjusted clock rather than wall-clock time.

**Futures.** Clean application, because volume and volatility are measurable on one book. The permanent term matters less than in equities, since futures flow carries less single-name information, so schedules tend to be more patient.

**FX.** `eta` is hard to calibrate without a consolidated tape, and liquidity varies enormously across the session as regional centres open and close. A time-of-day-varying `eta` is the usual patch. **Fixed income.** Poorly suited: trading is discrete and negotiated rather than continuous, so a smooth trajectory has no operational meaning. The framework's *intuition* — urgency should rise with volatility and fall with impact — survives; the closed form does not.

**On-chain.** Splitting a swap across blocks is exactly this problem, with three modifications. Impact is deterministic given pool reserves, so `eta` is known rather than estimated. Each child trade pays a fixed gas cost, adding a term that penalises many small slices — see [Gas & Mempool](/microstructure/gas-mempool). And the mempool is public, so a predictable schedule is directly exploitable; see [Slippage & Frontrunning](/risk/slippage-frontrunning).

---

#### Assumptions and Failure Modes

- **Impact is linear in the trading rate.** The [square-root law](/execution/market-impact) says it is concave. Linear impact overstates the cost of fast trading and therefore biases the solution toward being too slow. Extensions with concave impact give different trajectories.
- **Price is arithmetic Brownian motion with no drift.** The model deliberately assumes you have no view. If you do, the optimal schedule is no longer symmetric between buying and selling, and this is the wrong tool.
- **Impact parameters are constant.** `eta` and `sigma` vary intraday by large factors, so a schedule computed from daily averages trades too aggressively at the open and too passively in the afternoon.
- **The trajectory is deterministic.** The classical solution fixes the schedule up front and ignores information arriving during execution. Adaptive extensions condition on realised price and depth; they perform better and are much harder to validate.
- **No competition, and variance is the right risk measure.** The model has one trader, so when several liquidate the same exposure at once realised impact exceeds the forecast by a wide margin. And variance penalises favourable moves as heavily as adverse ones; for a liquidation with genuine gap risk a tail measure is more appropriate — see [VaR & CVaR](/quant-math/var-cvar).

---

#### Code

```python
import numpy as np


def optimal_horizon(eta, sigma, risk_aversion):
    """Best horizon within the constant-rate family.

    Balances eta*X^2/T against lambda*sigma^2*X^2*T/3; X cancels out.
    """
    return np.sqrt(3.0 * eta / (risk_aversion * sigma ** 2))


def ac_trajectory(total_shares, horizon, eta, sigma, risk_aversion, n_steps=10):
    """Almgren-Chriss holdings path. Returns (times, shares_remaining).

    kappa -> 0 recovers TWAP; large kappa front-loads the schedule.
    """
    kappa = np.sqrt(risk_aversion * sigma ** 2 / eta)
    t = np.linspace(0.0, horizon, n_steps + 1)
    if kappa * horizon < 1e-9:                    # numerically flat: TWAP
        return t, total_shares * (1.0 - t / horizon)
    remaining = np.sinh(kappa * (horizon - t)) / np.sinh(kappa * horizon)
    return t, total_shares * remaining


optimal_horizon(eta=5e-7, sigma=0.75, risk_aversion=1e-7)   # 5.164 days
t, x = ac_trajectory(1e6, 5.0, 5e-7, 0.75, 1e-7, n_steps=5)
# x / 1e6 -> [1.00, 0.69, 0.46, 0.28, 0.13, 0.00]
```

---

#### See Also

* [Market Impact](/execution/market-impact)
* [TWAP & VWAP](/execution/twap-vwap)
* [Implementation Shortfall](/execution/implementation-shortfall)
* [Execution Overview](/execution/execution-overview)
* [Volatility](/quant-math/volatility)
* [VaR & CVaR](/quant-math/var-cvar)

---
