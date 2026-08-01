### Risk-Neutral Pricing

> info **Metadata** Level: Advanced | Prerequisites: Martingales & Filtrations, Change of Measure, Itô's Lemma | Tags: ftap, martingale-measure, numeraire, replication, arbitrage

Risk-neutral pricing says that the value of a derivative is the expected value of its payoff, discounted at the risk-free rate, computed under a probability measure that is *not* anyone's forecast. The measure is chosen so that discounted prices of tradable assets are martingales. Under it, every asset appears to earn the risk-free rate regardless of its risk — hence "risk-neutral", which is one of the more misleading names in finance.

The critical point is the direction of the logic. Prices are not risk-neutral expectations because investors are indifferent to risk; they are risk-neutral expectations because the derivative can be replicated by trading the underlying, and the cost of that replication does not depend on anyone's risk appetite. The measure is a consequence of replication, not an assumption about preferences.

---

#### The Fundamental Theorems

**First fundamental theorem of asset pricing.** A market admits no arbitrage if and only if there exists a probability measure `Q`, equivalent to the physical measure `P`, under which every asset price discounted by the numeraire is a martingale.

The statement needs care about setting. In finite discrete time (Harrison-Pliska; Dalang-Morton-Willinger) it holds exactly as written, with "no arbitrage" in the elementary sense. In continuous time the elementary version is false — you have to rule out doubling-strategy-style approximate arbitrages — and the correct statement (Delbaen-Schachermayer, 1994) is that **no free lunch with vanishing risk** holds if and only if an equivalent **local** martingale measure exists. The distinction between martingale and local martingale is where asset-price bubbles live, and it is not a technicality that can be waved away.

**Second fundamental theorem.** An arbitrage-free market is complete — every contingent claim can be replicated by a self-financing trading strategy — if and only if `Q` is unique.

The pricing formula, with `B_t = exp(Int from 0 to t of r_s ds)` the money-market account:

```text
V_t = B_t * E_Q[ V_T / B_T | F_t ]
```

and with constant `r` this collapses to the familiar form:

```text
V_t = exp(-r*(T - t)) * E_Q[ V_T | F_t ]
```

where:

- `V_T` is the payoff at maturity, a random variable measurable with respect to `F_T`
- `Q` is the equivalent martingale measure for the chosen numeraire
- `F_t` is the information available at `t` — see [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations)

---

#### Worked Example: One-Period Binomial

The whole theory is visible in three states and no calculus. A stock trades at 100 and in one period moves to 120 or 90. The risk-free gross return over the period is 1.02.

<table>
  <tbody>
    <tr><td><strong>S_0</strong></td><td>100</td></tr>
    <tr><td><strong>Up state</strong></td><td>S_u = 120</td></tr>
    <tr><td><strong>Down state</strong></td><td>S_d = 90</td></tr>
    <tr><td><strong>Gross risk-free return</strong></td><td>R = 1.02</td></tr>
    <tr><td><strong>Claim</strong></td><td>Call struck at 100: pays 20 or 0</td></tr>
  </tbody>
</table>

**Route 1: replicate.**

1. **Hedge ratio.** `Delta = (20 - 0)/(120 - 90) = 20/30 = 0.6667`.
2. **Cash position.** Choose `b` so the portfolio matches in the down state: `0.6667*90 + 1.02*b = 0`, so `b = -60/1.02 = -58.8235`. The portfolio borrows.
3. **Verify the up state.** `0.6667*120 - 58.8235*1.02 = 80 - 60 = 20`. It matches.
4. **Cost today.** `0.6667*100 - 58.8235 = 66.6667 - 58.8235 = 7.8431`.

**Route 2: risk-neutral expectation.**

1. **Solve for the measure that makes the discounted stock a martingale.** Require `(q*120 + (1-q)*90)/1.02 = 100`, giving `q = (1.02 - 0.9)/(1.2 - 0.9) = 0.12/0.30 = 0.40`.
2. **Check.** `E_Q[S_1] = 0.40*120 + 0.60*90 = 102 = 100*1.02`. The stock earns the risk-free rate under `Q`.
3. **Price the call.** `C = (0.40*20 + 0.60*0)/1.02 = 8/1.02 = 7.8431`.

Identical, as the theorem promises. Now the instructive part: **the real-world probability never entered either calculation.** Suppose the stock's true expected return is 10% per period. Then the real probability of the up state solves `120p + 90(1-p) = 110`, giving `p = 0.6667`. Under `P` the call's expected payoff is `0.6667*20 = 13.3333`, and since its price is 7.8431 its expected return is `13.3333/7.8431 = 1.700` — **70% per period**, seven times the stock's.

To price the option under `P` you would need that 70% figure, which depends on the option's own risk premium, which is what you were trying to compute. The circularity is why direct discounting of expected payoffs at a risk-adjusted rate is hopeless for derivatives. Under `Q` the problem vanishes: `q = 0.40` down-weights the up state exactly enough to make discounting at 1.02 correct, and it is pinned down by the stock price rather than estimated.

Note also that `q = 0.40` sits well below `p = 0.6667`, in the same direction that [Girsanov's theorem](/stochastic-calculus/change-of-measure) predicts: the martingale measure shifts weight towards the bad state.

---

#### Numeraires

Nothing forces the money-market account to be the yardstick. Any strictly positive tradable asset `N` can serve as a **numeraire**, and for each one there is a measure `Q^N` under which prices measured in units of `N` are martingales:

```text
V_t / N_t = E_{Q^N}[ V_T / N_T | F_t ]
```

The measures are related by an explicit Radon-Nikodym derivative — for two numeraires `N` and `M`, the density restricted to `F_t` is `(N_t/N_0)*(M_0/M_t)`. Choosing the numeraire well is the standard technique for making a hard expectation easy: pick the one that makes the awkward stochastic term into a constant.

<table>
  <tbody>
    <tr>
      <td><strong>Numeraire</strong></td><td><strong>Measure</strong></td><td><strong>What becomes a martingale</strong></td><td><strong>Used for</strong></td>
    </tr>
    <tr>
      <td>Money-market account B_t</td><td>Risk-neutral Q</td><td>Discounted asset prices</td><td>General pricing, Black-Scholes</td>
    </tr>
    <tr>
      <td>Zero-coupon bond P(t, T)</td><td>T-forward measure</td><td>Forward prices for delivery at T</td><td>Caplets, FX options with stochastic rates</td>
    </tr>
    <tr>
      <td>Swap annuity</td><td>Swap measure</td><td>The par swap rate</td><td>Swaptions, Black's formula on rates</td>
    </tr>
    <tr>
      <td>The asset itself S_t</td><td>Share measure</td><td>Ratios of other prices to S</td><td>The N(d1) term in Black-Scholes; exchange options</td>
    </tr>
  </tbody>
</table>

The `T`-forward measure earns its keep in rates: under it the discount factor comes out of the expectation, so a caplet on a stochastic short rate reduces to a Black-formula expectation of the forward rate, which is a martingale under exactly that measure. Without the numeraire change you would have to handle the correlation between the discount factor and the payoff.

---

#### The Same Statement, Three Ways

Under `Q` with constant `r`, the stock satisfies `dS = r*S dt + sigma*S dW~`, and the price of a European claim can be obtained by any of three equivalent routes:

- **Expectation.** `V_0 = exp(-r*T)*E_Q[g(S_T)]`, evaluated by integration or Monte Carlo.
- **PDE.** Solve the Black-Scholes equation with terminal condition `g`. [Feynman-Kac](/stochastic-calculus/feynman-kac) is the bridge that proves these give the same answer.
- **Replication.** Hold `dV/dS` units of the stock, financed at `r`, and rebalance. [Delta hedging](/derivatives/delta-hedging) is the operational form.

An equivalent formulation avoids the measure change entirely. Define the **stochastic discount factor** (or state-price deflator) `M_t = Z_t / B_t`, where `Z` is the Girsanov density process. Then prices are physical-measure expectations:

```text
V_t = E_P[ (M_T / M_t) * V_T | F_t ]
```

This is the version used in asset pricing and macro-finance, where the object of interest is the deflator itself and its link to marginal utility. It is the same content packaged so that the probabilities stay real and the discounting absorbs the risk adjustment.

---

#### Where This Is Used

**Derivatives pricing.** Every model in production computes a `Q`-expectation, whether analytically, by tree, by PDE, or by simulation. Calibration means choosing model parameters so that the `Q`-prices match quoted instruments.

**Model validation.** Checking that discounted simulated asset prices have zero drift under the model's `Q` is the standard first test of a Monte Carlo implementation. If `E_Q[exp(-rT)*S_T]` differs materially from `S_0`, the simulation is broken before any payoff is applied.

**Extracting implied distributions.** The second derivative of call price with respect to strike gives the risk-neutral density (the Breeden-Litzenberger identity). Practitioners read it for market-implied views on tails — while remembering it is a price, not a forecast. See [Vol Surface](/derivatives/vol-surface).

**Valuation adjustments.** Credit, funding, and capital adjustments (CVA, FVA, KVA) are `Q`-expectations of exposure profiles, which is why counterparty risk systems simulate under a risk-neutral measure even though the exposures being managed are real-world.

---

#### Assumptions and Failure Modes

- **Frictionless trading.** The replication argument assumes no transaction costs, no bid-ask spread, unlimited short selling, and continuous rebalancing. With costs, perfect replication is impossible and the arbitrage-free price becomes a band; the width scales with cost and rebalancing frequency.
- **Completeness is the exception, not the rule.** Stochastic volatility, jumps, and illiquid underlyings all give many `Q` measures. Real desks resolve the indeterminacy by calibrating to traded instruments, which is a market-consensus choice rather than a derivation.
- **`Q` is not a forecast.** The risk-neutral density for an equity index has a much fatter left tail than any physical estimate. Using implied probabilities in scenario analysis systematically overstates crash likelihood.
- **Local versus true martingale.** In some models the discounted price is only a local martingale, and `E_Q[exp(-rT)*S_T]` is strictly below `S_0`. Put-call parity then fails and the "price" from the expectation is not the replication cost. This is how bubbles appear inside otherwise standard models.
- **Self-financing requires a real funding curve.** A single risk-free rate is a fiction. Post-2008 practice uses collateral-specific discounting, multiple curves, and funding adjustments; the theory is unchanged but `B_t` is not a single object.
- **Continuous rebalancing is a limit.** Discrete hedging leaves residual error whose standard deviation shrinks only as the square root of the rebalancing interval. The replication argument is exact in the limit and approximate everywhere a trade actually happens.

---

#### Code

```python
import numpy as np

def binomial_risk_neutral(s0, up, down, gross_rate, payoff):
    """One-period price two ways: martingale measure and replication.

    They must agree to floating-point precision. If they do not, the
    inputs admit an arbitrage (check that down < gross_rate < up).
    """
    q = (gross_rate - down) / (up - down)
    by_measure = (q * payoff(s0 * up) + (1 - q) * payoff(s0 * down)) / gross_rate

    delta = (payoff(s0 * up) - payoff(s0 * down)) / (s0 * up - s0 * down)
    cash = (payoff(s0 * down) - delta * s0 * down) / gross_rate
    by_replication = delta * s0 + cash
    return by_measure, by_replication, q


def monte_carlo_european(s0, strike, r, sigma, horizon, n_paths=200_000, seed=0):
    """E_Q[payoff] under the risk-neutral drift r, not the real-world mu."""
    rng = np.random.default_rng(seed)
    z = rng.standard_normal(n_paths)
    terminal = s0 * np.exp((r - 0.5 * sigma**2) * horizon
                           + sigma * np.sqrt(horizon) * z)
    discounted = np.exp(-r * horizon) * np.maximum(terminal - strike, 0.0)
    return discounted.mean(), discounted.std(ddof=1) / np.sqrt(n_paths)
```

---

#### See Also

* [Change of Measure](/stochastic-calculus/change-of-measure)
* [Feynman-Kac](/stochastic-calculus/feynman-kac)
* [Martingales & Filtrations](/stochastic-calculus/martingales-filtrations)
* [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication)
* [Binomial Trees](/derivatives/binomial-trees)
* [Black-Scholes](/derivatives/black-scholes)

---
