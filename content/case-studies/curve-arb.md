### Stablecoin Pool Arbitrage: A Worked Example

> info **Metadata** Level: Advanced | Prerequisites: AMMs, Stablecoins, Slippage | Tags: case-study, stableswap, arbitrage, amm, invariant, gas

A stableswap pool holds two assets that are supposed to be worth the same and prices them with an invariant that is nearly flat near the balance point and steepens sharply away from it. That shape is what makes stable pools useful: they quote enormous depth at parity and still refuse to be drained when one side breaks.

For an arbitrageur, the flatness is the whole opportunity and the whole difficulty. A small external dislocation supports a very large trade, because the pool barely moves. That same flatness means the profit per unit traded is tiny, so the trade only clears its costs at size, and the optimal size is a specific number that must be computed rather than guessed.

> info **A constructed example** The pool balances, amplification parameter, external price, and gas cost below are chosen to make the arithmetic checkable. This is not a report of a specific pool, asset, or event.

---

#### Setup: The Pool and the Dislocation

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Pool assets</td><td>Two stablecoins, call them A and B</td></tr>
    <tr><td>Balances</td><td>5,000,000 of A and 5,000,000 of B</td></tr>
    <tr><td>Amplification A</td><td>100</td></tr>
    <tr><td>Invariant D</td><td>10,000,000</td></tr>
    <tr><td>Pool swap fee</td><td>4 bps</td></tr>
    <tr><td>Pool price of A at balance</td><td>1.0000 B per A</td></tr>
    <tr><td>External price of A</td><td>0.9970 B per A</td></tr>
    <tr><td>Gas cost of one transaction</td><td>25, expressed in B</td></tr>
  </tbody>
</table>

Asset A is trading 30 bps below parity on an external venue while the pool still quotes it at parity. The arbitrage is to buy A externally at 0.9970 and sell it into the pool.

---

#### The Arithmetic: The Invariant

For a two-asset stableswap with balances `x` and `y`, amplification coefficient `A`, and `Ann = A * n^n = 400` when `n = 2`, the invariant is:

```text
Ann * (x + y) + D = Ann * D + D^3 / (4 * x * y)
```

where:

- `x` and `y` are the pool balances of the two assets
- `D` is the invariant, equal to the total balance if the pool were perfectly balanced
- `Ann` controls how flat the curve is; larger values mean flatter near parity

Confirm it at the balance point with `x = y = 5,000,000` and `D = 10,000,000`:

```text
left  = 400 * 10,000,000 + 10,000,000 = 4,010,000,000
right = 400 * 10,000,000 + 1e21 / (4 * 25e12) = 4,000,000,000 + 10,000,000
```

Both sides equal 4,010,000,000, so the invariant holds. To price a trade, solve the invariant for `y` given a new `x`:

```text
y^2 + y * (x + D / Ann - D) = D^3 / (4 * Ann * x)
```

and take the positive root. The marginal price of A in units of B follows from the partial derivatives:

```text
price(x) = (Ann + D^3 / (4 * x^2 * y)) / (Ann + D^3 / (4 * x * y^2))
```

At balance both numerator and denominator equal 402, so the price is exactly 1.0000.

---

#### What Happens: Sizing the Trade

Arbitrage is profitable while the pool's marginal price, net of the 4 bps fee, exceeds the external price of 0.9970. Selling A into the pool pushes `x` up and the marginal price down, so the optimal size is the point where the two meet:

```text
price(5,000,000 + dx) * (1 - 0.0004) = 0.9970
```

Solving numerically gives `dx = 1,171,316`. The pool pays out `1,169,406` of B after the fee. The full trade:

<table>
  <tbody>
    <tr><td><strong>Line</strong></td><td><strong>Calculation</strong></td><td><strong>Amount</strong></td></tr>
    <tr><td>Buy A externally</td><td>1,171,316 x 0.9970</td><td>-1,167,802</td></tr>
    <tr><td>Sell A into the pool, net of the 4 bps fee</td><td>—</td><td>+1,169,406</td></tr>
    <tr><td>Gross profit</td><td>—</td><td>1,604</td></tr>
    <tr><td>Gas</td><td>—</td><td>-25</td></tr>
    <tr><td><strong>Net profit</strong></td><td>—</td><td><strong>1,579</strong></td></tr>
  </tbody>
</table>

That is 13.5 bps on 1,171,316 of notional. The average execution price inside the pool was 0.99837, against a starting marginal price of 1.0000 and an ending marginal price of 0.99740. After the trade the pool holds 6,171,316 of A and 3,830,594 of B, the latter including the 468 of fee retained for liquidity providers.

**The size is not optional.** Trading a quarter of the optimal size earns 651. Trading twice it *loses* 879, because the marginal price has already fallen through the external price and the last units are sold below cost.

<table>
  <tbody>
    <tr><td><strong>Fraction of optimal size</strong></td><td><strong>Size</strong></td><td><strong>Net profit</strong></td></tr>
    <tr><td>0.25</td><td>292,829</td><td>651</td></tr>
    <tr><td>0.50</td><td>585,658</td><td>1,152</td></tr>
    <tr><td>1.00</td><td>1,171,316</td><td>1,579</td></tr>
    <tr><td>1.50</td><td>1,756,974</td><td>1,053</td></tr>
    <tr><td>2.00</td><td>2,342,631</td><td>-879</td></tr>
  </tbody>
</table>

---

#### What This Teaches: The Curve Shape Is the Product

Run the same calculation at several external prices and the non-linearity is stark:

<table>
  <tbody>
    <tr><td><strong>External price</strong></td><td><strong>Optimal size</strong></td><td><strong>Net profit</strong></td><td><strong>Profit in bps</strong></td><td><strong>Pool after</strong></td></tr>
    <tr><td>0.9990</td><td>299,615</td><td>65</td><td>2.18</td><td>5.30m / 4.70m</td></tr>
    <tr><td>0.9980</td><td>768,123</td><td>604</td><td>7.86</td><td>5.77m / 4.23m</td></tr>
    <tr><td>0.9970</td><td>1,171,316</td><td>1,579</td><td>13.48</td><td>6.17m / 3.83m</td></tr>
    <tr><td>0.9950</td><td>1,777,426</td><td>4,568</td><td>25.70</td><td>6.78m / 3.23m</td></tr>
    <tr><td>0.9900</td><td>2,606,869</td><td>15,803</td><td>60.62</td><td>7.61m / 2.40m</td></tr>
  </tbody>
</table>

A 10 bps dislocation absorbs 300,000. A 100 bps dislocation absorbs 2.6 million and leaves the pool at a three-to-one imbalance. Depth is not a constant of the pool; it is a function of how far from parity the pool already sits.

**Compare a constant-product pool** with the same 5,000,000 and 5,000,000 reserves. Its marginal price falls quadratically with the trade, so the same 30 bps dislocation supports an optimal trade of only about 6,500, generating a few units of gross profit — less than the 25 of gas. The stableswap pool supports a trade 180 times larger at the same dislocation. That single comparison is the reason stable pairs are not quoted on constant-product curves.

> info **Gas sets a floor on the dislocation that is worth trading** With 25 of gas and this pool, the smallest profitable dislocation is a few basis points. On a chain where the same transaction costs 500, dislocations of 10 bps are simply not arbitrable, and the peg is looser as a result.

---

#### How to Avoid or Manage It

For anyone running the trade rather than reading about it:

- **Solve for the optimal size, do not guess it.** The profit function is concave with a single maximum and turns negative well before twice the optimum. A fixed trade size is wrong at every dislocation except one.
- **Simulate against the live invariant, not against the last known one.** `D` changes as fees accrue and as the pool is rebalanced by other flow. A stale `D` produces a size that overshoots.
- **Treat gas as a real, sunk cost.** A reverted transaction still pays gas. Expected profit must exceed gas divided by the probability of inclusion, not just gas.
- **Assume the opportunity is contested.** Public, mechanical, profitable trades are the definition of what searchers compete for. See [MEV Overview](/building-blocks/mev-overview) and [Slippage and Front-Running](/risk/slippage-frontrunning).
- **Distinguish a dislocation from a repricing.** A pool trading below parity because the asset is impaired is not an arbitrage; it is the market being right and the pool being slow. Buying A at 0.9970 is only profitable if A is still worth 1.0000.

---

#### Assumptions and Failure Modes

- **The external price is assumed executable at size.** Buying 1,171,316 of A externally at exactly 0.9970 assumes depth that may not exist. Any slippage on that leg comes directly out of the 1,604 of gross profit.
- **Both legs are assumed to settle together.** If the external purchase and the pool sale are not atomic, the arbitrageur carries inventory risk between them, and a dislocation that closes in that window turns the profit into a loss.
- **The amplification coefficient is assumed fixed.** Governance can and does change `A`, sometimes gradually over a ramp. Pricing against the wrong `A` misprices the whole curve.
- **The pool is assumed to be exactly two assets.** Multi-asset pools and pools holding yield-bearing wrappers require the balances to be scaled by their exchange rates first, and using raw balances misprices the trade badly.
- **The fee is assumed to be charged on the output.** Implementations differ in whether the fee is taken from input or output and whether an admin share is split off. The direction of the fee changes the optimal size.
- **A depeg is assumed to be temporary.** If the asset does not return to parity, the arbitrageur has bought a falling asset with extra steps, and the pool's flat region has ensured they bought a great deal of it.

---

#### See Also

* [AMM Depth](/protocols/amms-depth)
* [Stablecoins](/building-blocks/stablecoins)
* [Stablecoin Designs](/protocols/stablecoin-designs)
* [Slippage](/microstructure/slippage)
* [MEV Overview](/building-blocks/mev-overview)
* [Flash Loans: Mechanics and Attack Patterns](/case-studies/flash-loan)

---
