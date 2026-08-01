### Leverage, Margin, and Liquidation Risk

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, Types of Risk | Tags: leverage, margin, liquidation, clearing, risk

Leverage is borrowing to hold a position larger than your capital. It multiplies returns in both directions, but that symmetry is the least interesting part. The asymmetry that matters is structural: a leveraged position can be closed by someone other than you, at a time and price you did not choose, because the terms of the borrowing gave them that right. Margin is the collateral that keeps that from happening; liquidation is what happens when it stops being enough.

Every leveraged market has the same three-layer architecture, whatever the venue calls it. An **initial margin** requirement determines how large a position your capital supports. A **maintenance margin** requirement determines how far the position can move against you before the lender intervenes. A **close-out procedure** determines who sells what, how fast, and who bears any shortfall. Understanding a leveraged product means knowing all three numbers and, critically, who is permitted to change them and how quickly.

---

#### Formal Definition

For a long position of `q` units bought at `P_0` with starting equity `E_0`:

```text
L         = q * P_0 / E_0                        gross leverage at inception
equity_t  = E_0 + q * (P_t - P_0)                mark-to-market equity
required  = m * q * P_t                          maintenance requirement
```

A margin call is triggered when `equity_t` falls below `required`. Setting the two equal and solving for price gives the liquidation price:

```text
P_liq = P_0 * (1 - 1/L) / (1 - m)                long position
P_liq = P_0 * (1 + 1/L) / (1 + m)                short position
```

where:

- `L` is gross leverage: position value divided by equity
- `m` is the maintenance margin rate, expressed as a fraction of current position value
- `P_liq` is the price at which equity exactly equals the maintenance requirement

Two properties are worth internalising. First, `P_liq` does not depend on position size — only on leverage and the maintenance rate. Doubling the position and doubling the capital changes nothing. Second, the distance to liquidation shrinks roughly as `1/L`: a 2x long with `m = 0.25` survives a 33% fall, while a 20x long with `m = 0.005` survives about 4.5%.

---

#### Worked Example: A Broker Margin Account

A client buys 1,000 shares at 100 in a margin account with a 50% initial requirement and a 25% maintenance requirement.

<table>
  <tbody>
    <tr><td><strong>Item</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Position value at inception</td><td>100,000</td></tr>
    <tr><td>Client equity (50% initial margin)</td><td>50,000</td></tr>
    <tr><td>Margin loan</td><td>50,000</td></tr>
    <tr><td>Gross leverage</td><td>2.0x</td></tr>
    <tr><td>Maintenance requirement</td><td>25% of market value</td></tr>
  </tbody>
</table>

1. **Liquidation price**: `P_liq = 100 * (1 - 1/2) / (1 - 0.25) = 100 * 0.5 / 0.75 = 66.67`
2. **Sanity check at 66.67**: market value `66,670`, equity `66,670 - 50,000 = 16,670`, which is 25.0% of market value — exactly at the requirement.
3. **Suppose the price falls to 60.** Market value is `60,000`, equity is `10,000`, and the requirement is `0.25 * 60,000 = 15,000`. The account is short by `5,000`.
4. **Meeting the call with cash**: deposit `5,000`. Equity becomes `15,000` against a `60,000` position — restored.
5. **Meeting the call by selling**: selling reduces market value and the loan equally, leaving equity unchanged at `10,000`. To reach 25% the position must fall to `10,000 / 0.25 = 40,000`, so `20,000` of stock — 333 shares — must be sold.

Note step 5. Deleveraging by selling requires selling roughly four times the size of the shortfall. This is why margin calls cause disproportionate volume, and why they cluster: the same price move calls the same accounts at the same moment.

> warning **The requirement is not a constant** Brokers and clearing houses raise maintenance requirements in volatile markets, and "house" requirements typically exceed regulatory minimums. A requirement raised from 25% to 40% moves `P_liq` from 66.67 to `100 * 0.5 / 0.6 = 83.33` without the price having moved at all.

---

#### Worked Example: A Leveraged Derivative Position

The same formula covers exchange-traded perpetual and futures positions, where maintenance rates are far lower and leverage far higher.

A trader posts 10,000 of collateral against a 5x long, entering at 2,000 for 25 units of notional exposure. The exchange applies a 0.5% maintenance margin rate.

1. **Liquidation price**: `P_liq = 2,000 * (1 - 1/5) / (1 - 0.005) = 2,000 * 0.8 / 0.995 = 1,608.04`
2. **Check**: at `1,608.04` the position is worth `25 * 1,608.04 = 40,201`. Equity is `10,000 + 25 * (1,608.04 - 2,000) = 201`. The requirement is `0.005 * 40,201 = 201`. They match.
3. **Distance to liquidation**: `(2,000 - 1,608.04) / 2,000 = 19.6%`

The 20% that naive arithmetic suggests for 5x leverage is the point where equity reaches zero. The maintenance buffer pulls the trigger slightly closer, to 19.6%.

**How likely is that?** Treat log price as a driftless random walk with 2% daily volatility over a 30-day horizon. The log distance is `ln(1,608.04 / 2,000) = -0.2181`, and `sigma * sqrt(30) = 0.02 * 5.477 = 0.1095`, so the barrier sits `0.2181 / 0.1095 = 1.99` standard deviations away. By the reflection principle the probability of touching it at any point is `2 * Phi(-1.99) = 0.046` — roughly one chance in 22.

That figure is a floor, not an estimate. It assumes no drift, no fat tails, no funding payments eroding collateral, and a maintenance rate that never changes. Every one of those assumptions fails in the direction that makes liquidation more likely.

---

#### Who Liquidates, and How

The close-out mechanism differs far more across venues than the margin formula does.

**Brokers.** A margin call is a demand for cash or securities, typically with a settlement-cycle deadline. If unmet, the broker sells client positions at its discretion — usually the most liquid ones first, which is not the same as the ones causing the risk. The client remains liable for any residual debit balance.

**Futures clearing houses.** Positions are marked to market daily and variation margin moves in cash between accounts. A clearing member that fails to pay is declared in default and its portfolio is auctioned or hedged by the CCP. Losses run through a **default waterfall**: the defaulter's initial margin, then its default-fund contribution, then a tranche of the CCP's own capital, then the mutualised default fund of surviving members, then assessment powers. Members are exposed to each other's failures whether they wanted that exposure or not.

**Prime brokers.** Margin is set on a portfolio basis rather than per position, so hedges reduce the requirement. That is efficient until the prime broker changes its risk model, at which point a portfolio that met requirements yesterday does not today. Cross-margining also means a loss in one strategy can force liquidation in an unrelated one.

**Derivatives exchanges with insurance funds.** Where positions are levered and markets move faster than a margin call can be answered, the exchange liquidates directly, often in stages, and maintains an insurance fund to absorb bankrupt positions closed below their bankruptcy price. When that fund is exhausted, some venues socialise losses across profitable traders through auto-deleveraging.

**On-chain lending protocols.** Liquidation is permissionless and automated: anyone can repay part of a borrower's debt and seize collateral at a discount whenever a solvency condition fails. There is no call, no deadline, and no negotiation. See [Liquidations](/building-blocks/liquidations) and [Lending Architecture](/protocols/lending-architecture).

---

#### The On-Chain Case in Detail

An overcollateralised borrow makes the mechanism explicit in code. A borrower deposits 10 units of collateral priced at 2,000 (20,000 of value) and borrows 10,000 of a stable asset. The market applies an 82.5% liquidation threshold and a 5% liquidation bonus.

```text
health_factor = collateral_value * liquidation_threshold / debt_value
              = 20,000 * 0.825 / 10,000
              = 1.65
```

The position becomes liquidatable when the health factor reaches 1, which happens at `10,000 / (10 * 0.825) = 1,212.12` — a 39.4% fall. A liquidator repaying the maximum 50% close factor pays 5,000 of debt and receives `5,000 * 1.05 = 5,250` of collateral, or `5,250 / 1,212.12 = 4.33` units. The borrower is left with 5.67 units against 5,000 of debt, restoring the health factor to about 1.13.

Three features distinguish this from the broker case. The trigger is a price feed, not a trader's assessment, so [oracle behaviour](/risk/oracle-manipulation) becomes a direct determinant of whether you are liquidated. The liquidation bonus is a transfer from borrower to liquidator, so the cost of being liquidated is known in advance and is larger than a broker's commission. And because liquidation is a profitable, contested transaction, it is subject to [transaction ordering competition](/transaction-ordering-mev) — which affects how reliably positions are closed during congestion.

---

#### In Practice Across Asset Classes

**Equities.** Regulatory initial requirements cap retail leverage at modest multiples; portfolio-margin accounts permit more against hedged books. Short positions carry a higher maintenance requirement and a borrow cost that can be recalled without notice. See [Short Selling](/markets/short-selling).

**Futures.** Margin is set as an absolute amount per contract rather than a percentage, and is revised by the exchange as volatility changes. Effective leverage is high and variation margin settles in cash daily, which converts market risk directly into a funding requirement. See [Futures 101](/markets/futures-101).

**FX.** Leverage available to institutional participants is high because volatility is low; the two facts are related, and the relationship breaks in currency crises and de-peggings.

**Fixed income.** Leverage is obtained through repurchase agreements rather than margin loans. The analogue of a margin call is a haircut increase, which can be imposed at rollover with no price move at all.

**Options.** Margin depends on the whole position's risk profile rather than notional. Short option positions can face requirements that rise faster than the loss itself, because both the price and the volatility input move at once. See [Greeks](/derivatives/greeks).

**On-chain.** Liquidation is automated, price-feed driven, and typically penalised with a fixed bonus. Collateral factors and close factors are governance parameters that can change by vote.

---

#### Assumptions and Failure Modes

- **The liquidation price is assumed fixed.** It is not. Funding payments, borrow costs, accrued interest and dividend adjustments all move it, usually against the position, without any price movement.
- **Requirements are assumed stable.** Maintenance rates, haircuts and collateral factors are set by brokers, clearing houses and governance processes, and they are raised precisely when markets are stressed.
- **Liquidation is assumed to occur at the liquidation price.** It occurs at whatever price the close-out achieves. In a gap or a thin book, that is worse — sometimes worse than zero equity, leaving a residual debt.
- **The position is assumed to be closed in isolation.** Cross-margined and portfolio-margined accounts liquidate whatever reduces the requirement fastest, which may be your best position rather than your worst.
- **Volatility is assumed constant.** Distance-to-liquidation in standard deviations is only meaningful if you use the volatility that will prevail, not the one that has. See [GARCH](/stat-methods/garch).
- **Independence across accounts is assumed.** It never holds. Correlated positions are liquidated simultaneously into the same book, so realised slippage far exceeds what depth data suggested. See [Market Impact](/execution/market-impact).
- **Collateral is assumed to hold its value.** Collateral posted in a volatile or correlated asset can fall alongside the position it secures, accelerating the trigger rather than cushioning it.

> warning **Educational content only** This page explains how margin and liquidation mechanisms work. It is not a recommendation to use leverage, and no leverage level described here is presented as appropriate for anyone.

---

#### Code

```python
def liquidation_price(entry_price, leverage, maintenance_rate, is_long=True):
    """Price at which equity equals the maintenance requirement.

    Independent of position size: only leverage and the rate matter.
    """
    if is_long:
        return entry_price * (1 - 1 / leverage) / (1 - maintenance_rate)
    return entry_price * (1 + 1 / leverage) / (1 + maintenance_rate)


def touch_probability(entry_price, liq_price, daily_vol, horizon_days):
    """Probability of touching the barrier under a driftless log random walk.

    Reflection principle. Treat as a lower bound: real returns have fat
    tails, and collateral erodes through funding and financing costs.
    """
    import math
    distance = abs(math.log(liq_price / entry_price))
    sigma_horizon = daily_vol * math.sqrt(horizon_days)
    z = distance / sigma_horizon
    normal_cdf = 0.5 * (1 + math.erf(-z / math.sqrt(2)))
    return 2 * normal_cdf
```

---

#### See Also

* [Types of Risk](/risk/types)
* [Risk Checklists](/risk/checklists)
* [Liquidations](/building-blocks/liquidations)
* [Drawdown](/quant-math/drawdown)
* [Position Sizing](/quant-math/position-sizing)
* [Futures 101](/markets/futures-101)

---
