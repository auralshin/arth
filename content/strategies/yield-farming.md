### Simple Yield Farming

> info **Metadata** Level: Beginner | Prerequisites: Liquidity Pools, Tokenomics, Returns | Tags: yield-farming, emissions, real-yield, dilution, apr, defi

Yield farming is the practice of moving capital between on-chain protocols to collect whatever they are paying — trading fees, lending interest, staking rewards, and above all newly issued governance tokens. The headline numbers are large and the mechanics are simple, which is precisely why the discipline required to evaluate a farm is mostly subtraction rather than arithmetic.

The single question that organises the whole subject is: **who is on the other side, and what are they paying for?** Every genuine yield has an identifiable payer — a trader paying a fee, a borrower paying interest, a protocol paying for security. Where no such payer exists, the yield is a transfer between token holders dressed as income, and its sustainability is a function of an emission schedule rather than of demand. Distinguishing the two is the whole job.

> warning **Not Financial Advice** This page explains where farming yields come from and how to compute a net figure. It is not a recommendation to farm anything, and headline APRs quoted anywhere should be treated as marketing until decomposed.

---

#### Where Yield Actually Comes From

Four sources, in descending order of how confidently you can call them income:

**1. Trading fees.** A swap fee paid by a trader to a liquidity provider. There is a real external payer, and the revenue exists whether or not the protocol issues a token. This is the most defensible category — but it is gross revenue against which inventory risk must be netted, which is the subject of [LP as a Business](/strategies/lp-business).

**2. Lending spread.** A borrower pays interest; a lender receives most of it; the protocol keeps a reserve factor. Again a real payer. The rate is set by a utilisation curve, so it is endogenous: high advertised supply rates usually mean high utilisation, which means withdrawal may not be immediate. See [Lending and Borrowing](/building-blocks/lending-borrowing).

**3. Staking and consensus rewards.** Payment for securing a network, funded by a mix of protocol issuance, priority fees, and extractable value. The fee-and-tip portion has an external payer; the issuance portion dilutes non-stakers. Measured against a fixed unit of account these can look identical while being economically different. See [Staking and Restaking](/protocols/staking-restaking).

**4. Token emissions and incentives.** A protocol issues its own token to whoever supplies liquidity. There is **no external payer**. The value comes from existing and future token holders, whose claim is diluted. Emissions are a customer acquisition cost paid in equity, and they are perfectly rational for the protocol and perfectly finite.

> info **The payer test** Trace one unit of your yield backwards to a counterparty who chose to part with value in exchange for something. If the chain terminates at a smart contract minting a token, you are being paid in dilution, not revenue.

A fifth quasi-category deserves naming: **points and prospective airdrops**, where the reward is an unpriced, undated, discretionary claim. This is not yield at all. It is an option with no strike, no expiry, and a writer under no obligation, and it should be modelled at zero with upside rather than at an assumed value.

---

#### Formal Definition

Protocols advertise **APR** (simple, no compounding) or **APY** (compounded). They are not interchangeable:

```text
APY = (1 + APR / n)^n - 1
```

where `n` is the number of compounding periods per year. At 46% APR, daily auto-compounding gives `(1 + 0.46/365)^365 - 1 = 58.4%` APY. That is a real difference, and it is also the number most likely to be quoted for a yield that will not survive a month.

The quantity that matters is the **net realised rate**, which subtracts every cost from every source:

```text
Net = Fee_yield
    + Emission_yield * (1 - price_haircut)
    - Divergence_loss
    - Gas_cost
    - Slippage_on_reward_sales
    - Borrow_cost           (if the position is levered)
```

where:

- `Fee_yield` and `Emission_yield` are accruals over the holding period, not annualised figures
- `price_haircut` is the change in the reward token's price between accrual and sale
- `Divergence_loss` is the impermanent loss on the underlying pool position
- costs are absolute amounts, converted to the same numeraire

The emission yield itself is not a constant. It is a budget divided by participants:

```text
Emission_APR = annual_emission_value / total_value_locked
```

With an illustrative annual budget worth 5,000,000, a farm shows 50% APR at 10,000,000 of total value locked, 20% at 25,000,000, and 10% at 50,000,000. **The advertised rate is a function of how few people have arrived yet**, and it falls as the farm succeeds. Any plan built on the current number assumes the crowd does not follow you.

---

#### Worked Example: A 46% Farm

An illustrative position held for 30 days. All inputs are chosen to demonstrate the arithmetic; none is measured from a live protocol.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Capital deployed</td><td>50,000</td></tr>
    <tr><td>Fee APR from trading</td><td>6%</td></tr>
    <tr><td>Advertised emission APR</td><td>40%</td></tr>
    <tr><td>Holding period</td><td>30 days</td></tr>
    <tr><td>Reward token price change over the period</td><td>-35%</td></tr>
    <tr><td>Divergence loss on the pool position</td><td>-2.0%</td></tr>
    <tr><td>Gas: entry, exit, four harvests</td><td>40 + 40 + 4 x 15 = 140</td></tr>
    <tr><td>Slippage selling reward tokens</td><td>1.0% of proceeds</td></tr>
  </tbody>
</table>

1. **Fee income**: `50,000 * 0.06 * 30/365 = 246.58`
2. **Emissions accrued**, valued at the price on which the 40% was quoted: `50,000 * 0.40 * 30/365 = 1,643.84`
3. **Emissions realised** after the token fell 35%: `1,643.84 * 0.65 = 1,068.49`
4. **Divergence loss**: `50,000 * 0.02 = 1,000.00`
5. **Gas**: `140.00`
6. **Slippage on the reward sale**: `1,068.49 * 0.01 = 10.68`
7. **Net**: `246.58 + 1,068.49 - 1,000.00 - 140.00 - 10.68 = 164.39`
8. **Period return**: `164.39 / 50,000 = 0.329%`
9. **Annualised, simple**: `0.329% * 365/30 = 4.0%`

A headline of 46% delivered 4.0%. Nothing exotic happened: no exploit, no depeg, no liquidation. The token fell, the pool diverged, and gas was paid — three entirely ordinary events. Note also the ordering of magnitudes. The reward token's 35% decline cost 575 of accrued value, while divergence cost 1,000 and gas cost 140 on a position this size. **On a smaller position gas alone would have consumed the entire return**, which is why the same farm is a different proposition at 5,000 and at 500,000.

---

#### Emissions, Dilution, and Reflexivity

Emissions create a feedback loop that is worth stating explicitly, because it explains why the pattern above is the normal case rather than bad luck.

The protocol issues tokens to farmers. Farmers are, almost by definition, not long-term holders — they are there for the rate. They sell. That selling is continuous, sized to the emission schedule, and mostly price-insensitive. With an illustrative budget of 5,000,000 per year, roughly 13,700 of daily sell pressure arrives regardless of demand. If organic buying is smaller than that, the price falls; as the price falls, the quoted APR falls with it (since the APR is denominated in the falling token); as the APR falls, farmers leave; as farmers leave, total value locked falls, which *raises* the quoted APR for whoever remains — attracting the next cohort.

This is not fraud and it is not a flaw in any particular protocol. It is what happens when a customer-acquisition budget is paid in a liquid asset. Two things follow directly:

- **Quoted APR and realised APR diverge systematically, in one direction.** The gap is the token's decline between accrual and sale, and there is no version of the mechanism in which it is usually favourable.
- **Harvest frequency is a real decision.** Harvesting and selling immediately converts the reward at the accrual price and eliminates the haircut, at the cost of gas per harvest. Holding rewards is a directional bet on the reward token that has nothing to do with the farming decision — and it should be recognised as such rather than arrived at by inaction.

---

#### In Practice Across Protocol Types

**Decentralised exchange pools.** Fee yield is real and computable from volume; emission yield is the incentive layer on top. The trap is that the incentive is often largest precisely where the fee business is worst, because that is where liquidity would not otherwise go.

**Lending markets.** Supply yield is genuine interest, and the honest complication is utilisation: an attractive rate implies a high proportion of deposits are lent out, so exit liquidity is the first thing to disappear in stress. Incentive tokens layered on top can produce a supply rate above the borrow rate, which invites recursive borrow-and-redeposit loops that amplify both the yield and the liquidation risk. See [Liquidations](/building-blocks/liquidations).

**Liquid staking and restaking.** The base layer is consensus reward, which has a defensible economic basis. Restaking adds fee income for taking on additional slashing conditions, which is genuinely a paid risk rather than free yield — the correct comparison is against the probability and severity of the slashing event, not against zero. See [Staking and Restaking](/protocols/staking-restaking).

**Stablecoin yield.** Ask what backs the yield. Interest on reserve assets is real and externally paid. Yield generated by a protocol paying its own token, or by leveraging the stablecoin against itself, is the emission case with extra steps and an implicit peg assumption.

**Vaults and auto-compounders.** These automate harvest, sale, and reinvestment, which genuinely improves the APR-to-APY conversion and amortises gas across depositors. They also add a contract layer, a fee, and a strategy you did not write between you and the underlying yield.

---

#### Assumptions and Failure Modes

- **Assumes the quoted APR persists.** It is a spot rate computed from current emissions and current total value locked, both of which move the moment capital responds. Treat it as an instantaneous reading, never as a forecast.
- **Assumes the reward token can be sold at the marked price.** Reward tokens are frequently thinner than the farm that emits them. A position generating meaningful daily rewards can be a meaningful daily share of that token's volume, and the realised sale price then depends on your own impact. See [Slippage](/microstructure/slippage).
- **Assumes rewards are actually claimable.** Vesting schedules, lock-ups, escrowed reward tokens, and claim windows all convert an accrual into a contingent claim. An escrowed token redeemable over months at a penalty is not the token the APR was quoted in.
- **Ignores impermanent loss by default.** Most dashboards report fee and incentive yield only. On a volatile pair, divergence can exceed everything on the revenue line, as step 4 of the worked example shows at a very modest 2%.
- **Assumes gas is negligible.** It is a fixed cost per interaction, so it is a variable rate against position size. Farms that require frequent harvesting have a minimum viable position size, and it is rarely stated.
- **Assumes the contract does not fail.** Every additional protocol in the stack is another set of contracts, another admin key, another oracle dependency. Yields do not compound across layers; risk does. See [Smart Contract Risk](/risk/smart-contract).
- **Assumes the peg, the oracle, and the bridge hold.** Farms built on wrapped, bridged, or synthetic assets carry the failure modes of every component. The yield compensates for the market risk of the pool, not for these.
- **Comparison across farms is a multiple-testing exercise.** Screening hundreds of pools for the highest yield selects for whichever combination of mispricing, unaccounted risk, and reporting error is largest today. See [Multiple Testing](/stat-methods/multiple-testing).

> warning **Yield is compensation for something** If you cannot name the risk being paid for or the counterparty doing the paying, the correct conclusion is not that the yield is free — it is that you have not found the payer yet.

---

#### Code

```python
def apr_to_apy(apr, compounds_per_year=365):
    """Auto-compounding converts a simple rate into a higher effective one.

    Worth computing explicitly: the gap is large at high rates and is
    a common source of apples-to-oranges comparison between farms.
    """
    return (1.0 + apr / compounds_per_year) ** compounds_per_year - 1.0


def emission_apr(annual_emission_value, total_value_locked):
    """Quoted incentive rate is a budget divided by participants.

    It falls as capital arrives, so it describes the present crowd,
    not the rate a new deposit will earn.
    """
    return annual_emission_value / total_value_locked


def net_farm_return(capital, fee_apr, emission_apr_quoted, days,
                    reward_price_change, divergence_loss,
                    gas_total, reward_slippage=0.0):
    """Realised return over a holding period, after every subtraction.

    reward_price_change is the fractional move in the reward token
    between accrual and sale: -0.35 means it fell 35%.
    Returns (absolute_pnl, simple_annualised_rate).
    """
    horizon = days / 365.0
    fee_income = capital * fee_apr * horizon
    rewards_accrued = capital * emission_apr_quoted * horizon
    rewards_realised = rewards_accrued * (1.0 + reward_price_change)
    rewards_net = rewards_realised * (1.0 - reward_slippage)

    pnl = (fee_income + rewards_net
           - capital * divergence_loss
           - gas_total)
    return pnl, (pnl / capital) / horizon


def minimum_viable_size(gas_total, annual_yield_rate, days, drag_budget=0.10):
    """Smallest position for which gas stays under `drag_budget` of gross yield.

    Farms needing frequent harvests have a floor on position size that
    is almost never stated alongside the APR.
    """
    period_yield = annual_yield_rate * days / 365.0
    return gas_total / (drag_budget * period_yield)
```

---

#### See Also

* [Yield Farming Basics](/building-blocks/yield-farming)
* [Staking and Restaking](/protocols/staking-restaking)
* [LP as a Business](/strategies/lp-business)
* [Impermanent Loss](/building-blocks/impermanent-loss)
* [Tokenomics](/building-blocks/tokenomics)
* [Lending and Borrowing](/building-blocks/lending-borrowing)
* [Smart Contract Risk](/risk/smart-contract)

---
