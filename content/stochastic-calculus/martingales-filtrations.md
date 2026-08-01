### Martingales & Filtrations

> info **Metadata** Level: Advanced | Prerequisites: Brownian Motion, Expectation & Variance, Random Variables | Tags: martingales, filtrations, stopping-times, optional-stopping, no-arbitrage

A filtration is the formal way to say "what is known at time `t`". A martingale is the formal way to say "nothing knowable at time `t` predicts the next move". Together they are the language in which absence of arbitrage is stated: a market is arbitrage-free precisely when some reweighting of the probabilities turns discounted asset prices into martingales.

These are not decorative abstractions. The distinction between what a hedge ratio may depend on and what it may not is the difference between a trading strategy and a time machine, and filtrations are what make that distinction precise. Every "you cannot use tomorrow's price" caveat in backtesting is, formally, a measurability condition.

---

#### Formal Definition

A **filtration** `{F_t}` on a probability space is a family of sigma-algebras that only grows:

```text
F_s  is contained in  F_t   whenever s comes before t
```

Each `F_t` is the collection of events whose truth is settled by time `t`. Information accumulates and is never forgotten. The **natural filtration** of a process `X` is `F_t = sigma(X_s : s at or before t)` — everything the path itself has revealed.

A process `X` is **adapted** to `{F_t}` if `X_t` is `F_t`-measurable for every `t`: its value is known once time `t` has arrived. A slightly stronger condition, **predictability**, requires the value to be known strictly before `t`; hedge ratios and position sizes must be predictable, which is the mathematical statement of "decide the trade before the move".

An adapted process `M` is a **martingale** with respect to `{F_t}` and measure `P` if:

```text
1.  E|M_t| is finite for every t          (integrability)
2.  E[M_t | F_s] = M_s   for s before t   (the martingale property)
```

Replacing `=` with "at least" gives a **submartingale** (drifts up); with "at most", a **supermartingale** (drifts down). Note that a martingale is defined relative to a filtration *and* a measure — the same process can be a martingale under one probability measure and not another, which is the whole content of [Change of Measure](/stochastic-calculus/change-of-measure).

**Canonical examples.** With `W` a Brownian motion and its natural filtration:

```text
W_t                                  is a martingale
W_t^2 - t                            is a martingale
exp(sigma*W_t - 0.5*sigma^2*t)       is a martingale, for any constant sigma
N_t - lambda*t                       is a martingale (N a Poisson process, rate lambda)
```

The second is worth verifying, because it shows the machinery. Write `W_t = W_s + (W_t - W_s)`, expand the square, and condition on `F_s`:

```text
E[W_t^2 | F_s] = W_s^2 + 2*W_s*E[W_t - W_s] + E[(W_t - W_s)^2] = W_s^2 + 0 + (t - s)
```

so `E[W_t^2 - t | F_s] = W_s^2 - s`. The `-t` term exactly compensates the variance that accumulates — which is the same statement as `W` having quadratic variation `t`. The third example, the **stochastic exponential**, is the density process that Girsanov's theorem uses.

> info **Lévy's characterisation** A continuous local martingale `M` with `M_0 = 0` and quadratic variation `[M]_t = t` *is* a standard Brownian motion. Martingale property plus the right quadratic variation determines the process completely — this is what makes the whole framework work.

---

#### Why "Fair Game" Is the Right Intuition

A martingale is the mathematical form of a game whose expected future value, given everything you currently know, equals its present value. Two things make this the correct intuition rather than a loose analogy.

First, **you cannot beat it by betting**. If `M` is a martingale and `H` is a bounded predictable process — any non-anticipating position sizing you like, including one that depends on the entire path so far — then the gains process

```text
G_t = Int from 0 to t of H_s dM_s
```

is itself a martingale with `E[G_t] = 0`. No adapted strategy generates expected profit from a martingale. This is the discrete-time "no gambling system" theorem of Doob, carried into continuous time by the Itô integral. It is also why the Itô integral is the right integral for finance: it is constructed so that the integrand is evaluated at the *left* endpoint of each interval, meaning you commit the position before seeing the move.

Second, **it separates predictability from profitability**. A martingale can have wildly varying volatility, fat tails, and strong dependence in its squared increments and still be a fair game. Martingale is a statement about the conditional mean only. A price series can be a perfect martingale and still be highly forecastable in variance — which is exactly what real markets look like, and why [Autocorrelation](/quant-math/autocorrelation) of returns near zero does not imply "nothing is predictable".

---

#### Stopping Times and Optional Stopping

A **stopping time** `tau` is a random time whose occurrence is decided by the information available: the event "`tau` is at or before `t`" belongs to `F_t`. "The first time price touches 120" is a stopping time. "The day of this year's high" is not — you need the whole year to know it.

The **optional stopping theorem** says a martingale stopped at a stopping time still has its starting expectation, `E[M_tau] = E[M_0]`, provided one of these holds:

- `tau` is bounded: there is a constant `c` with `tau` at or below `c` almost surely; or
- `M` is uniformly integrable (equivalently, the stopped process is); or
- `E[tau]` is finite and the increments of `M` are bounded by a constant.

None of these is decorative. Drop them all and the theorem is false.

---

#### Worked Example: Gambler's Ruin

A symmetric random walk `X` starts at 3 and stops when it hits either 0 or 10. Each step is plus or minus 1 with probability one-half, so `X` is a martingale and `X_n^2 - n` is a martingale. Steps are bounded and `E[tau]` is finite, so optional stopping applies to both.

<table>
  <tbody>
    <tr><td><strong>Start</strong></td><td>a = 3</td></tr>
    <tr><td><strong>Absorbing barriers</strong></td><td>0 and N = 10</td></tr>
    <tr><td><strong>Step</strong></td><td>+1 or -1, each with probability 0.5</td></tr>
  </tbody>
</table>

1. **Probability of reaching 10 before 0.** Apply optional stopping to `X`: `E[X_tau] = X_0 = 3`. At `tau` the walk is at 0 or 10, so `0*(1 - p_win) + 10*p_win = 3`, giving `p_win = 0.30`.
2. **Expected number of steps.** Apply optional stopping to `X_n^2 - n`: `E[X_tau^2] - E[tau] = X_0^2 = 9`. Now `E[X_tau^2] = 0*0.70 + 100*0.30 = 30`, so `E[tau] = 30 - 9 = 21`.
3. **Cross-check.** The closed form for a symmetric walk is `E[tau] = a*(N - a) = 3*7 = 21`. It matches.

The number to sit with is 0.30. Starting 3 units from ruin and 7 units from the target, the fair game gives you a 30% chance — exactly the ratio of distances. No sizing rule changes it, because no adapted strategy changes the expectation of a martingale. This is the honest version of the argument that a positive-expectation edge, not clever staking, is what makes money; see [Kelly Criterion](/quant-math/kelly) for what changes when the game is *not* fair.

> warning **Optional stopping fails without its conditions** Let `tau` be the first time a Brownian motion reaches 1. It is finite with probability one, yet `E[W_tau] = 1`, not 0. The stopped process is not uniformly integrable and `E[tau]` is infinite. This is the doubling strategy in disguise: guaranteed profit, unbounded intermediate loss, unbounded time. Every "cannot lose" martingale betting system dies on exactly this condition.

---

#### Where This Is Used

**Pricing.** The first fundamental theorem of asset pricing is a martingale statement: discounted prices are martingales under an equivalent measure `Q`. Everything in [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing) is bookkeeping on top of that sentence.

**Hedging.** The martingale representation theorem says that any square-integrable random variable measurable with respect to a Brownian filtration can be written as a constant plus a stochastic integral against `W`. That integrand *is* the hedge ratio. Completeness of the Black-Scholes market is this theorem, not a separate assumption.

**Backtesting discipline.** Look-ahead bias is a measurability violation: a signal computed at time `t` from data that only settles at `t + 1` is not adapted. Point-in-time data, publication lags, and restated fundamentals are all filtration hygiene. See [Backtest vs Live](/risk/backtest-vs-live).

**Barrier and American products.** Stopping times are the natural language for knock-outs, early exercise, and liquidation triggers. Optimal exercise is a supermartingale problem: the price process of an American option is the smallest supermartingale dominating the payoff.

---

#### Assumptions and Failure Modes

- **Integrability.** The martingale property is vacuous without `E|M_t|` finite. Models with heavy enough tails (some stable-law and some stochastic-volatility specifications) fail this, and conditional expectations stop being defined.
- **Local martingale is not martingale.** A local martingale has the property only up to a localising sequence of stopping times. Strict local martingales have `E[M_t]` strictly below `M_0` — they leak value. This is not pathology hunting: it is how asset-price bubbles are formalised, and it is why Novikov-type conditions appear in Girsanov's theorem.
- **Filtration choice matters.** A process can be a martingale in its own filtration and not in a larger one that includes an informed trader's signal. "Prices are a martingale" is always relative to a stated information set.
- **Martingale is a first-moment statement only.** It rules out predictable direction, not predictable volatility, skew, or tails. Assuming otherwise is the standard misreading of the efficient-markets literature.
- **Measure dependence.** Martingale under `Q` says nothing about behaviour under `P`. Discounted prices are `Q`-martingales in any arbitrage-free market, including one where the real-world expected return is 15%.

---

#### Code

```python
import numpy as np

def is_martingale_estimate(paths, dt_index_a, dt_index_b, tolerance=None):
    """Monte Carlo check of E[M_b | F_a] = M_a, aggregated over paths.

    Only tests the unconditional consequence E[M_b] = E[M_a]; a genuine
    conditional test requires bucketing by the value of M_a.
    """
    drift = paths[:, dt_index_b].mean() - paths[:, dt_index_a].mean()
    stderr = paths[:, dt_index_b].std(ddof=1) / np.sqrt(paths.shape[0])
    tolerance = tolerance if tolerance is not None else 2 * stderr
    return abs(drift) < tolerance, drift, stderr


def stochastic_exponential(brownian_path, sigma, times):
    """exp(sigma*W_t - 0.5*sigma^2*t): the density process used by Girsanov."""
    return np.exp(sigma * brownian_path - 0.5 * sigma**2 * times)
```

---

#### See Also

* [Brownian Motion](/stochastic-calculus/brownian-motion)
* [Change of Measure](/stochastic-calculus/change-of-measure)
* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Random Walks](/quant-math/random-walks)
* [Backtest vs Live](/risk/backtest-vs-live)

---
