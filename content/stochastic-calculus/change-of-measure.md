### Change of Measure

> info **Metadata** Level: Advanced | Prerequisites: Martingales & Filtrations, Brownian Motion, Itô's Lemma | Tags: girsanov, radon-nikodym, measure-change, market-price-of-risk, pricing

Changing measure means reweighting the probabilities of outcomes without changing which outcomes are possible. It is the technical move that makes derivative pricing work: under the real-world measure a stock drifts at whatever investors demand for bearing its risk, and that number is unobservable and contested. Under a carefully chosen alternative measure it drifts at the risk-free rate, which is quoted. Girsanov's theorem says that a change of measure can move the drift to wherever you want, and — critically — that it cannot touch the volatility.

That asymmetry is the whole reason option pricing is possible. Volatility is estimable from a price path over a short window; expected return is not estimable in any practical sample. A pricing theory that depended on the expected return would be useless. Girsanov's theorem tells you the expected return does not survive the transformation, so it never had to be estimated.

---

#### Formal Definition

Two probability measures `P` and `Q` on the same space are **equivalent**, written `P ~ Q`, if they agree on which events have probability zero. Neither can make possible what the other calls impossible; they may disagree about everything else.

For equivalent measures the **Radon-Nikodym derivative** exists: a strictly positive random variable `Z = dQ/dP` with `E_P[Z] = 1`, such that for any integrable `X`

```text
E_Q[X] = E_P[ Z * X ]
```

`Z` is a likelihood ratio. Where `Z` exceeds 1, `Q` considers the outcome more likely than `P` does. The associated **density process** `Z_t = E_P[dQ/dP | F_t]` is a positive `P`-martingale with `Z_0 = 1`, and conditional expectations transform by the Bayes rule for measure change:

```text
E_Q[X | F_s] = E_P[ Z_t * X | F_s ] / Z_s      for s before t
```

**Girsanov's theorem.** Let `W` be a `P`-Brownian motion on `[0, T]` and `theta` an adapted process satisfying **Novikov's condition**

```text
E_P[ exp( 0.5 * Int from 0 to T of theta_s^2 ds ) ]  is finite
```

Define

```text
Z_T = exp( - Int from 0 to T of theta_s dW_s  -  0.5 * Int from 0 to T of theta_s^2 ds )
```

Then `Z` is a genuine `P`-martingale with `E_P[Z_T] = 1`; the measure `Q` defined by `dQ/dP = Z_T` is a probability measure equivalent to `P`; and the process

```text
W~_t = W_t + Int from 0 to t of theta_s ds
```

is a standard Brownian motion under `Q`.

where:

- `theta_s` is the **market price of risk**, the drift adjustment per unit of volatility
- `Z_T` is the stochastic exponential of `-theta` against `W` — the martingale met on the [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations) page
- `W~` is the `Q`-Brownian motion, equal to the old one plus a deterministic-looking drift correction

Read `dW = dW~ - theta dt` and substitute wherever `dW` appears. That single substitution shifts every drift in the system by `-theta` times its own diffusion coefficient.

---

#### Why Only the Drift Can Change

Volatility is a **pathwise** quantity. The quadratic variation of a path is the limit of a sum of squared increments along that path — no probabilities enter the computation. What the measure decides is only which paths are likely.

Since `P` and `Q` are equivalent, they agree on which paths have probability zero. The statement "quadratic variation over `[0, T]` equals `Int b_s^2 ds`" holds `P`-almost surely, hence on a set whose complement is `P`-null, hence `Q`-null, hence it holds `Q`-almost surely too. Volatility is therefore invariant under any equivalent change of measure, while the drift — which is a statement about averages, and therefore about probabilities — is free to move.

The practical corollary is worth stating plainly: you can never calibrate away a volatility mismatch by changing measure, and you can never make a real-world drift estimate matter for the price of a replicable derivative.

---

#### Worked Example: Removing the Equity Risk Premium

A stock follows Geometric Brownian motion under the real-world measure `P`:

```text
dS = mu * S * dt + sigma * S * dW
```

<table>
  <tbody>
    <tr><td><strong>Real-world drift, mu</strong></td><td>11% per annum</td></tr>
    <tr><td><strong>Volatility, sigma</strong></td><td>20% per annum</td></tr>
    <tr><td><strong>Risk-free rate, r</strong></td><td>3% per annum</td></tr>
    <tr><td><strong>Horizon, T</strong></td><td>1 year</td></tr>
  </tbody>
</table>

1. **Choose the market price of risk.** Set `theta = (mu - r)/sigma = (0.11 - 0.03)/0.20 = 0.40`. This is the excess return per unit of volatility, which is exactly the asset's [Sharpe ratio](/quant-math/sharpe). The measure change is calibrated to remove precisely one Sharpe unit of drift per unit of volatility.
2. **Substitute.** With `dW = dW~ - theta dt`:

```text
dS = mu*S dt + sigma*S*(dW~ - theta dt)
   = (mu - sigma*theta)*S dt + sigma*S dW~
   = (0.11 - 0.20*0.40)*S dt + 0.20*S dW~
   = 0.03*S dt + 0.20*S dW~
```

The drift is now `r`. The volatility is untouched, as it must be.

3. **Look at the density.** With constant `theta`, `Z_1 = exp(-0.40*W_1 - 0.5*0.16) = exp(-0.40*W_1 - 0.08)`.

<table>
  <tbody>
    <tr><td><strong>Outcome</strong></td><td><strong>W_1</strong></td><td><strong>Z_1 = dQ/dP</strong></td><td><strong>Effect</strong></td></tr>
    <tr><td>Bad year</td><td>-1.5</td><td>exp(0.52) = 1.682</td><td>Q weights this 1.68x more than P</td></tr>
    <tr><td>Flat year</td><td>0.0</td><td>exp(-0.08) = 0.923</td><td>Slightly down-weighted</td></tr>
    <tr><td>Good year</td><td>+1.5</td><td>exp(-0.68) = 0.507</td><td>Q weights this about half as much</td></tr>
  </tbody>
</table>

4. **Check normalisation.** `E_P[Z_1] = E_P[exp(-0.4*W_1)] * exp(-0.08) = exp(0.5*0.16) * exp(-0.08) = exp(0.08 - 0.08) = 1`. As required.

The picture that emerges: `Q` is `P` with probability mass pushed towards the bad states. That is not a forecast of doom. It is a bookkeeping device that folds risk aversion into the probabilities so that the price can be written as a plain discounted expectation, with no risk premium appearing anywhere in the formula. The premium has not disappeared from the world — it has been absorbed into the weights.

> info **Why this makes discounted prices martingales** Under `Q` the stock grows at `r`, so `exp(-r*t)*S_t` has zero drift and is a `Q`-martingale. That single sentence is the content of [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing).

---

#### Multiple Assets and Incomplete Markets

With `n` risky assets driven by `d` independent Brownian motions, `theta` is a `d`-vector and must satisfy

```text
mu_i - r  =  sum over j of  sigma_{ij} * theta_j     for every asset i
```

This is a linear system in `theta`, and its solvability structure carries the economics:

- **No solution.** The excess returns are inconsistent with the volatility structure. That is an arbitrage.
- **Exactly one solution.** There is a unique `Q`, hence a unique arbitrage-free price for every claim. The market is complete.
- **Many solutions.** There are more sources of risk than tradable instruments to hedge them. Every valid `theta` gives a different `Q` and a different price; the model produces a no-arbitrage *interval*, not a number, and choosing within it is a modelling judgement, not a mathematical deduction.

The third case is the normal one. Stochastic volatility is unhedgeable with the underlying alone, so the market price of volatility risk is a free parameter — which is why calibrating a Heston model to option quotes is really a way of asking the option market what value it has chosen.

---

#### Where This Is Used

**Pricing and numeraire changes.** Every closed-form option formula is an expectation under some `Q`, and deriving Black-Scholes requires exactly the substitution above. Discounting by a zero-coupon bond instead of the money-market account gives the `T`-forward measure, under which the forward price is a martingale — this is what makes Black's formula for caplets and swaptions work with a stochastic short rate.

**Importance sampling.** Shifting the simulation drift so that paths land where a payoff is non-zero, then dividing each path's payoff by its Radon-Nikodym weight, is Girsanov used as a computational tool. For deep out-of-the-money options it can cut the required path count by orders of magnitude. See [Numerical Schemes](/stochastic-calculus/numerical-schemes).

**Interpreting the smile.** The risk-neutral density implied by option prices has a fatter left tail than any physical estimate for equity indices. The gap is the measure change, not a forecast disagreement. Reading option-implied probabilities as real-world probabilities is the single most common misuse of this material.

---

#### Assumptions and Failure Modes

- **Equivalence is required.** `Q` cannot create or destroy possible outcomes. A model that assigns zero probability to default cannot be measure-changed into one that prices credit risk.
- **Volatility is fixed.** No measure change alters `sigma`. If the model's volatility is wrong, the price is wrong under every equivalent measure.
- **Novikov's condition can fail.** When it does, `Z` may be a strict local martingale with `E_P[Z_T]` strictly below 1, so the "measure" has total mass under one and is not a probability measure at all. This is a real problem for some Heston parameterisations with strongly positive correlation and for CEV with exponent above 1, where the resulting model admits a bubble.
- **`theta` may not exist or may not be unique.** Non-existence is arbitrage; non-uniqueness is incompleteness. Both are informative, and neither is a bug in the mathematics.
- **`Q` is not a forecast.** Risk-neutral probabilities are prices of state-contingent claims. Using them for risk management, scenario weighting, or expected P&L systematically overweights bad states.
- **The Brownian filtration matters.** Girsanov as stated applies to Brownian drivers. Jump processes need their own version, in which the measure change can alter both the jump intensity and the jump-size distribution — considerably more freedom, and correspondingly less identification.

---

#### Code

```python
import numpy as np

def girsanov_density(brownian_increments, theta, dt):
    """Path-wise dQ/dP for a constant market price of risk theta.

    Z = exp(-theta * W_T - 0.5 * theta^2 * T). E_P[Z] should be 1;
    a sample mean far from 1 signals that Novikov is straining.
    """
    terminal_w = brownian_increments.sum(axis=1)
    horizon = brownian_increments.shape[1] * dt
    return np.exp(-theta * terminal_w - 0.5 * theta**2 * horizon)


def importance_sampled_call(s0, strike, r, sigma, horizon, shift,
                            n_paths=100_000, seed=0):
    """Price a call by sampling under a shifted drift and reweighting.

    `shift` moves paths towards the strike; the density factor removes
    the bias that introduces. Large shifts help deep OTM strikes most.
    """
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(n_paths)
    sqrt_t = np.sqrt(horizon)
    # Sample under the shifted measure, then undo it with the density.
    terminal = s0 * np.exp((r - 0.5 * sigma**2) * horizon
                           + sigma * sqrt_t * (z + shift))
    weight = np.exp(-shift * z - 0.5 * shift**2)
    payoff = np.maximum(terminal - strike, 0.0) * weight
    return np.exp(-r * horizon) * payoff.mean()
```

---

#### See Also

* [Risk-Neutral Pricing](/stochastic-calculus/risk-neutral-pricing)
* [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations)
* [Itô's Lemma](/stochastic-calculus/ito-lemma)
* [Feynman-Kac](/stochastic-calculus/feynman-kac)
* [Black-Scholes](/derivatives/black-scholes)
* [Sharpe Ratio](/quant-math/sharpe)

---
