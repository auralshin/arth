### Agent-Based Simulation

> info **Metadata** Level: Advanced | Prerequisites: Why Backtest, Scenario Testing, Leverage | Tags: agent-based, simulation, feedback, systemic-risk, modelling

A backtest replays a fixed history and assumes your presence changed nothing. That assumption is the load-bearing wall of the whole exercise, and there is a class of question for which it simply collapses: what happens when many participants respond to the same price, and their responses move the price. Margin calls, stop-loss clusters, redemption waves, liquidity withdrawal and liquidation cascades are all *feedback* phenomena. A historical replay cannot produce them, because in a replay the prices are exogenous.

An **agent-based model (ABM)** replaces the exogenous price with an endogenous one. You specify a population of agents, each with a state and a decision rule, and a mechanism that turns their collective actions into prices. Then you run it forward. The price is no longer data; it is an output. This buys you the ability to study amplification, contagion and non-linearity — and it costs you the discipline that made a backtest checkable, because now every parameter is one you chose, and the model can produce almost any behaviour if you let it.

---

#### Formal Definition

An agent-based model is specified by four objects:

```text
agents      = { a_1, ..., a_n },  each with state x_i,t
decision    = action_i,t  =  f_i(x_i,t, public_state_t, private_signal_i,t)
mechanism   = price_t     =  M(all actions at t, book or pool state)
update      = x_i,(t+1)   =  g_i(x_i,t, price_t, action_i,t)
```

where:

- `f_i` is agent `i`'s behavioural rule — it may be a strategy, a constraint, or a reflex such as "liquidate if margin is breached"
- `M` is the market mechanism: a matching engine, a call auction, or a pricing function for an automated market maker
- `g_i` updates the agent's balance sheet, position and constraint status

The distinguishing feature is the loop. `price_t` depends on actions, actions depend on state, and state depends on the previous price. That circularity is exactly what a backtest lacks and exactly what makes an ABM's output sensitive to specification.

> info **The point is emergence, not prediction** An ABM is a device for discovering which mechanisms *can* produce a phenomenon, and how large it *could* be. It is not a forecasting tool, and calibrated point estimates from one should be treated with deep suspicion.

---

#### Worked Example

A leverage cascade in three cohorts. All figures are illustrative arithmetic chosen to make the mechanism visible; they are not calibrated to any market.

An account with initial leverage `L` (position divided by equity) and maintenance margin `m` breaches when the cumulative price decline `d` satisfies:

```text
(1/L - d) / (1 - d)  falls below  m        so        d*  =  (1/L - m) / (1 - m)
```

<table>
  <tbody>
    <tr><td><strong>Cohort</strong></td><td><strong>Leverage</strong></td><td><strong>Aggregate position</strong></td><td><strong>Breach threshold d*</strong></td></tr>
    <tr><td>A</td><td>4x</td><td>200,000,000</td><td>6.25%</td></tr>
    <tr><td>B</td><td>3x</td><td>150,000,000</td><td>16.67%</td></tr>
    <tr><td>C</td><td>2x</td><td>100,000,000</td><td>37.50%</td></tr>
  </tbody>
</table>

Maintenance margin is 20% for all cohorts. Market depth is modelled linearly and additively: each 40,000,000 of forced selling pushes the price down a further 1%. An exogenous shock of `-12%` arrives.

Step by step:

1. **Round 1.** Cohort A's threshold is `(0.25 - 0.20) / 0.80 = 6.25%`, breached by the 12% shock. A liquidates 200,000,000, causing `200 / 40 = 5.0%` of further decline. Cumulative decline: `12% + 5% = 17%`
2. **Round 2.** Cohort B's threshold is `(0.3333 - 0.20) / 0.80 = 16.67%`, now breached. B liquidates 150,000,000, causing `150 / 40 = 3.75%` more. Cumulative decline: `17% + 3.75% = 20.75%`
3. **Round 3.** Cohort C's threshold is `(0.50 - 0.20) / 0.80 = 37.5%`, not breached at 20.75%. The cascade terminates
4. **Amplification**: `20.75 / 12 = 1.73x` the original shock

Now change one input. With a shock of `-6%` instead, cohort A's 6.25% threshold is *not* reached, no forced selling occurs, and the final decline is 6%. With a shock of `-7%`, cohort A breaches, sells, and the final decline is `7% + 5% = 12%`.

A one-percentage-point difference in the initial shock — from 6% to 7% — produces a six-point difference in the outcome. That discontinuity is the entire reason to build the model. No linear risk measure, no volatility estimate and no historical replay contains it, because it is a property of the interaction, not of any individual agent.

> warning **Additive impact is a simplification** Compounding the declines multiplicatively, or letting depth thin as the cascade proceeds, changes the numbers and usually makes the cascade worse. The choice of impact model is a modelling assumption with a large effect on the answer, and it should be reported alongside the result.

---

#### Designing an Honest Agent-Based Model

**Start with the mechanism, not the agents.** The matching engine or pricing function is the part you can validate against reality, because it is a documented rule rather than a behavioural guess. Get it exactly right before adding anyone to trade on it.

**Use the fewest agent types that reproduce the phenomenon.** Three or four archetypes — a liquidity provider, a noise trader, a constrained leveraged holder, an arbitrageur — will generate most of the interesting dynamics. Every additional type adds parameters faster than it adds insight.

**Prefer constraints to strategies.** Rules like "liquidate when margin is breached" or "redeem when the drawdown exceeds a threshold" are mechanically enforced in reality, so they are far more defensible than a guessed alpha model. Cascades are driven by constraints, not by views.

**Validate on stylised facts.** Do not attempt to match a specific historical path. Check instead that the model reproduces known qualitative regularities: fat-tailed returns, volatility clustering, near-zero return autocorrelation with strong absolute-return autocorrelation. A model that cannot produce these is not describing a market.

**Sweep, do not tune.** Report outcomes across a wide region of parameter space rather than picking the setting that matches a known event. Tuning to one episode is the ABM version of overfitting a backtest — see [Parameter Sweeps and Sensitivity Analysis](/simulation/param-sweeps).

**Run many seeds.** Output is stochastic. A single run is one draw. Report the distribution across seeds, and log the seed so any run can be reproduced exactly.

---

#### In Practice Across Asset Classes

**Equities.** ABMs are used to study fragmentation across venues, the effect of order types on stability, and the interaction of index rebalancing with liquidity provision. The classic application is intraday liquidity withdrawal: market makers widening simultaneously in response to the same signal.

**Futures.** Margin is procyclical — exchanges raise requirements as volatility rises — which makes the cascade above structural rather than incidental. Modelling the margin rule explicitly is often more informative than modelling the traders.

**FX.** Fragmentation and the absence of a central tape mean agents genuinely observe different prices. ABMs here study how a shock propagates across venues when nobody sees the whole market.

**Fixed income and credit.** Dealer inventory constraints are the natural agent rule: dealers absorb flow up to a limit and then step back, which converts a gradual selloff into a discontinuous one. See [Liquidity Cycles](/regimes-macro/liquidity-cycles).

**On-chain markets.** The best-instrumented setting for this technique, because the mechanism is literally source code. Automated market maker pricing, liquidation engines and oracle update rules can be simulated exactly rather than approximated, so only the agent behaviour is guessed. See [Simulating Liquidations](/simulation/liquidations) and [Simulating LP Returns](/simulation/lp-returns).

---

#### Assumptions and Failure Modes

- **Behavioural rules are right.** Assumes agents act as specified. Unverifiable in general, which is why constraint-driven rules are preferable to preference-driven ones.
- **The impact function is right.** Assumes a known relationship between volume and price. This single function usually dominates the result, and it is the least observable part of the model. See [Market Impact](/execution/market-impact).
- **The agent population is representative.** Assumes the mix of leverage, horizon and capital resembles the real one. A cascade model is essentially a statement about the leverage distribution, and that distribution is rarely observable.
- **Enough agents.** Assumes aggregate behaviour is smooth. Too few agents produces lumpy artefacts that look like emergent structure and are not.
- **No adaptation.** Assumes rules are fixed. Real participants learn, and the strategy that caused the cascade will not be run identically next time.
- **Calibration is meaningful.** Assumes fitted parameters have external validity. An ABM with enough free parameters can reproduce almost any history, which makes a good fit weak evidence.
- **Determinism.** Assumes runs are reproducible. Broken by unseeded randomness and by non-deterministic iteration order over agents — and agent ordering itself is a modelling choice, since whoever acts first in a cascade gets the better price.

---

#### Code

The cascade from the worked example, as a loop. The structure generalises: shock, then iterate constraint breaches until the system settles.

```python
def leverage_cascade(shock, cohorts, maintenance_margin, notional_per_percent):
    """Iterate forced liquidations until no further constraint breaches.

    `cohorts` is a list of (leverage, aggregate_position).
    Impact is additive in percentage points: a deliberate simplification
    that understates the cascade, since real depth thins as it proceeds.
    """
    decline = shock
    remaining = list(cohorts)
    rounds = []

    while True:
        breached = [
            (leverage, position)
            for leverage, position in remaining
            if breach_threshold(leverage, maintenance_margin) <= decline
        ]
        if not breached:
            return decline, rounds

        forced_selling = sum(position for _, position in breached)
        impact = forced_selling / notional_per_percent / 100.0
        decline += impact
        rounds.append({"sold": forced_selling, "impact": impact, "decline": decline})
        remaining = [c for c in remaining if c not in breached]


def breach_threshold(leverage, maintenance_margin):
    """Cumulative decline at which an account of this leverage is liquidated."""
    return (1.0 / leverage - maintenance_margin) / (1.0 - maintenance_margin)


cohorts = [(4, 200_000_000), (3, 150_000_000), (2, 100_000_000)]
final, path = leverage_cascade(0.12, cohorts, 0.20, 40_000_000)
print(round(final, 4), len(path))     # 0.2075 2

# The discontinuity: one point of extra shock, six points of extra decline.
print(round(leverage_cascade(0.06, cohorts, 0.20, 40_000_000)[0], 4))   # 0.06
print(round(leverage_cascade(0.07, cohorts, 0.20, 40_000_000)[0], 4))   # 0.12
```

---

#### See Also

* [Scenario and Stress Testing](/simulation/scenarios)
* [Orderbook Simulation](/simulation/orderbook)
* [Agent-Based Simulation Engineering](/building-simulations/agent-based-simulation)
* [Leverage & Liquidation](/risk/leverage-liquidation)
* [Market Impact](/execution/market-impact)
* [Correlation Breakdown](/regimes-macro/correlation-breakdown)

---
