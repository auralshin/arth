### Geometric Brownian Motion

> info **Metadata** Level: Advanced | Prerequisites: Random Walks, Calculus, Volatility | Tags: gbm, stochastic-processes, prices, diffusion

Geometric Brownian Motion (GBM) is the continuous-time model in which percentage changes, not absolute changes, are the random quantity. Prices stay positive, log returns are normally distributed, and variance grows linearly with time. It is the price process underlying Black-Scholes, the default engine of scenario simulation, and the reference point against which every richer model is described.

Its practical value is that it is the simplest model that gets the *structure* right — multiplicative dynamics, positive prices, variance accumulating with horizon — while getting the details visibly wrong. Real returns have fatter tails than GBM permits, volatility is not constant, and prices gap. Knowing precisely which of those assumptions has failed is usually more useful than replacing the model wholesale.

This page treats GBM as an applied tool. For the derivation from Itô's lemma and the formal solution of the stochastic differential equation, see [Itô's Lemma](/stochastic-calculus/ito-lemma) and [SDEs](/stochastic-calculus/sdes).

---

#### Formal Definition

GBM is specified by the stochastic differential equation:

```text
dS = mu * S * dt + sigma * S * dW
```

where:

- `S` is the price
- `mu` is the expected instantaneous return per unit time
- `sigma` is the volatility per unit time
- `dW` is an increment of standard Brownian motion, with variance `dt`

Both terms scale with `S`, which is what makes the model multiplicative and keeps prices positive.

The solution, obtained by applying Itô's lemma to `ln(S)`, is:

```text
S_T = S_0 * exp( (mu - sigma^2/2) * T  +  sigma * sqrt(T) * Z )
```

with `Z` a standard normal draw. Equivalently, the log return is normally distributed:

```text
ln(S_T / S_0)  ~  Normal( (mu - sigma^2/2) * T ,  sigma^2 * T )
```

**The `-sigma^2/2` term.** This is the single most consequential detail in the model, and it is not a correction bolted on afterwards — it falls out of Itô's lemma because `ln` is concave. Its meaning is direct: the *expected* price grows at `mu`, but the *typical* price grows at `mu - sigma^2/2`. Volatility subtracts from compound growth.

```text
E[S_T]      = S_0 * exp(mu * T)                    the mean
median(S_T) = S_0 * exp((mu - sigma^2/2) * T)      the typical outcome
```

The distribution of `S_T` is log-normal: right-skewed, with a mean pulled above the median by a long upper tail.

---

#### Worked Example

`S_0 = 100`, `mu = 8%`, `sigma = 25%`, horizon `T = 1` year.

1. **Log drift**: `mu - sigma^2/2 = 0.08 - 0.03125 = 0.04875`
2. **Log volatility**: `sigma * sqrt(T) = 0.25`
3. **Median**: `100 * exp(0.04875) = 105.00`
4. **Mean**: `100 * exp(0.08) = 108.33`
5. **Quantiles**, using `exp(0.04875 + z * 0.25)`:

<table>
  <tbody>
    <tr>
      <td><strong>Percentile</strong></td>
      <td>5th</td><td>25th</td><td>50th</td><td>75th</td><td>95th</td>
    </tr>
    <tr>
      <td><strong>z</strong></td>
      <td>-1.645</td><td>-0.674</td><td>0.000</td><td>0.674</td><td>1.645</td>
    </tr>
    <tr>
      <td><strong>Price</strong></td>
      <td>69.60</td><td>88.70</td><td>105.00</td><td>124.28</td><td>158.40</td>
    </tr>
  </tbody>
</table>

6. **Probability of finishing above the start**: `N(0.04875 / 0.25) = N(0.195) = 57.7%`

Read the table carefully. The expected price is `108.33`, but only `45%` of outcomes exceed it — the probability is `1 - N((0.08 - 0.04875) / 0.25) = 1 - N(0.125)` — and the median outcome is `105.00`. The mean is above the median because the upper tail is unbounded while the lower tail is floored at zero. Anyone who plans around "expected return" without checking the median is planning around an outcome that is less likely than not.

**Over five years** the asymmetry widens: the median becomes `100 * exp(5 * 0.04875) = 127.60` while the mean becomes `100 * exp(0.40) = 149.18`. The probability of finishing above the start is `N(0.24375 / (0.25 * sqrt(5))) = N(0.436) = 66.9%`.

> info **Volatility drag is a property of compounding, not a cost** The gap between `mu` and `mu - sigma^2/2` is not a fee. It is what happens when returns multiply rather than add. It is why the geometric mean is always below the arithmetic mean. See [Returns](/quant-math/returns).

---

#### Simulating It

GBM has an exact discretisation, which is unusual and worth exploiting. Because the solution is known in closed form, you can step directly:

```text
S_{t+dt} = S_t * exp( (mu - sigma^2/2) * dt  +  sigma * sqrt(dt) * Z )
```

This is exact for any step size — there is no discretisation error, only sampling error. Compare with the Euler-Maruyama scheme applied to the SDE directly, `S_{t+dt} = S_t (1 + mu*dt + sigma*sqrt(dt)*Z)`, which introduces bias and can produce negative prices at large steps. Use the exponential form. For processes without a closed-form solution the choice of scheme matters far more; see [Numerical Schemes](/stochastic-calculus/numerical-schemes).

**Under the risk-neutral measure**, `mu` is replaced by the risk-free rate `r` for pricing purposes. The volatility is unchanged, but the drift is not the real-world expected return — it is the drift consistent with no arbitrage. Confusing the two produces simulations that are correct for pricing and wrong for risk. See [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing) and [Black-Scholes](/derivatives/black-scholes).

---

#### In Practice Across Asset Classes

- **Equities.** The natural home of GBM: prices are positive, returns are multiplicative, and the log-normal shape is roughly right for indices over longer horizons. It fails on the tails at daily frequency and on the volatility surface, where constant volatility is contradicted by the market's own option prices. See [Implied Volatility](/derivatives/implied-volatility).
- **Futures.** Applied to the futures price directly, with the drift adjusted for cost of carry rather than being an expected return. For contracts whose price can go negative, the multiplicative structure is simply invalid and a different process is required.
- **FX.** Broadly reasonable for major floating pairs, with the drift constrained by covered interest parity rather than free. Fails completely for managed or pegged currencies, where the process is closer to a constant plus a jump. See [FX Carry & Parity](/markets/fx-carry-parity).
- **Fixed income.** Unsuitable for yields, which are mean-reverting and can be negative. Bond *prices* also pull to par at maturity, which GBM has no mechanism to represent. Term-structure models exist precisely because GBM does not work here. See [Ornstein-Uhlenbeck](/stochastic-calculus/ornstein-uhlenbeck).
- **Credit.** GBM appears indirectly, as the process for firm asset value in the Merton structural model, where default is the asset value crossing a liability barrier. The diffusion assumption is what makes short-dated default probabilities in that model implausibly small, since a continuous path cannot jump to default. See [Merton Model](/credit/merton-model).
- **Commodities.** Poor for storable commodities, where inventory dynamics create mean reversion and seasonality. Better for the front of the curve over short horizons than for the level over long ones.
- **On-chain.** Used as a scenario generator for liquidity-provision and liquidation analysis, where its main defect is understating the probability of a large single-block move. Since liquidation is triggered by a threshold crossing, understating jump risk understates exactly the quantity of interest. See [Liquidations](/building-blocks/liquidations).

---

#### Assumptions and Failure Modes

- **Constant volatility.** Contradicted by volatility clustering in the data and by the volatility surface in option markets. GARCH and stochastic-volatility models exist to relax it. See [GARCH](/stat-methods/garch) and [Vol Surface](/derivatives/vol-surface).
- **Normally distributed log returns.** Real daily returns have far more mass in the tails. GBM assigns negligible probability to moves that occur with uncomfortable regularity.
- **Continuous paths.** No gaps, no discontinuities. This is the assumption that makes continuous delta hedging theoretically perfect and practically impossible. See [Jump Processes](/quant-math/jumps) and [Delta Hedging](/derivatives/delta-hedging).
- **Independent increments.** No momentum, no reversion, no memory of any kind. Convenient, and only approximately true.
- **Constant drift.** `mu` is treated as known and fixed. It is neither, and estimation error in it dwarfs almost every other modelling choice at long horizons. See [LLN & CLT](/quant-math/lln-clt).
- **Prices strictly positive.** A feature for equities, a defect for spreads, yields, and any quantity that can cross zero.
- **Frictionless trading.** No spread, no impact, no borrowing constraint. The hedging arguments built on GBM assume costless continuous rebalancing.

> warning **A GBM simulation reports the model's tails, not the market's** Risk numbers produced by simulating GBM are conditional on normality. Stress-test the assumption separately rather than reading the simulated quantiles as probabilities.

---

#### Code

```python
import numpy as np

def simulate_gbm(s0, mu, sigma, years, steps_per_year=252, n_paths=1000, seed=None):
    """Exact GBM simulation. No discretisation error at any step size.

    The exponential form cannot produce negative prices; the Euler
    form applied to the SDE directly can, and is biased.
    """
    rng = np.random.default_rng(seed)
    n_steps = int(years * steps_per_year)
    dt = 1.0 / steps_per_year

    drift = (mu - 0.5 * sigma**2) * dt
    diffusion = sigma * np.sqrt(dt)
    shocks = rng.normal(drift, diffusion, size=(n_paths, n_steps))

    log_paths = np.cumsum(shocks, axis=1)
    return s0 * np.exp(np.column_stack([np.zeros(n_paths), log_paths]))


def gbm_quantile(s0, mu, sigma, years, percentile):
    """Analytic quantile of the terminal price. No simulation needed."""
    from scipy.stats import norm

    z = norm.ppf(percentile)
    log_drift = (mu - 0.5 * sigma**2) * years
    return s0 * np.exp(log_drift + z * sigma * np.sqrt(years))


def median_vs_mean(s0, mu, sigma, years):
    """The gap is volatility drag: the mean is not the typical outcome."""
    return (
        s0 * np.exp((mu - 0.5 * sigma**2) * years),
        s0 * np.exp(mu * years),
    )
```

---

#### See Also

* [Random Walks](/quant-math/random-walks)
* [Jump Processes](/quant-math/jumps)
* [Volatility](/quant-math/volatility)
* [Returns](/quant-math/returns)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [SDEs](/stochastic-calculus/sdes)
* [Black-Scholes](/derivatives/black-scholes)

---
