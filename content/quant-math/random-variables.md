### Random Variables

> info **Metadata** Level: Intermediate | Prerequisites: Basic probability, algebra | Tags: math, probability, distributions, quant

A random variable attaches a number to an uncertain outcome. Rather than reasoning about vague statements like "the market goes up", you define `R` as tomorrow's return on an index and then ask precise questions: what is the probability `R` falls below minus two per cent, what is its average, how heavy are its tails. Everything downstream — volatility, Value at Risk, option prices, portfolio weights — is a functional of some random variable's distribution.

The move from outcomes to numbers is what makes finance computable. Once daily equity returns, the number of bond issuers defaulting in a year, the time until a limit order fills, and the payoff of a call option are all random variables, the same machinery of expectation, variance, and convolution applies to all of them.

---

#### Formal Definition

A random variable `X` is a function from the set of possible outcomes to the real numbers. Its behaviour is fully described by its **cumulative distribution function (CDF)**:

```text
F(x) = P(X <= x)
```

where:

- `P(...)` is the probability of the event in brackets
- `F` is non-decreasing, tends to 0 far to the left and to 1 far to the right

Two cases dominate in practice.

**Discrete.** `X` takes values from a countable set, described by a **probability mass function (PMF)** `p(x) = P(X = x)`, with the masses summing to 1. The number of defaults in a credit portfolio, the number of trades in a minute, and the number of contracts filled are discrete.

**Continuous.** `X` takes values on an interval, described by a **probability density function (PDF)** `f(x)`, where probability comes from area:

```text
P(a <= X <= b) = integral from a to b of f(x) dx
```

For a continuous variable, any single value has probability zero; only intervals carry probability. Log returns are usually modelled this way.

**Mixed.** Many financial variables are neither. The payoff of an option has a point mass at zero and a continuous density above it. Realised loss on a bond has a mass at zero (no default) and a continuous recovery distribution otherwise.

> info **Distribution, not outcome** A random variable is not a number that changes. It is a fixed description of a set of possibilities together with their weights. A single observed return is a *realisation*, and on its own it tells you very little about the distribution that produced it.

---

#### Worked Example

A risk model summarises tomorrow's return on a stock with five scenarios:

<table>
  <tbody>
    <tr>
      <td><strong>Return (%)</strong></td>
      <td>-5.0</td><td>-1.0</td><td>0.5</td><td>2.0</td><td>6.0</td>
    </tr>
    <tr>
      <td><strong>Probability</strong></td>
      <td>0.10</td><td>0.20</td><td>0.40</td><td>0.20</td><td>0.10</td>
    </tr>
  </tbody>
</table>

The probabilities sum to 1.00, so this is a valid PMF.

1. **Expectation.** Multiply each value by its probability and add: `(-5)(0.10) + (-1)(0.20) + (0.5)(0.40) + (2)(0.20) + (6)(0.10)` = `-0.50 - 0.20 + 0.20 + 0.40 + 0.60` = `0.50%`
2. **Second moment.** `E[R^2] = (25)(0.10) + (1)(0.20) + (0.25)(0.40) + (4)(0.20) + (36)(0.10)` = `2.50 + 0.20 + 0.10 + 0.80 + 3.60` = `7.20`
3. **Variance.** `Var(R) = E[R^2] - (E[R])^2 = 7.20 - 0.25 = 6.95`
4. **Standard deviation.** `sqrt(6.95) = 2.64%`
5. **A tail probability.** `P(R <= -1%) = 0.10 + 0.20 = 0.30`

The mean return is a modest `+0.50%`, but 30% of the probability mass sits at or below `-1%`, and the single worst scenario contributes more than a third of the total second moment. The mean alone hides that shape completely, which is the recurring lesson of this entire section.

---

#### Distributions You Will Meet

<table>
  <tbody>
    <tr>
      <td><strong>Distribution</strong></td>
      <td><strong>Typical use</strong></td>
      <td><strong>Watch for</strong></td>
    </tr>
    <tr>
      <td>Normal</td>
      <td>Log returns over longer horizons; regression errors</td>
      <td>Tails far too thin for daily financial data</td>
    </tr>
    <tr>
      <td>Log-normal</td>
      <td>Price levels under geometric models</td>
      <td>Strictly positive, so it cannot represent default to zero</td>
    </tr>
    <tr>
      <td>Student-t</td>
      <td>Daily returns; a normal with heavier tails</td>
      <td>Variance is undefined for degrees of freedom at or below 2</td>
    </tr>
    <tr>
      <td>Poisson</td>
      <td>Counts: defaults, trades, jump arrivals</td>
      <td>Forces variance to equal the mean; real counts often overdisperse</td>
    </tr>
    <tr>
      <td>Bernoulli</td>
      <td>Default or no default; fill or no fill</td>
      <td>The whole modelling problem collapses into estimating one probability</td>
    </tr>
    <tr>
      <td>Exponential</td>
      <td>Waiting times between events; default timing in reduced-form models</td>
      <td>Memorylessness is a strong and frequently wrong assumption</td>
    </tr>
  </tbody>
</table>

---

#### Transformations and Joint Behaviour

Most quantities of interest are functions of other random variables, and the function reshapes the distribution.

- If `r` is normal, then `P = P_0 * exp(r)` is log-normal, and the mean of `P` is *not* `P_0 * exp(E[r])`. See [Geometric Brownian Motion](/quant-math/gbm).
- An option payoff such as `max(S - K, 0)` truncates the distribution of `S`, which is why option prices depend on the whole density rather than just its mean. See [Payoffs & Parity](/derivatives/payoffs-parity).
- **Jensen's inequality**: for a convex function `g`, `E[g(X)]` is at least `g(E[X])`. Convexity is why a delta-hedged long option position gains from movement in either direction.

Two random variables need a **joint distribution** to be described together. The individual distributions do not determine the joint one: two portfolios with identical marginal return distributions can carry very different risk depending on how the components co-move. That dependence structure is the subject of [Covariance](/quant-math/covariance).

---

#### In Practice Across Asset Classes

The abstraction is universal; the choice of what to model as a random variable is not.

- **Equities.** The workhorse is the daily log return of a single name or index. Practitioners rarely assume normality for anything risk-facing; a Student-t or the empirical distribution itself is standard.
- **Fixed income.** The natural variable is often a *yield change* rather than a return, because price is a deterministic function of yield given a known cash-flow schedule. Whole curves are modelled jointly, so the object is a random vector. See [Yield Curves](/markets/yield-curves).
- **Futures.** Returns must be defined on a rolled series, so the variable depends on the roll convention. The same underlying with two roll rules produces two different distributions. See [Roll and Carry](/markets/roll-and-carry).
- **FX.** A rate is a ratio, so the choice of base currency changes the distribution. A variable that looks symmetric quoted one way is skewed when inverted.
- **Credit.** Loss is naturally mixed: a mass at zero for no default, and a continuous recovery distribution conditional on default. Modelling it as purely continuous discards the structure that matters most. See [Default Probability](/credit/default-probability).
- **Derivatives.** The payoff is a deterministic function of a random underlying, so pricing is an expectation of a transformed variable under a particular measure. See [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing).
- **On-chain.** Counts dominate: liquidations per block, swaps per pool per hour, blocks until inclusion. These are discrete and typically overdispersed relative to Poisson, because activity clusters heavily during stress.

---

#### Assumptions and Failure Modes

- **Assuming a distribution exists and is stable.** Fitting presumes the data-generating process is not changing underneath you. Regime shifts invalidate the fit without any visible signal. See [Stationarity](/quant-math/stationarity).
- **Assuming finite moments.** Variance and any ratio built on it are meaningless if the true variance is infinite. A heavy-tailed fit with very low degrees of freedom should prompt you to check whether the statistic you are computing is even defined.
- **Confusing the sample with the distribution.** A histogram of 250 daily returns says almost nothing about a 1-in-1000 event, yet that is exactly where risk limits are set.
- **Ignoring discreteness.** Prices move in ticks, sizes in lots, blocks in integers. Continuous approximations degrade at short horizons and small sizes — precisely where execution decisions live.
- **Treating marginals as sufficient.** Knowing each asset's distribution does not give you the portfolio's. Dependence is a separate object, and it is unstable under stress.
- **Silent conditioning.** "The distribution of returns" usually means the distribution conditional on the asset still trading. Delisted, defaulted, or abandoned assets leave the sample and take the left tail with them.

> warning **Zero probability is not impossibility** For a continuous variable every specific value has probability zero, yet one of them occurs. Do not read a model's assignment of negligible probability to an event as a claim that the event cannot happen.

---

#### Code

```python
import numpy as np

def discrete_moments(values, probabilities):
    """Mean, variance and standard deviation of a discrete random variable."""
    values = np.asarray(values, dtype=float)
    probabilities = np.asarray(probabilities, dtype=float)
    # An unnormalised PMF corrupts every downstream number silently.
    assert np.isclose(probabilities.sum(), 1.0), "probabilities must sum to 1"

    mean = (values * probabilities).sum()
    second_moment = (values**2 * probabilities).sum()
    variance = second_moment - mean**2
    return mean, variance, np.sqrt(variance)


def empirical_cdf(sample, x):
    """P(X <= x) estimated from an observed sample, with no distributional fit."""
    return np.mean(np.asarray(sample) <= x)
```

---

#### See Also

* [Expectation & Variance](/quant-math/expectation-variance)
* [Covariance](/quant-math/covariance)
* [LLN & CLT](/quant-math/lln-clt)
* [Sampling](/quant-math/sampling)
* [Returns](/quant-math/returns)
* [Brownian Motion](/stochastic-calculus/brownian-motion)
* [Confidence Intervals](/stat-methods/confidence-intervals)

---
