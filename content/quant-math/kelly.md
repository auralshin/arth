### Kelly Criterion

> info **Metadata** Level: Advanced | Prerequisites: Expectation & Variance, Returns | Tags: kelly, bet-sizing, growth, risk

The Kelly criterion answers a question that expected-value reasoning cannot: given a favourable but risky opportunity repeated many times, what fraction of capital should be committed to each instance? Maximising expected wealth says commit everything, which guarantees eventual ruin. Kelly instead maximises the expected **logarithm** of wealth, which is the same as maximising the long-run compound growth rate, and produces a finite, specific fraction.

The result is elegant and the practical difficulty is severe. Kelly assumes you know the edge exactly. You do not — edge is estimated from noisy data — and the penalty function is asymmetric: betting half the optimal fraction costs a quarter of the growth rate, while betting twice the optimal fraction costs all of it. Almost every practitioner who uses Kelly uses a fraction of it, and the reason is estimation error rather than timidity.

---

#### Formal Definition

**Discrete case.** For a bet that wins `b` times the stake with probability `p` and loses the stake with probability `q = 1 - p`:

```text
f* = (b * p - q) / b
```

where `f*` is the fraction of current capital to stake. If `f*` is zero or negative there is no edge and the correct size is zero.

The long-run growth rate per bet at any fraction `f` is:

```text
g(f) = p * ln(1 + b*f) + q * ln(1 - f)
```

**Continuous case.** For an asset with expected return `mu`, volatility `sigma`, and risk-free rate `r`, with continuous rebalancing:

```text
f*   = (mu - r) / sigma^2
g(f) = r + f * (mu - r) - f^2 * sigma^2 / 2
```

The growth rate is a downward parabola in `f`, maximised at `f*`. Substituting `f*` gives the excess growth rate at the optimum:

```text
g(f*) - r      = (mu - r)^2 / (2 * sigma^2) = Sharpe^2 / 2
g(c * f*) - r  = (2c - c^2) * (Sharpe^2 / 2)
```

The maximum achievable compound growth premium is half the squared Sharpe ratio, and nothing about position sizing can improve on it. The second line covers **fractional Kelly**: betting `c` times the optimal fraction retains `2c - c^2` of the maximum growth, independent of the specific parameters. At `c = 0.5` that is `0.75`; at `c = 2` it is exactly zero.

---

#### Worked Example

**A binary bet.** You win an even-money bet (`b = 1`) with probability `p = 0.55`.

1. **Kelly fraction**: `f* = (1 * 0.55 - 0.45) / 1 = 0.10` — stake 10% of capital
2. **Growth per bet at `f = 0.10`**: `0.55 * ln(1.10) + 0.45 * ln(0.90)` = `0.55(0.09531) + 0.45(-0.10536)` = `0.05242 - 0.04741` = `0.00501`
3. **Over 100 bets** that compounds to `exp(0.501) = 1.65`, a 65% increase in capital

Now vary the fraction:

<table>
  <tbody>
    <tr>
      <td><strong>Fraction staked</strong></td>
      <td><strong>Growth per bet</strong></td>
      <td><strong>Share of optimum</strong></td>
      <td><strong>Capital after 100 bets</strong></td>
    </tr>
    <tr><td>5% (half Kelly)</td><td>0.00375</td><td>75%</td><td>1.46x</td></tr>
    <tr><td>10% (full Kelly)</td><td>0.00501</td><td>100%</td><td>1.65x</td></tr>
    <tr><td>15%</td><td>0.00374</td><td>75%</td><td>1.45x</td></tr>
    <tr><td>20% (double Kelly)</td><td>-0.00014</td><td>0%</td><td>0.99x</td></tr>
    <tr><td>25%</td><td>-0.00673</td><td>negative</td><td>0.51x</td></tr>
  </tbody>
</table>

At double the Kelly fraction, a genuine edge produces no growth at all. At two and a half times, it destroys half the capital over a hundred favourable bets.

**A continuous position.** An asset has `mu = 8%`, `sigma = 20%`, and `r = 2%`.

1. **Sharpe ratio**: `(0.08 - 0.02) / 0.20 = 0.30`
2. **Kelly fraction**: `0.06 / 0.04 = 1.50` — 150% of capital, or 1.5x leverage
3. **Excess growth at full Kelly**: `0.30^2 / 2 = 4.5%` per year above the risk-free rate
4. **Portfolio volatility at full Kelly**: `1.50 * 20% = 30%` per year

<table>
  <tbody>
    <tr>
      <td><strong>Kelly multiple</strong></td>
      <td><strong>Leverage</strong></td>
      <td><strong>Excess growth</strong></td>
      <td><strong>Volatility</strong></td>
    </tr>
    <tr><td>0.25x</td><td>0.38</td><td>1.97%</td><td>7.5%</td></tr>
    <tr><td>0.50x</td><td>0.75</td><td>3.38%</td><td>15.0%</td></tr>
    <tr><td>1.00x</td><td>1.50</td><td>4.50%</td><td>30.0%</td></tr>
    <tr><td>2.00x</td><td>3.00</td><td>0.00%</td><td>60.0%</td></tr>
  </tbody>
</table>

Half Kelly gives 75% of the growth at half the volatility. That trade — giving up a quarter of the theoretical growth to halve the risk and to buy a large margin for estimation error — is why fractional Kelly is the practical default.

> warning **A 30% annual volatility is what full Kelly asks for on a 0.3 Sharpe** Full Kelly is not a conservative prescription. It is the most aggressive sizing that still grows capital, and it assumes the inputs are known exactly.

---

#### Drawdown Under Kelly

Kelly maximises growth and says nothing about the path. Under the idealised assumptions — continuous rebalancing, constant parameters, a zero risk-free rate — the probability that wealth ever falls to a fraction `a` of its starting value while betting `c` times the Kelly fraction is `a^(2/c - 1)`.

<table>
  <tbody>
    <tr>
      <td><strong>Kelly multiple</strong></td>
      <td><strong>P(ever down 50%)</strong></td>
      <td><strong>P(ever down 80%)</strong></td>
    </tr>
    <tr><td>Full (c = 1)</td><td>50%</td><td>20%</td></tr>
    <tr><td>Half (c = 0.5)</td><td>12.5%</td><td>0.8%</td></tr>
    <tr><td>Quarter (c = 0.25)</td><td>0.8%</td><td>0.0013%</td></tr>
  </tbody>
</table>

Under full Kelly, halving your capital at some point is a coin flip. That is the honest cost of the maximum growth rate, and it is why the criterion is rarely applied at full strength by anyone who must report to someone else.

---

#### In Practice Across Asset Classes

- **Equities.** Applied to a portfolio rather than a single name, the multivariate Kelly solution is the mean-variance tangency portfolio scaled by the inverse of risk aversion — the two frameworks coincide under log utility. See [Mean-Variance](/quant-math/mean-variance).
- **Futures.** Volatility targeting is fractional Kelly with the edge held constant: if `mu - r` is assumed stable, `f* = (mu - r)/sigma^2` scales inversely with variance, which is exactly what a volatility-targeting rule does. See [Position Sizing](/quant-math/position-sizing).
- **FX.** Carry has an apparently high Sharpe and strongly negative skew. Kelly assumes log-normal-like behaviour, so it systematically oversizes strategies whose losses arrive in a single jump rather than as diffusion. See [FX Carry & Parity](/markets/fx-carry-parity).
- **Fixed income.** Leverage on a low-volatility carry position produces a very large nominal Kelly fraction. The binding constraint is almost never growth-optimality but repo capacity, haircuts, and the fact that funding is withdrawn precisely in the states where the position loses.
- **Credit.** The payoff is close to a short put: a small, steady premium and rare severe losses. Kelly derived from the mean and variance of a period without defaults is meaningless, because the loss distribution has not been sampled. See [Credit 101](/credit/credit-101).
- **Options.** Selling options has bounded upside and large downside, so the log-utility objective is extremely sensitive to the tail. The Kelly fraction for a short-option position is far smaller than the mean and variance alone suggest.
- **On-chain.** Basis and funding strategies present a small, apparently reliable edge that invites high leverage. Kelly's assumption of continuous rebalancing fails hardest here: liquidation is discrete and irreversible, so the true constraint is the liquidation threshold rather than the growth-optimal fraction. See [Leverage & Liquidation](/risk/leverage-liquidation).

---

#### Assumptions and Failure Modes

- **The edge is known exactly.** It is not. If `mu` is overestimated by a factor of two, so is `f*`, and double Kelly delivers zero growth. This single point justifies most of the practice of fractional Kelly.
- **Bets are independent and repeated.** Kelly is a long-run result over many independent opportunities. For a small number of correlated bets, or a single non-repeating one, the growth-rate argument does not apply.
- **The objective is asymptotic growth.** Kelly maximises terminal wealth over an unbounded horizon. If the horizon is finite, or if there is a level of loss after which you cannot continue, it is the wrong objective.
- **No external constraint intervenes.** Kelly assumes wealth can decline and recover freely, and that capital is divisible and rebalanced without cost. A margin call, redemption, or automated liquidation makes a decline permanent, invalidating the whole argument.
- **The variance is the whole of the risk.** The continuous Kelly formula uses only two moments. For fat-tailed or jump-prone returns it substantially oversizes. See [Jump Processes](/quant-math/jumps).
- **The path is ignored.** Kelly optimises the endpoint. If the drawdown along the way exceeds what an investor, allocator, or lender will accept, the endpoint is never reached. See [Drawdown](/quant-math/drawdown).

> info **Fractional Kelly is not a compromise, it is a correction** Betting a fraction of Kelly is the rational response to not knowing the edge — under parameter uncertainty, the growth-maximising fraction of the *estimated* Kelly is below one.

---

#### Code

```python
import numpy as np

def kelly_binary(win_probability, payout_ratio=1.0):
    """Kelly fraction for a discrete bet paying payout_ratio to 1.

    Returns 0 for a negative edge: no size is the correct size.
    """
    p, b = win_probability, payout_ratio
    return max((b * p - (1 - p)) / b, 0.0)


def kelly_continuous(expected_return, volatility, risk_free_rate=0.0):
    """Growth-optimal leverage for a continuously rebalanced position.

    Equals Sharpe / volatility, so it is highly sensitive to the mean estimate.
    """
    return (expected_return - risk_free_rate) / volatility**2


def growth_rate(fraction, expected_return, volatility, risk_free_rate=0.0):
    """Long-run growth at any fraction. Quadratic, so overbetting is punished twice."""
    f = np.asarray(fraction, dtype=float)
    excess = expected_return - risk_free_rate
    return risk_free_rate + f * excess - 0.5 * f**2 * volatility**2


def drawdown_probability(kelly_multiple, wealth_fraction):
    """P(wealth ever reaches wealth_fraction) under idealised Kelly betting."""
    return wealth_fraction ** (2.0 / kelly_multiple - 1.0)
```

---

#### See Also

* [Position Sizing](/quant-math/position-sizing)
* [Optimization](/quant-math/optimization)
* [Mean-Variance](/quant-math/mean-variance)
* [Drawdown](/quant-math/drawdown)
* [Sharpe Ratio](/quant-math/sharpe)
* [Leverage & Liquidation](/risk/leverage-liquidation)
* [Dynamic Sizing](/strategies/dynamic-sizing)

---
