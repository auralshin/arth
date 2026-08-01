### Walkthrough: LP on an AMM During Volatility

> info **Metadata** Level: Intermediate | Prerequisites: AMMs, Liquidity Pools, Impermanent Loss, Volatility | Tags: case-study, amm, impermanent-loss, liquidity-provision, fees

Providing liquidity to a constant-product automated market maker is a trade with two sides that are rarely measured together. The fee income is visible, quoted as an annual percentage, and easy to admire. The offsetting cost — **impermanent loss**, the shortfall of the pool position against simply holding the same tokens — is invisible until you withdraw.

This page computes both sides across a single volatile week, at the trough and at the end, and shows why the two are measured on completely different terms: fees accumulate along the path, while impermanent loss depends only on where the price finishes.

> info **A constructed example** The pool size, price path, and volume figures below are chosen to make the arithmetic checkable. This is not a report of a specific pool or market episode.

---

#### Setup: The Position

A constant-product pool holding a volatile token and a stable numeraire, obeying `x * y = k` where `x` is the token balance and `y` is the numeraire balance. The pool price is `P = y / x`.

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Token price at deposit</td><td>2,000</td></tr>
    <tr><td>Pool total value locked</td><td>10,000,000</td></tr>
    <tr><td>Fee tier</td><td>30 bps on every swap</td></tr>
    <tr><td>Our deposit</td><td>25 tokens and 50,000 numeraire, 100,000 in total</td></tr>
    <tr><td>Our share of the pool</td><td>1%</td></tr>
    <tr><td>Our constant</td><td>25 x 50,000 = 1,250,000</td></tr>
  </tbody>
</table>

Because the share is constant, our slice can be treated as a miniature pool with its own `k`. At any price `P`, arbitrage sets the reserves to:

```text
x(P) = sqrt(k / P)
y(P) = sqrt(k * P)
value(P) = x(P) * P + y(P) = 2 * sqrt(k * P)
```

The comparison position is holding the original 25 tokens and 50,000 numeraire, whose value is `25 * P + 50,000`.

---

#### What Happens: A Volatile Week

The token falls 37.5% over three days, then recovers most of the way. Total pool volume over the week is 60,000,000, six times the pool's value, of which 32,000,000 occurs by day 3.

<table>
  <tbody>
    <tr><td><strong>Day</strong></td><td><strong>Price</strong></td><td><strong>Pool tokens</strong></td><td><strong>Pool numeraire</strong></td><td><strong>Position value</strong></td><td><strong>Hold value</strong></td></tr>
    <tr><td>0</td><td>2,000</td><td>25.0000</td><td>50,000.00</td><td>100,000.00</td><td>100,000.00</td></tr>
    <tr><td>3</td><td>1,250</td><td>31.6228</td><td>39,528.47</td><td>79,056.94</td><td>81,250.00</td></tr>
    <tr><td>7</td><td>1,800</td><td>26.3523</td><td>47,434.16</td><td>94,868.33</td><td>95,000.00</td></tr>
  </tbody>
</table>

Note what the pool did on the way down: it bought the falling token. Reserves went from 25 tokens to 31.62. That is the mechanism of impermanent loss stated in inventory terms — the pool is always accumulating whichever asset is falling.

---

#### The Arithmetic

**Impermanent loss.** For a constant-product pool, with `p = P_end / P_start`, the ratio of position value to hold value depends only on `p`:

```text
IL(p) = 2 * sqrt(p) / (1 + p) - 1
```

For small moves this is very well approximated by `IL ~= -(ln p)^2 / 8`.

<table>
  <tbody>
    <tr><td><strong>Point</strong></td><td><strong>p</strong></td><td><strong>Exact IL</strong></td><td><strong>Approximation</strong></td><td><strong>Shortfall in currency</strong></td></tr>
    <tr><td>Day 3 trough</td><td>0.625</td><td>-2.699%</td><td>-2.761%</td><td>2,193.06</td></tr>
    <tr><td>Day 7 close</td><td>0.900</td><td>-0.1386%</td><td>-0.1388%</td><td>131.67</td></tr>
  </tbody>
</table>

The loss shrank by a factor of seventeen between day 3 and day 7, without a single trade being made. Impermanent loss is a *mark* against the hold benchmark, not a realised cost, and it only becomes real on withdrawal.

**Fees.** Fees accrue on volume, so they depend on the whole path:

```text
fee_income = volume * fee_rate * pool_share
day 3:  32,000,000 * 0.0030 * 0.01 =   960
day 7:  60,000,000 * 0.0030 * 0.01 = 1,800
```

**Putting the two together:**

<table>
  <tbody>
    <tr><td><strong>Measurement</strong></td><td><strong>Position + fees</strong></td><td><strong>Hold</strong></td><td><strong>Difference</strong></td></tr>
    <tr><td>Day 3</td><td>80,016.94</td><td>81,250.00</td><td>-1.52%</td></tr>
    <tr><td>Day 7</td><td>96,668.33</td><td>95,000.00</td><td>+1.76%</td></tr>
  </tbody>
</table>

Withdrawing at the trough locks in a 1.52% underperformance. Waiting four more days turns it into a 1.76% outperformance. Nothing about the position changed; only the price did.

> warning **Withdrawing during the drawdown converts a mark into a loss** The moment of maximum impermanent loss is the moment of maximum price dislocation, which is also when the temptation to exit is strongest.

**A reality check on the absolute return.** The position finished at 96,668.33 against a starting 100,000: a 3.33% loss. The hold benchmark lost 5.00%. Beating the benchmark and losing money are entirely compatible, and a fee yield quoted without the benchmark comparison tells you nothing.

---

#### What This Teaches: Fees Are Paid for Variance

The weekly fee income annualises alarmingly:

```text
fee_APR = (volume / TVL) * fee_rate * (365 / days)
        = 6 * 0.0030 * (365 / 7)
        = 93.9% per annum
```

That number is real for the week it describes and meaningless as a forecast, because the volume that generated it was itself produced by the volatility that generated the impermanent loss. The two are not independent revenue and cost lines; they are two consequences of the same thing.

The connection is exact enough to be useful. If the price follows a diffusion with volatility `sigma` over horizon `T`, then `E[(ln p)^2] ~= sigma^2 * T`, so:

```text
E[IL] ~= -sigma^2 * T / 8
```

At an 80% annualised volatility over seven days, `T = 7/365`, this expects `-0.153%` of impermanent loss for the week, against 1.8% of fee income. Liquidity provision is, structurally, a short variance position that is paid a fee premium. It is profitable when realised volatility comes in below what the fee stream implies, and unprofitable otherwise. See [Variance Swaps](/derivatives/variance-swaps) for the same trade written in derivative form.

---

#### How to Avoid or Manage It

- **Measure against the hold benchmark, always.** A position report that quotes fee APR without the corresponding impermanent loss is measuring one leg of a two-leg trade.
- **Compare realised volatility to the fee stream.** Fee income per unit of time divided by `sigma^2 / 8` gives the volatility level at which the position breaks even. That is a cleaner decision variable than an APR.
- **Do not size the position on a volatile week's volume.** The APR that appears during an episode is generated by the same event that generates the loss, and it decays with the volatility.
- **Choose the exit deliberately.** Withdrawing when the price has moved far from the deposit level realises the maximum shortfall. If the pair is expected to mean-revert, so does the loss.
- **Consider hedging the delta if the pair is directional.** The pool position is short gamma and long the falling asset by construction; see [Hedging LP](/strategies/hedging-lp) and [Delta-Hedged LP](/strategies/delta-hedged-lp).

---

#### Assumptions and Failure Modes

- **Fees are assumed to be earned in proportion to a constant pool share.** Other liquidity providers entering during a high-volume episode dilute the share, so realised fees are typically below the constant-share calculation.
- **Volume is assumed exogenous.** Much of it is arbitrage that exists only to correct the pool price, and that flow is precisely the flow that imposes the loss. Treating it as independent revenue double-counts.
- **The price path is assumed to pass through the quoted levels only.** Fee income depends on the full path, so two paths with identical endpoints can produce very different income and identical impermanent loss.
- **Gas and deposit costs are excluded.** For a 100,000 position over one week they are small; for a smaller position, or one rebalanced frequently, they can exceed the fee income entirely.
- **The diffusion approximation for expected impermanent loss ignores jumps.** A gap move produces the same endpoint loss with none of the intervening fee income, which is the worst case for the position.
- **A pool token can go to zero.** Impermanent loss is bounded at 100% only because the position is bounded by the value of its assets. Constant-product mechanics offer no protection against a failed asset, only a guarantee of holding more of it.

---

#### See Also

* [Impermanent Loss](/building-blocks/impermanent-loss)
* [The LP Business](/strategies/lp-business)
* [AMMs 101](/building-blocks/amms-101)
* [Simulating LP Returns](/simulation/lp-returns)
* [Volatility](/quant-math/volatility)
* [Concentrated Liquidity: A Worked Example](/case-studies/uniswap-v3-lp)

---
