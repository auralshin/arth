### Exotic Options

> info **Metadata** Level: Advanced | Prerequisites: Options 101, Black-Scholes, Delta hedging | Tags: derivatives, exotics, barriers, digitals, asians, lookbacks, path-dependence

An exotic option is any option whose payoff is not simply `max(S_T - K, 0)` or its put equivalent. The label covers a wide range, but the useful distinction is narrow: does the payoff depend only on the price at expiry, or on the whole path the price took to get there? Digitals are path-independent and merely have a discontinuous payoff. Barriers, Asians, and lookbacks are path-dependent, and that changes everything about how they are priced and hedged.

Path dependence matters because a hedging portfolio must track a quantity that has a memory. A vanilla option's delta depends on where the price is now; a lookback's delta depends on where the price has been. When the payoff has a discontinuity as well — as barriers and digitals do — the hedge ratio can become unbounded near a specific price, and the model that produced it stops being a reliable guide precisely where the risk is concentrated.

---

#### Formal Definition

Write `S_t` for the price path and `M = max(S_t)`, `m = min(S_t)` over the monitoring dates.

```text
Digital (cash-or-nothing) call:  Q * 1{S_T > K}
Digital (asset-or-nothing) call: S_T * 1{S_T > K}

Asian (average price) call:      max( average(S_t) - K , 0 )
Asian (average strike) call:     max( S_T - average(S_t) , 0 )

Lookback, fixed strike, call:    max( M - K , 0 )
Lookback, floating strike, call: S_T - m

Up-and-out call:                 max(S_T - K, 0) * 1{ M below H }
Up-and-in call:                  max(S_T - K, 0) * 1{ M at or above H }
```

where:

- `Q` is the fixed cash amount a digital pays, and `1{...}` is 1 if the condition holds and 0 otherwise
- `H` is the **barrier** level, and monitoring may be continuous or on discrete fixing dates
- `average(S_t)` is over a specified set of fixing dates, arithmetic unless stated otherwise
- barrier options often carry a **rebate**: a fixed amount paid if the option knocks out

The fundamental relation for barriers, **in-out parity**, follows from the fact that exactly one of the two contracts survives every path:

```text
knock-in + knock-out = vanilla
```

with the same strike, expiry, and barrier, and no rebate.

---

#### Worked Example: One Path, Many Payoffs

Take a single realised path with five daily fixings, starting from `S_0 = 100`:

<table>
  <tbody>
    <tr><td><strong>Fixing</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td><strong>Price</strong></td><td>97.0</td><td>103.5</td><td>101.2</td><td>104.0</td><td>102.0</td></tr>
  </tbody>
</table>

The five fixings sum to `507.7`, so the arithmetic average is `507.7 / 5 = 101.54`. The path maximum is `104.0`, the minimum `97.0`, and the terminal price `102.0`. Now evaluate a set of contracts, all struck at `K = 100`:

<table>
  <tbody>
    <tr><td><strong>Contract</strong></td><td><strong>Calculation</strong></td><td><strong>Payoff</strong></td></tr>
    <tr><td>Vanilla call</td><td>max(102.0 - 100, 0)</td><td>2.00</td></tr>
    <tr><td>Digital call, pays 1</td><td>terminal price above 100</td><td>1.00</td></tr>
    <tr><td>Asian average-price call</td><td>max(101.54 - 100, 0)</td><td>1.54</td></tr>
    <tr><td>Lookback, fixed strike</td><td>max(104.0 - 100, 0)</td><td>4.00</td></tr>
    <tr><td>Lookback, floating strike</td><td>102.0 - 97.0</td><td>5.00</td></tr>
    <tr><td>Up-and-out call, H = 104</td><td>barrier touched at fixing 4</td><td>0.00</td></tr>
    <tr><td>Up-and-in call, H = 104</td><td>barrier touched; vanilla payoff applies</td><td>2.00</td></tr>
    <tr><td>Down-and-in put, H = 98</td><td>barrier touched at fixing 1, but max(100 - 102, 0) = 0</td><td>0.00</td></tr>
  </tbody>
</table>

Four observations that generalise:

1. **The Asian pays less than the vanilla here**, and will on average, because averaging reduces the variance of the reference price. Asian options are systematically cheaper than their vanilla equivalents.
2. **Both lookbacks pay more than the vanilla.** They are the most expensive structures in the table, because they extract the best point of the path rather than the last one.
3. **In-out parity holds**: up-and-out `0.00` plus up-and-in `2.00` equals the vanilla `2.00`.
4. **A knock-in that knocks in can still expire worthless.** The down-and-in put activated at the first fixing and then finished out of the money. Knocking in confers the vanilla payoff, not a payment.

Note also that the up-and-out call was destroyed by a single fixing at 104.0, one tick above the barrier, on a path that finished comfortably in the money. That cliff is the defining risk of a barrier option.

---

#### Worked Example: Pricing a Barrier on a Tree

Barriers price naturally on a lattice, because the knock-out condition is a rule applied node by node. Reuse the two-step tree from [Binomial Trees](/derivatives/binomial-trees): `S = 100`, `u = 1.1`, `d = 0.9`, per-period gross rate `R = 1.02`, risk-neutral probability `p = 0.6`. Nodes are `110, 90` at step 1 and `121, 99, 81` at step 2. Price a call struck at `K = 95` with an up-and-out barrier at `H = 115`, monitored at the nodes.

**Vanilla first.** Terminal payoffs `26, 4, 0`.

1. Node 110: `(0.6 * 26 + 0.4 * 4) / 1.02 = 17.20 / 1.02 = 16.8627`
2. Node 90: `(0.6 * 4 + 0.4 * 0) / 1.02 = 2.40 / 1.02 = 2.3529`
3. Root: `(0.6 * 16.8627 + 0.4 * 2.3529) / 1.02 = 11.0588 / 1.02 = 10.8420`

**Up-and-out.** The only node at or above 115 is the terminal node at 121, so its payoff becomes 0.

1. Node 110: `(0.6 * 0 + 0.4 * 4) / 1.02 = 1.60 / 1.02 = 1.5686`
2. Node 90: unchanged at `2.3529` (no path from here reaches 115)
3. Root: `(0.6 * 1.5686 + 0.4 * 2.3529) / 1.02 = 1.8824 / 1.02 = 1.8454`

**Up-and-in by parity**: `10.8420 - 1.8454 = 8.9965`. Direct check — only the up-up path knocks in, and it pays 26: `0.36 * 26 / 1.0404 = 9.36 / 1.0404 = 8.9965`. The two agree exactly.

The knock-out is worth only 17% of the vanilla, because the most valuable outcome is precisely the one that destroys it. This inverse relationship is why up-and-out calls and down-and-out puts are cheap and why they are sold to clients who want a discount and believe the barrier will not be hit.

---

#### Digitals and Call-Spread Replication

A digital's payoff is a step function, which no finite portfolio of vanillas reproduces exactly. The standard approach is a tight call spread:

```text
Digital(K)  ~=  ( C(K - e) - C(K + e) ) / (2 * e)
```

For `S = 100`, `K = 100`, `r = 0`, `sigma = 20%`, `T = 1`, the exact digital value is `exp(-r*T) * N(d2) = N(-0.10) = 0.46017`.

<table>
  <tbody>
    <tr><td><strong>Spread width 2e</strong></td><td><strong>Replication value</strong></td><td><strong>Error</strong></td></tr>
    <tr><td>1 (99.5 / 100.5)</td><td>0.46018</td><td>+0.00001</td></tr>
    <tr><td>2 (99 / 101)</td><td>0.46022</td><td>+0.00005</td></tr>
    <tr><td>10 (95 / 105)</td><td>0.46139</td><td>+0.00122</td></tr>
  </tbody>
</table>

Two things to notice. The replication converges as the spread tightens, and here it **over-**estimates, because the call price is convex in strike and the centred difference picks up that curvature. But a centred spread is an approximation, not a bound: between `K` and `K + e` it pays less than the digital does. The genuine super-replication is the one-sided spread `( C(K - w) - C(K) ) / w`, which pays at least the digital on every path and therefore must cost at least as much. That is how digitals are actually risk-managed — a desk short a digital hedges with a spread whose upper strike sits at or below the digital strike, and prices in the gap as a charge for the discontinuity.

Note also that the digital's value is `0.46`, not `0.50`, even though the option is at the money. Under lognormal dynamics the median terminal price is below the forward, so the probability of finishing above the strike is under one half. Reading a digital price as a market-implied probability requires this correction.

> warning **Digital and barrier deltas can exceed any bound** As expiry approaches, a digital struck at the money has a delta that grows without limit — the payoff flips from 0 to `Q` over an arbitrarily small price change. No amount of rebalancing hedges this. The practical response is to widen the replicating spread and accept a known pricing gap rather than chase an unbounded hedge.

---

#### Why Path Dependence Complicates Hedging

- **The state space grows.** A vanilla's value depends on `(S, t)`. An Asian's depends on `(S, t, running average)`; a lookback's on `(S, t, running extreme)`. Pricing needs an extra dimension in the grid, and the Greeks acquire sensitivities to the running quantity that have no vanilla analogue.
- **Greeks become discontinuous, and the resulting flow is self-reinforcing.** A barrier option's delta and gamma flip sign as spot crosses the barrier, so a desk short a knock-out must trade a large amount of the underlying in one instant, in the same direction as everyone else short the same barrier. That is why barriers cluster at round numbers and why price behaviour near them is not well described by a diffusion.
- **Discrete monitoring is not continuous monitoring.** A daily-monitored barrier is strictly less likely to knock out than a continuously monitored one at the same level. Pricing a discretely monitored barrier with a continuous formula overstates the knock-out probability; the standard correction shifts the barrier away from spot by an amount proportional to `sigma * sqrt(dt)`.
- **Model risk is first-order, not second.** Two models calibrated to the same vanilla surface can price a barrier or a cliquet very differently, because those payoffs depend on the dynamics of volatility, which the vanilla surface does not pin down. Vanillas constrain the terminal distribution; exotics depend on the process.
- **Static hedges are worth searching for.** Some barriers admit an exact or near-exact static hedge in vanillas under symmetry assumptions on the dynamics. Where such a hedge exists it is far more robust than dynamic hedging, because it does not need rebalancing at the worst possible moment.

---

#### In Practice Across Asset Classes

**Equities.** Autocallables — barrier-contingent notes with early redemption — dominate retail structured product issuance in several regions. Dealer books accumulate enormous short-barrier positions concentrated at the same levels and tenors, and the resulting hedging flow is a recognised feature of index behaviour near those levels.

**FX.** The natural home of barrier options. One-touch, double-no-touch, and knock-in forwards are standard corporate hedging and speculative instruments, and the market quotes them directly. Barriers at psychologically round levels are a documented feature of FX price action. See [FX 101](/markets/fx-101).

**Commodities.** Asian options are the default rather than the exception, because commercial exposure is to an average price over a delivery month, not to a single settlement print. An airline hedging fuel wants the monthly average, so an Asian is the natural instrument and is also cheaper. See [Commodities](/markets/commodities).

**Rates and credit.** Bermudan swaptions and callable structures are the dominant rates exotic; their value comes from an optimal exercise decision across many dates, making them the most model-dependent products in mainstream finance. Credit tranches are exotic in correlation rather than in path — the payoff depends on the joint default distribution, and that model dependence proved catastrophic when correlation assumptions calibrated in benign conditions failed simultaneously in 2007-2008.

**On-chain.** Liquidation mechanisms are structurally barrier options: cross a price level and a position is forcibly closed, with a discontinuous payoff and hedging flow that intensifies near the level. Modelling them as barriers is more informative than modelling them as linear positions; see [Liquidations](/building-blocks/liquidations) and [Leverage & Liquidation](/risk/leverage-liquidation). A concentrated liquidity range behaves like a knock-out too: the position stops accruing fees once price leaves the range. Barrier levels sourced from an [oracle](/building-blocks/oracles) rather than a traded price add a manipulation vector that listed barrier markets do not face; see [Oracle Manipulation](/risk/oracle-manipulation).

---

#### Assumptions and Failure Modes

- **The vanilla surface does not determine exotic prices.** Calibration to vanillas is necessary and not sufficient. Any exotic price carries an unhedgeable model component that should be reserved against.
- **Monitoring conventions are part of the contract.** Continuous versus daily versus closing-price-only monitoring produce materially different values at the same barrier. The term sheet, not the model default, governs.
- **Fixing sources can be manipulated.** Asian and barrier payoffs depend on specific published prices at specific times. Where those prints are thin, the incentive to influence them is real and has produced enforcement actions in several markets.
- **Discontinuous payoffs break the Greeks.** Delta and gamma near a barrier or digital strike are not usable risk numbers. Desks manage these with scenario grids across spot and time rather than with point sensitivities.
- **Correlation exotics fail together.** Basket, rainbow, and worst-of structures depend on a correlation matrix estimated from history, and correlations converge towards one in a crisis — exactly when these products pay out. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Liquidity is one-directional.** Exotics are issued by a dealer and held to maturity by a client. There is no secondary market, so an early exit happens at the dealer's price and any mark is a model mark.

---

#### Code

```python
def path_payoffs(path, strike, barrier=None):
    """Evaluate several exotic payoffs on one realised path.

    `path` is the sequence of monitored fixings. The barrier is treated as
    up-and-out and monitored only at those fixings -- discrete monitoring
    gives a strictly higher value than continuous monitoring at the same level.
    """
    terminal = path[-1]
    average = sum(path) / len(path)
    high, low = max(path), min(path)

    vanilla = max(terminal - strike, 0.0)
    knocked_out = barrier is not None and high >= barrier

    return {
        "vanilla": vanilla,
        "digital": 1.0 if terminal > strike else 0.0,
        "asian": max(average - strike, 0.0),
        "lookback_fixed": max(high - strike, 0.0),
        "lookback_floating": terminal - low,
        "up_and_out": 0.0 if knocked_out else vanilla,
        "up_and_in": vanilla if knocked_out else 0.0,
    }


def digital_via_call_spread(call_price_fn, strike, half_width):
    """Centred call-spread approximation to a cash-or-nothing digital paying 1.

    An approximation, not a bound: between strike and strike + half_width the
    spread pays less than the digital. For a hedge that dominates on every
    path, put the upper strike at the digital strike instead -- see below.
    """
    return (call_price_fn(strike - half_width) - call_price_fn(strike + half_width)) / (
        2.0 * half_width
    )


def digital_super_replication(call_price_fn, strike, width):
    """One-sided spread that dominates the digital on every path.

    Long C(K - width), short C(K), scaled by 1 / width. Always at or above the
    true digital value; the gap is what a desk short a digital reserves.
    """
    return (call_price_fn(strike - width) - call_price_fn(strike)) / width
```

---

#### See Also

* [Binomial Trees](/derivatives/binomial-trees)
* [The Volatility Surface](/derivatives/vol-surface)
* [Delta Hedging](/derivatives/delta-hedging)
* [Variance Swaps](/derivatives/variance-swaps)
* [Numerical Schemes](/stochastic-calculus/numerical-schemes)
* [Liquidations](/building-blocks/liquidations)

---
