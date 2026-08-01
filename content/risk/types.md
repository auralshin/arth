### Types of Risk

> info **Metadata** Level: Beginner | Prerequisites: Returns, Volatility | Tags: risk, taxonomy, counterparty, credit, liquidity, operational, model-risk

"Risk" is not one thing. A portfolio can lose money because prices moved against it, because a counterparty failed to pay, because it could not exit a position at any sensible price, because someone entered the wrong quantity, because the model that priced the position was wrong, or because a regulator changed the rules mid-trade. These are different mechanisms with different measurements and different controls. Conflating them is how a book ends up carefully hedged against the risk everyone understands and fully exposed to the one that eventually causes the loss.

A taxonomy earns its keep by forcing you to look where you would otherwise not. The categories below are the ones most institutions organise around. They are not mutually exclusive — a single event usually spans several — but each names a distinct question you can ask of a position, a strategy, or a firm.

---

#### A Working Taxonomy

<table>
  <tbody>
    <tr><td><strong>Category</strong></td><td><strong>The loss mechanism</strong></td><td><strong>Typical measure</strong></td><td><strong>Typical control</strong></td></tr>
    <tr><td>Market</td><td>Prices, rates, spreads or volatilities move against the position.</td><td>Volatility, VaR, CVaR, stress P&amp;L, factor exposures</td><td>Position limits, hedging, diversification</td></tr>
    <tr><td>Credit / counterparty</td><td>An obligor or trading counterparty fails to perform.</td><td>Exposure at default, default probability, loss given default</td><td>Collateral, netting, central clearing, limits</td></tr>
    <tr><td>Liquidity (funding)</td><td>You cannot raise cash to meet an obligation when it falls due.</td><td>Survival horizon, unencumbered cash, margin coverage</td><td>Cash buffers, committed facilities, term funding</td></tr>
    <tr><td>Liquidity (market)</td><td>You can only exit by paying a large and size-dependent concession.</td><td>Days to liquidate, cost-to-liquidate in basis points</td><td>Capacity limits, participation caps, staged exits</td></tr>
    <tr><td>Operational</td><td>People, process or systems fail: errors, outages, fraud, key loss.</td><td>Loss frequency and severity, break counts, incident rates</td><td>Segregation of duties, reconciliation, monitoring</td></tr>
    <tr><td>Model</td><td>The model used to price, hedge or size is wrong or misapplied.</td><td>Backtest exceptions, P&amp;L attribution residual, benchmark models</td><td>Independent validation, reserves, model limits</td></tr>
    <tr><td>Legal / regulatory</td><td>Contracts fail to bind, or rules change the economics of a position.</td><td>Scenario analysis, documentation review</td><td>Legal opinions, jurisdiction limits, licensing</td></tr>
  </tbody>
</table>

---

#### Formal Definition

Each category has a canonical quantification. None of them is "the" definition of risk; each is a lens.

```text
Market risk        VaR_a  = -quantile_a( P&L over horizon h )
Credit risk        EL     = EAD * PD * LGD
Funding liquidity  H      = unencumbered_liquid_assets / expected_daily_net_outflow
Market liquidity   C      = sum over slices of slippage( participation_rate )
Operational risk   EL_op  = expected_frequency * expected_severity
```

where:

- `VaR_a` is value at risk at confidence level `a` over horizon `h`
- `EAD` is exposure at default: what you would be owed if the counterparty failed today
- `PD` is the probability of default over the chosen horizon
- `LGD` is loss given default, equal to `1 - recovery_rate`
- `H` is the survival horizon in days
- `C` is the total cost of unwinding a position, expressed in basis points of notional

The gap between these formulas matters as much as the formulas themselves. `VaR` is a quantile of a distribution you estimated from data. `EL` is a mean, and the mean is almost never what hurts you. `H` is a ratio of two numbers that both move in a crisis, in opposite directions.

---

#### Worked Example

A fund holds an uncleared interest rate swap with a bank counterparty. Under the collateral agreement, exposure above a threshold is collateralised daily, but a residual uncollateralised amount always remains.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Mark-to-market in the fund's favour</td><td>2,300,000</td></tr>
    <tr><td>Collateral held</td><td>300,000</td></tr>
    <tr><td>Exposure at default (EAD)</td><td>2,000,000</td></tr>
    <tr><td>One-year default probability (PD)</td><td>0.80%</td></tr>
    <tr><td>Assumed recovery rate</td><td>40%</td></tr>
  </tbody>
</table>

1. **Loss given default**: `LGD = 1 - 0.40 = 0.60`
2. **Expected loss**: `EL = 2,000,000 * 0.008 * 0.60 = 9,600` per year
3. **Loss if default actually occurs**: `2,000,000 * 0.60 = 1,200,000`
4. **Ratio**: the realised loss is `1,200,000 / 9,600 = 125` times the annual expected loss

The expected loss is a rounding error in the fund's P&L. The realised loss, in the one year out of roughly 125 in which it happens, is not. This is the shape of most credit and operational exposures: a small, smooth expected cost concealing a large, lumpy actual one. Provisioning against `EL` and capitalising against the tail are two different exercises. See [Default Probability](/credit/default-probability) and [Recovery Rates](/credit/recovery-rates) for how `PD` and `LGD` are actually estimated.

> warning **Expected loss is not a risk measure** `EL` tells you what to charge for the exposure. It tells you nothing about whether the loss would be survivable. Size limits should be set against the tail, not the mean.

---

#### Liquidity Risk Has Two Faces

The single word "liquidity" covers two distinct failures that are routinely confused.

**Market liquidity risk** is about price: can this position be sold, and at what concession? It is a property of the instrument and the market. A large position in an illiquid corporate bond has high market liquidity risk even for an unlevered holder with no obligations.

**Funding liquidity risk** is about cash: can you meet a payment when it falls due? It is a property of your balance sheet. A fully hedged, market-neutral book can still fail if a margin call arrives on the losing leg before the gain on the winning leg settles.

They interact viciously. A margin call forces sales; forced sales widen spreads; wider spreads mark the book lower; lower marks trigger further calls. This loop is the mechanism behind most fast deleveraging episodes, and it is why funding and market liquidity have to be stressed jointly rather than separately. [Liquidity Cycles](/regimes-macro/liquidity-cycles) covers the macro version of the same feedback.

---

#### Counterparty Risk and Where It Sits

Counterparty risk is the category most often omitted from a trading-focused risk model, because it lives in the plumbing rather than in the strategy.

- **Exchange-traded and centrally cleared.** A central counterparty (CCP) interposes itself between buyer and seller. Bilateral counterparty risk is replaced by exposure to the CCP, backed by initial margin, variation margin and a default fund. This concentrates risk rather than eliminating it.
- **Bilateral over-the-counter.** Exposure runs directly to the counterparty, mitigated by netting agreements and daily collateral exchange. Residual exposure comes from thresholds, minimum transfer amounts, and the margin period of risk between the last collateral call and close-out.
- **Prime brokerage and custody.** Assets held at a prime broker may be rehypothecated. If the broker fails, "your" securities can become a claim in an insolvency rather than property you control. Segregated custody costs more and exists for exactly this reason.
- **Settlement.** Between trade and settlement you have delivered and not yet received, or vice versa. Delivery-versus-payment removes most of this; free-of-payment transfers and cross-currency settlement do not.

Shortening settlement cycles reduces the window in which counterparty exposure accumulates, but compresses the operational timetable that has to fit inside it. See [Operational Risk](/risk/operational).

---

#### On-Chain Risk as One Category Among These

On-chain markets rearrange the taxonomy rather than escaping it. Atomic settlement and overcollateralisation genuinely remove some traditional counterparty exposure. In exchange, they concentrate risk into categories that barely exist elsewhere:

- **Protocol and code risk.** A contract may contain a bug, an economic design flaw, or an upgrade path controlled by a key. This is closest to operational and legal risk combined. See [Smart Contract Risk](/risk/smart-contract).
- **Oracle risk.** A position's value, and its liquidation trigger, depend on a price feed that can be stale, manipulated, or wrong. See [Oracle Manipulation](/risk/oracle-manipulation).
- **Ordering and execution risk.** Transaction ordering is contested, so the price you receive depends on who sequences your trade. See [Slippage & Frontrunning](/risk/slippage-frontrunning).
- **Custody risk.** Self-custody replaces counterparty default with key loss and key compromise, which is operational risk with no recourse and no reversal.

The useful discipline is to map each on-chain exposure back onto the general category it belongs to, rather than treating "DeFi risk" as its own untranslatable thing.

---

#### In Practice Across Asset Classes

**Equities.** Market risk dominates and is well measured. Counterparty risk is largely intermediated away by clearing, but reappears in securities lending, where you have lent stock against collateral. See [Short Selling](/markets/short-selling).

**Futures.** Daily variation margin converts credit risk into funding liquidity risk. You are unlikely to lose money to a defaulting counterparty; you are entirely capable of being forced out of a correct position by a margin call.

**Fixed income and credit.** Market risk and credit risk are the same risk viewed at different horizons — a spread widening and a default are two points on one continuum. Market liquidity risk is severe and highly regime-dependent. See [Credit Spreads](/credit/credit-spreads).

**FX.** Settlement risk is the historically distinctive exposure: paying one currency before receiving the other across time zones. Payment-versus-payment infrastructure addresses most but not all of it.

**Derivatives.** Model risk becomes first-order, because the position has no observable price of its own. A mispriced volatility surface produces a hedge that fails precisely when it is needed. See [Implied Volatility](/derivatives/implied-volatility).

**On-chain.** Code, oracle and ordering risk sit alongside conventional market risk, and the effective time horizon for a liquidation cascade is measured in blocks rather than days.

---

#### Assumptions and Failure Modes

- **The categories are treated as additive.** They are not. A funding squeeze causes forced sales, which cause market losses, which trigger counterparty calls. Summing standalone measures understates the joint loss.
- **Estimated distributions come from calm periods.** `VaR` and `PD` are estimated from history dominated by ordinary conditions. Both understate risk in the regime where they matter. See [Correlation Breakdown](/regimes-macro/correlation-breakdown).
- **Correlations are assumed stable.** Diversification benefit computed from long-run correlations disappears in stress, when most risky assets move together.
- **Collateral is assumed good.** Collateral has its own market and liquidity risk, and it is usually correlated with the exposure it secures. Wrong-way risk is the case where collateral value falls precisely as the counterparty weakens.
- **Operational and model risk are assumed small because they are hard to measure.** Absence of a number is not absence of exposure. These categories are unquantified far more often than they are genuinely negligible.
- **The taxonomy is treated as complete.** It is a checklist, not a proof. Novel structures generate exposures that do not fit any existing box, and those are exactly the ones nobody has a limit for.

> warning **Educational content only** This page describes how risks are categorised and measured. It is not investment or risk-management advice, and no framework here substitutes for the controls appropriate to a specific book.

---

#### Code

```python
def expected_credit_loss(exposure_at_default, default_prob, recovery_rate):
    """Annual expected loss on a counterparty exposure.

    Returns the mean, which is what you charge for. The tail — exposure
    times LGD, conditional on default — is what you size limits against.
    """
    loss_given_default = 1.0 - recovery_rate
    expected = exposure_at_default * default_prob * loss_given_default
    conditional = exposure_at_default * loss_given_default
    return {"expected_loss": expected, "loss_if_default": conditional}


def funding_survival_horizon(liquid_assets, daily_net_outflow, stress_multiple=3.0):
    """Days of survival under a stressed outflow assumption.

    The stress multiple matters more than the base case: outflows and
    asset haircuts both worsen in the same states of the world.
    """
    return liquid_assets / (daily_net_outflow * stress_multiple)
```

---

#### See Also

* [Leverage, Margin, and Liquidation Risk](/risk/leverage-liquidation)
* [Operational Risk](/risk/operational)
* [Risk Checklists](/risk/checklists)
* [VaR & CVaR](/quant-math/var-cvar)
* [Credit 101](/credit/credit-101)
* [Market Participants](/markets/market-participants)

---
