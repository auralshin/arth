### Payoffs & Put-Call Parity

> info **Metadata** Level: Intermediate | Prerequisites: Options 101, Present value | Tags: derivatives, options, parity, payoffs, arbitrage, synthetics

Put-call parity is the tightest relationship in derivatives. It says that a call and a put with the same strike and expiry are not two independent instruments — given one, the underlying, and a bond, the other is determined exactly. No model, no volatility estimate, no distributional assumption is required. If parity is violated, there is a riskless profit available, and the only question is whether the transaction costs eat it.

That makes parity the natural first stop after learning what a call and a put are. It turns the option chain from a list of prices into an algebraic system, it explains why every position on a desk can be decomposed into a handful of building blocks, and it gives the first concrete example of the replication argument that all of derivatives pricing rests on.

---

#### Formal Definition

For European options on a non-dividend-paying asset, with the same strike `K` and expiry `T`:

```text
C - P = S - K * exp(-r * T)
```

where:

- `C` is the price of the European call
- `P` is the price of the European put
- `S` is the current price of the underlying
- `r` is the continuously compounded risk-free rate to `T`
- `K * exp(-r * T)` is the present value of the strike

With a continuous dividend yield `q`, the underlying leg is discounted for the income you forgo by not owning it:

```text
C - P = S * exp(-q * T) - K * exp(-r * T)
```

Equivalently, in forward terms with `F = S * exp((r - q) * T)`:

```text
C - P = exp(-r * T) * (F - K)
```

The forward version is the one to remember. It says that the call minus the put is a **forward struck at K**, discounted. Everything else is bookkeeping about carry.

---

#### The No-Arbitrage Argument

The proof is a two-portfolio comparison. Build:

- **Portfolio A**: long one call, plus cash of `K * exp(-r * T)` invested at the risk-free rate.
- **Portfolio B**: long one put, plus one unit of the underlying.

At expiry, the cash in A has grown to exactly `K`. Consider the two possible states:

<table>
  <tbody>
    <tr><td><strong>State at expiry</strong></td><td><strong>Portfolio A: call + cash</strong></td><td><strong>Portfolio B: put + stock</strong></td></tr>
    <tr><td>S_T above K</td><td>(S_T - K) + K = S_T</td><td>0 + S_T = S_T</td></tr>
    <tr><td>S_T at or below K</td><td>0 + K = K</td><td>(K - S_T) + S_T = K</td></tr>
  </tbody>
</table>

The two portfolios pay identically in every state. Neither has any intermediate cash flow, and neither can be exercised early because both options are European. Two portfolios with identical payoffs in every state must cost the same today, or one can be bought and the other sold for a certain profit. Hence `C + K * exp(-r * T) = P + S`, which rearranges to the parity relation.

Note what the argument does **not** use: no probability distribution, no volatility, no assumption about how `S` moves. This is the [law of one price](/derivatives/no-arbitrage-replication) applied to two static portfolios.

---

#### Worked Example

Take `S = 100`, `K = 100`, `T = 1` year, `r = 4%` continuously compounded, no dividends.

1. **Present value of the strike**: `100 * exp(-0.04) = 96.0789`
2. **Parity therefore requires**: `C - P = 100 - 96.0789 = 3.9211`
3. **Suppose the market quotes** `C = 8.00` and `P = 3.50`. Then `C - P = 4.50`
4. **The discrepancy** is `4.50 - 3.9211 = 0.5789` — the call is too rich relative to the put

The arbitrage (a **conversion**) is: sell the call, buy the put, buy the stock, and fund the stock by borrowing the present value of the strike.

<table>
  <tbody>
    <tr><td><strong>Leg</strong></td><td><strong>Cash flow today</strong></td><td><strong>Value at expiry</strong></td></tr>
    <tr><td>Sell 1 call</td><td>+8.0000</td><td>-max(S_T - 100, 0)</td></tr>
    <tr><td>Buy 1 put</td><td>-3.5000</td><td>+max(100 - S_T, 0)</td></tr>
    <tr><td>Buy 1 unit of stock</td><td>-100.0000</td><td>+S_T</td></tr>
    <tr><td>Borrow 96.0789 at 4%</td><td>+96.0789</td><td>-100.0000</td></tr>
    <tr><td><strong>Net</strong></td><td><strong>+0.5789</strong></td><td><strong>0.0000</strong></td></tr>
  </tbody>
</table>

Check the expiry column. The stock plus put minus call is worth exactly `K = 100` in every state, by the table in the previous section, and the loan repayment is `96.0789 * exp(0.04) = 100.00`. They cancel. You keep 0.5789 today with no residual exposure — or, left on deposit, `0.5789 * exp(0.04) = 0.6026` at expiry.

If instead the put were too rich, you would run the mirror trade (a **reversal**): buy the call, sell the put, short the stock, and lend the proceeds.

> warning **The arbitrage is only as clean as the borrow** The reversal requires shorting the underlying. If the stock is hard to borrow, the borrow fee behaves exactly like an extra dividend yield and shifts the parity line. Persistent apparent parity violations in single-stock options are usually borrow costs, not free money. See [Short Selling](/markets/short-selling).

---

#### Synthetic Positions

Rearranging parity gives every position in terms of the other three. Each of these is an identity, not an approximation.

<table>
  <tbody>
    <tr><td><strong>Synthetic position</strong></td><td><strong>Constructed from</strong></td></tr>
    <tr><td>Long stock</td><td>Long call + short put + lend K * exp(-r * T)</td></tr>
    <tr><td>Long call</td><td>Long stock + long put + borrow K * exp(-r * T)</td></tr>
    <tr><td>Long put</td><td>Long call + short stock + lend K * exp(-r * T)</td></tr>
    <tr><td>Long forward at K</td><td>Long call + short put (same strike and expiry)</td></tr>
    <tr><td>Covered call (stock + short call)</td><td>Short put + lend K * exp(-r * T)</td></tr>
    <tr><td>Protective put (stock + long put)</td><td>Long call + lend K * exp(-r * T)</td></tr>
  </tbody>
</table>

Two consequences worth internalising:

- **A covered call is a short put.** The risk profile of writing calls against stock you own is identical to selling a naked put at the same strike. They are the same trade with different collateral optics.
- **The risk reversal is a forward.** Long call, short put, same strike, is a synthetic forward. This is why the call-put price difference at each strike traces out the forward curve and is used to imply forwards and borrow rates from listed option markets.

---

#### Reading Payoff Structures Without a Diagram

A payoff diagram is a piecewise-linear function of `S_T`. It is fully described by its kink points (the strikes) and the slope in each region. Describing structures this way is faster than drawing them and generalises to any combination.

<table>
  <tbody>
    <tr><td><strong>Structure</strong></td><td><strong>Slope below lower strike</strong></td><td><strong>Slope between</strong></td><td><strong>Slope above upper strike</strong></td></tr>
    <tr><td>Long call, K</td><td>0</td><td>—</td><td>+1</td></tr>
    <tr><td>Long put, K</td><td>-1</td><td>—</td><td>0</td></tr>
    <tr><td>Call spread, long K1 short K2</td><td>0</td><td>+1</td><td>0</td></tr>
    <tr><td>Straddle, long call and put at K</td><td>-1</td><td>—</td><td>+1</td></tr>
    <tr><td>Strangle, long put K1 and call K2</td><td>-1</td><td>0</td><td>+1</td></tr>
    <tr><td>Butterfly, long K1, short 2 x K2, long K3</td><td>0</td><td>+1 then -1</td><td>0</td></tr>
    <tr><td>Risk reversal, long call K2 short put K1</td><td>-1</td><td>0</td><td>+1</td></tr>
  </tbody>
</table>

The maximum payoff of a butterfly with equally spaced strikes is the strike spacing: long the 90, short two 100s, long the 110 pays at most 10, attained at `S_T = 100`. Because that payoff is never negative, the butterfly must cost something non-negative today — a constraint used directly in [The Volatility Surface](/derivatives/vol-surface).

---

#### In Practice Across Asset Classes

**Equities.** Parity holds well for index options, where borrow is cheap and dividends are forecastable. For single stocks it is routinely used in reverse: given `C`, `P`, and `S`, solve for the implied dividend plus borrow cost. That implied number, not a dividend forecast, is what desks trade.

**Options on futures.** When both the option and its underlying future are margined the same way, parity simplifies to `C - P = F - K` with no discounting at all, because there is no financing on a futures position. Getting this wrong by discounting twice is a classic error. See [Futures 101](/markets/futures-101).

**FX.** Parity becomes `C - P = exp(-r_f * T) * S - exp(-r_d * T) * K`, with foreign and domestic rates in the two legs. This is covered interest parity wearing an option's clothing; see [FX Carry & Parity](/markets/fx-carry-parity).

**Rates.** The swaption analogue is payer minus receiver equals a forward-starting swap. Cap minus floor at the same strike equals a swap. The annuity factor replaces the discount factor, but the structure is identical.

**American options.** Exact parity fails. The relation weakens to an inequality: `S - K` is at most `C_am - P_am`, which is at most `S - K * exp(-r * T)` for a non-dividend-paying underlying. The width of that band is the early exercise premium.

**On-chain.** [Perpetual futures](/building-blocks/perpetual-futures) have no expiry, so the parity relation has no fixed `T` to discount over; the funding rate plays the role of carry instead. On protocols that list both options and perps, the synthetic forward implied by the option pair and the perp price should agree up to funding — a discrepancy is either an arbitrage or a statement about collateral costs. See [Basis](/signals/basis).

---

#### Assumptions and Failure Modes

- **European exercise.** The whole argument requires that neither portfolio can be unwound early. Introduce American exercise and parity becomes a two-sided bound.
- **Frictionless shorting.** The reversal needs a short in the underlying at zero cost. Real borrow fees, recall risk, and short-sale restrictions shift the relation and can make apparent violations unexploitable.
- **A single unambiguous discount rate.** In practice, funding differs by counterparty and by collateral currency. Post-2008, discounting depends on the collateral agreement, so "the" risk-free rate in the formula is really the rate on the specific collateral posted.
- **Known dividends.** For single stocks, dividends over the option's life are forecasts. Parity holds exactly only if the market agrees on those forecasts, which it often does not.
- **Simultaneous execution.** The arbitrage requires all four legs at the quoted prices. Legging in exposes you to price moves between fills, and the edge in the example above (0.58 on a 100 underlying) is smaller than the round-trip spread on many option chains.
- **The underlying must be the same.** Options settling against a special opening quotation and a stock marked at the close reference different prices. That mismatch alone can exceed the parity edge.

> info **Use parity as a data check** Before running any option analysis, compute `C - P + K * exp(-r * T)` at every strike and compare against spot. Strikes where this drifts are usually stale quotes rather than real signal — a cheap and effective filter on option data. See [Data Cleaning](/data-tooling/cleaning).

---

#### Code

```python
import math


def parity_gap(call, put, spot, strike, rate, years, div_yield=0.0):
    """Signed deviation from European put-call parity.

    Positive means the call is rich relative to the put. Use this on an
    option chain to flag stale quotes before fitting anything.
    """
    theoretical = spot * math.exp(-div_yield * years) - strike * math.exp(-rate * years)
    return (call - put) - theoretical


def implied_forward(call, put, strike, rate, years):
    """Forward price implied by a single call-put pair.

    Averaging this across near-the-money strikes is how desks back out
    dividends and borrow costs from listed options.
    """
    return strike + (call - put) * math.exp(rate * years)
```

---

#### See Also

* [Options 101](/derivatives/options-101)
* [No-Arbitrage & Replication](/derivatives/no-arbitrage-replication)
* [The Volatility Surface](/derivatives/vol-surface)
* [Binomial Trees](/derivatives/binomial-trees)
* [FX Carry & Parity](/markets/fx-carry-parity)
* [Cash & Carry](/strategies/cash-carry)

---
