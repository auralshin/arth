### Building Risk Notes into Every Strategy

> info **Metadata** Level: Beginner | Prerequisites: Types of Risk, Position Sizing | Tags: risk, checklists, process, pre-trade, controls, governance

A checklist is not a substitute for judgement. It is a defence against the specific way judgement fails: consistently, under time pressure, on the item you have checked a hundred times without incident. Aviation and surgery adopted checklists not because practitioners were incompetent but because expertise does not protect against omission. Trading has the same structure — rare, high-consequence errors in an environment that rewards speed.

The unit of work here is the **risk note**: a short, standing document attached to every strategy that states what it does, what it assumes, what would falsify it, what limits bind it, and what would cause it to be turned off. Written before the strategy trades, it is a hypothesis. Reviewed after every material change, it becomes the record of what you believed and when. Its most valuable property is that it forces the kill criteria to be written down while the position is still theoretical and you are still able to think clearly about it.

---

#### What a Risk Note Contains

Nine fields, each one sentence to one paragraph. Longer than this and it will not be maintained.

<table>
  <tbody>
    <tr><td><strong>Field</strong></td><td><strong>What it answers</strong></td></tr>
    <tr><td>Thesis</td><td>What inefficiency or risk premium is being harvested, in one sentence.</td></tr>
    <tr><td>Mechanism</td><td>Why it should persist. Who is on the other side, and why are they there?</td></tr>
    <tr><td>Exposures</td><td>Which factors, rates, currencies and venues the position is actually exposed to.</td></tr>
    <tr><td>Capacity</td><td>The size beyond which expected costs consume the edge.</td></tr>
    <tr><td>Limits</td><td>Position, concentration, participation and loss limits, with numbers.</td></tr>
    <tr><td>Dependencies</td><td>Data feeds, venues, counterparties, custodians, oracles, credentials.</td></tr>
    <tr><td>Falsifiers</td><td>What observation would mean the thesis is wrong, stated in advance.</td></tr>
    <tr><td>Kill criteria</td><td>Thresholds at which trading halts, and who decides.</td></tr>
    <tr><td>Owner and review date</td><td>A named person and a date, so it does not silently rot.</td></tr>
  </tbody>
</table>

The falsifiers field does the most work and is the one most often left vague. "Underperformance" is not a falsifier. "Realised cost per round trip exceeds 50 bps for twenty consecutive trading days" is.

---

#### Formal Definition: Limits as Binding Constraints

A checklist becomes enforceable when its items are expressed as constraints on size rather than as reminders. The maximum position is the tightest of several independent limits:

```text
max_notional = min(
    concentration_limit * capital,
    participation_limit * ADV_notional * days_to_build,
    risk_limit * capital / (z * sigma_daily)
)
```

where:

- `concentration_limit` is the maximum fraction of capital in one name or one strategy
- `participation_limit` is the maximum fraction of average daily volume traded per day
- `ADV_notional` is average daily volume expressed in currency
- `risk_limit` is the maximum tolerated loss as a fraction of capital
- `z` is the number of daily standard deviations the limit is set against
- `sigma_daily` is the instrument's daily volatility

Sizing is necessary but not sufficient. A separate gate compares the edge to the cost of capturing it:

```text
net_edge_bps = gross_edge_bps - round_trip_cost_bps
```

A trade that passes every size limit and fails this test is still a losing trade, just a correctly sized one.

---

#### Worked Example: Running the Gates

A systematic strategy wants to take a position in a mid-liquidity name.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Capital</td><td>5,000,000</td></tr>
    <tr><td>Price</td><td>20.00</td></tr>
    <tr><td>Target position</td><td>150,000 shares (3,000,000)</td></tr>
    <tr><td>Average daily volume</td><td>900,000 shares (18,000,000)</td></tr>
    <tr><td>Daily volatility</td><td>2.5%</td></tr>
    <tr><td>Quoted spread</td><td>10 bps (half-spread 5 bps)</td></tr>
    <tr><td>Expected gross edge</td><td>60 bps per round trip</td></tr>
    <tr><td>Limits</td><td>25% of capital per name; 10% of ADV per day; 1.5% of capital at a 2-sigma daily move</td></tr>
  </tbody>
</table>

1. **Concentration gate.** `3,000,000 / 5,000,000 = 60%` of capital against a 25% limit. Breached. The cap is `0.25 * 5,000,000 = 1,250,000`, or 62,500 shares.
2. **Risk gate.** A 2-sigma daily move is `2 * 2.5% = 5%`. On 1,250,000 that is `62,500`, which is `62,500 / 5,000,000 = 1.25%` of capital, inside the 1.5% limit. It would have permitted `0.015 * 5,000,000 / 0.05 = 1,500,000`, so concentration binds first.
3. **Participation gate.** `62,500 / 900,000 = 6.9%` of ADV, inside the 10% limit. The position can be built in a single day.
4. **Cost gate.** With a square-root impact model, `impact = 0.5 * sigma_daily * sqrt(participation) = 0.5 * 0.025 * sqrt(0.0694) = 0.5 * 0.025 * 0.2634 = 0.00329`, or 32.9 bps. Adding the 5 bps half-spread gives 37.9 bps one way, so `75.8 bps` for a round trip.
5. **Edge test.** `60 - 75.8 = -15.8 bps`. The trade fails.

The sequence is the lesson. Three gates passed after resizing, and the trade still loses money. Size limits control how much you can lose; only the cost gate asks whether the trade was worth doing at all — and it is the one most often run last, or not at all. The available responses are to lengthen the holding period so the round-trip cost amortises over a larger expected move, to trade the same signal in a more liquid instrument, or to conclude the edge estimate was too optimistic. See [Market Impact](/execution/market-impact) for how the impact coefficient is actually estimated.

> warning **The coefficient is fitted, not given** The `0.5` in the impact formula is an illustrative value. It must be estimated from your own fills, and it varies by instrument, venue and regime. Using a borrowed constant is a modelling assumption, not a measurement.

---

#### Pre-Trade Checklist

Run before a discretionary trade or before a new instrument is enabled for a systematic one.

- **Instrument identity.** Correct symbol, exchange, contract month, currency and settlement convention. Symbol collisions across venues are a recurring source of large errors.
- **Direction and size.** Sign and quantity confirmed against the intended exposure, not against the last order.
- **Limits.** Concentration, participation and loss limits computed and satisfied.
- **Cost estimate.** Expected round-trip cost, including spread, impact, commissions, financing and any borrow.
- **Liquidity.** Depth checked at the intended size, not at the top of book, and at the time of day you intend to trade.
- **Event calendar.** Earnings, expiry, roll, index rebalance, auction, scheduled macro release, protocol upgrade.
- **Financing.** Borrow availability and rate for shorts; margin impact of the position.
- **Counterparty and venue.** Exposure within limit; venue status normal; settlement instructions correct.
- **Exit.** How the position is closed, at what cost, and how long it takes under stressed liquidity.
- **Correlation.** What else in the book this position resembles. Correlated exposures aggregate whether or not the risk system nets them.

---

#### Pre-Deployment Checklist

Run before a strategy or a code change reaches production.

- **Point-in-time data.** No restated fundamentals, no forward-filled reference data, no index membership known before its effective date.
- **Fill assumptions.** Fills modelled at a price and delay you can actually achieve; passive fills assume queue position rather than certainty.
- **Costs and financing.** Modelled, not assumed away, and stress-tested at multiples of the base case.
- **Capacity.** Return at target size, not at backtested size, with impact scaled appropriately. See [Backtest vs Live](/risk/backtest-vs-live).
- **Out-of-sample evidence.** Walk-forward or purged cross-validation results, plus the number of variants tested. See [Multiple Testing](/stat-methods/multiple-testing).
- **Sensitivity.** Performance across parameter neighbourhoods and sub-periods. A result that survives only at one parameter value is a fitted artefact.
- **Independent limits.** Maximum order size, maximum position, price collar and message-rate limits enforced outside the strategy code.
- **Kill switch.** Present, reachable without the strategy process, and tested.
- **Rollback.** A tested path back to the previous version, faster than the loss accrues.
- **Reconciliation.** Positions and cash reconcile against an independent source before size is increased. See [Operational Risk](/risk/operational).
- **Staged enablement.** Small size first, compared against the shadow backtest, then scaled on evidence.
- **Risk note.** Written, reviewed and dated, with kill criteria agreed by someone other than the author.

---

#### Daily Operating Checklist

- Positions and cash reconciled; every break owned, aged and explained.
- P&L independently recomputed and attributed to signal, execution, financing and residual. An unexplained residual is a model or booking error until proven otherwise.
- Realised costs compared against modelled costs; drift investigated before it becomes a quarter's underperformance.
- Limit usage reviewed, including limits that are close to binding rather than only those breached.
- Margin coverage and funding runway checked against a stressed outflow, not the base case.
- Data feed integrity: staleness, gaps, and outliers flagged rather than silently forward-filled.
- Upcoming events for held instruments confirmed: expiries, rolls, corporate actions, governance votes.

---

#### Additional Items for On-Chain Deployment

On-chain execution adds items rather than replacing any of the above. It does not remove the need for reconciliation, limits or kill switches.

- **Contract review.** Audit status, upgradeability, admin keys, timelocks and pause authority for every contract the strategy touches. See [Smart Contract Risk](/risk/smart-contract).
- **Price feeds.** Which oracle, what update frequency and deviation threshold, and what happens on staleness. See [Oracle Manipulation](/risk/oracle-manipulation).
- **Ordering exposure.** Whether the transaction is exploitable if publicly visible, and what protection is used. See [Slippage & Frontrunning](/risk/slippage-frontrunning).
- **Slippage bounds and deadlines.** Set explicitly on every transaction, and sized against realistic pool depth rather than a default.
- **Simulation before signing.** Every transaction simulated against current state; blind signing prohibited.
- **Allow-lists.** Destination addresses and callable contracts restricted; approvals scoped and revoked when finished.
- **Gas and congestion.** Behaviour defined when fees spike or the transaction fails to confirm, especially for time-sensitive actions such as liquidations. See [Gas & Mempool](/microstructure/gas-mempool).

---

#### Assumptions and Failure Modes

- **The checklist is assumed to be read.** A list too long to complete honestly will be completed dishonestly. Ten items that are genuinely checked beat forty that are ticked.
- **Limits are assumed to bind.** A limit that can be overridden without a record, by the person it constrains, is documentation rather than control.
- **Estimated inputs are assumed accurate.** ADV, volatility, spread and edge all vary by regime. Gates computed from calm-period inputs permit sizes that stressed conditions do not support.
- **Limits are assumed independent.** They rarely are. Twenty positions each within a 5% concentration limit can share one factor exposure and behave as a single position. See [Factor Models](/stat-methods/factor-models).
- **The list is assumed complete.** Checklists encode failures already experienced. Novel structures fail in ways no existing item asks about, which is why post-mortems must add items.
- **Kill criteria are assumed to be honoured.** The moment a threshold is hit is precisely when the argument for making an exception is most compelling. Deciding in advance who has authority to override, and requiring it in writing, is the only reliable defence.
- **Green ticks are assumed to mean safety.** A completed checklist means the known failures were considered. It says nothing about the unknown ones.

> warning **Educational content only** These checklists are illustrative teaching material, not a compliance framework or an operating procedure for any specific firm, venue or jurisdiction.

---

#### Code

```python
def max_position_notional(capital, adv_notional, sigma_daily, concentration_limit,
                          participation_limit, risk_limit, z=2.0, days_to_build=1):
    """Tightest of the independent size limits, with the binding one named.

    Reporting which constraint binds is the point: it tells you what to
    change if the size is inadequate.
    """
    gates = {
        "concentration": concentration_limit * capital,
        "participation": participation_limit * adv_notional * days_to_build,
        "risk": risk_limit * capital / (z * sigma_daily),
    }
    binding = min(gates, key=gates.get)
    return {"max_notional": gates[binding], "binding_gate": binding, "gates": gates}


def passes_cost_gate(gross_edge_bps, half_spread_bps, sigma_daily,
                     participation, impact_coefficient=0.5):
    """Round-trip cost against expected edge, under a square-root impact law.

    impact_coefficient must be fitted to your own fills; the default is a
    placeholder, not a constant of nature.
    """
    impact_bps = impact_coefficient * sigma_daily * participation**0.5 * 10_000
    round_trip_bps = 2 * (half_spread_bps + impact_bps)
    return gross_edge_bps - round_trip_bps
```

---

#### See Also

* [Types of Risk](/risk/types)
* [Operational Risk](/risk/operational)
* [Backtest vs Live](/risk/backtest-vs-live)
* [Position Sizing](/quant-math/position-sizing)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)
* [Risk & Reality Check](/welcome/risk-reality-check)

---
