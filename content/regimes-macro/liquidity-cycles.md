### Liquidity Cycles

> info **Metadata** Level: Intermediate | Prerequisites: Leverage, Market Microstructure, Market Regimes | Tags: regimes, liquidity, funding, leverage, deleveraging, reflexivity

"Liquidity" names two different things that are usually discussed as one. **Market liquidity** is the ability to trade size without moving the price — a property of an order book, a dealer's inventory, or a pool's depth. **Funding liquidity** is the ability to finance a position — a property of a balance sheet, a repo desk, or a lending protocol's collateral rules. Confusing them obscures the most important fact about both: each is the other's cause.

A trader can only provide market liquidity if he can fund the inventory he takes on. If funding tightens, he provides less, so market liquidity falls. Falling market liquidity raises measured volatility, which raises the haircuts lenders demand, which tightens funding further. The loop runs in both directions and is slow in one and fast in the other. That asymmetry — leverage accumulates over quarters and unwinds over days — is what makes liquidity a regime variable rather than a fluctuation, and it is why liquidity conditions are one of the few macro states that can be partly observed before they show up in returns.

---

#### The Two Liquidities

<table>
  <tbody>
    <tr>
      <td><strong></strong></td><td><strong>Market liquidity</strong></td><td><strong>Funding liquidity</strong></td>
    </tr>
    <tr>
      <td>Question answered</td><td>Can I sell this without moving the price?</td><td>Can I hold this position at all?</td>
    </tr>
    <tr>
      <td>Common proxies</td><td>Bid-ask spread, depth, Amihud measure, realised impact</td><td>Haircuts, margin requirements, secured-unsecured spreads, borrow availability</td>
    </tr>
    <tr>
      <td>Timescale</td><td>Seconds to days</td><td>Weeks to quarters, then hours</td>
    </tr>
    <tr>
      <td>Fails by</td><td>Depth withdrawing, spreads widening</td><td>Haircuts rising, credit lines pulled</td>
    </tr>
  </tbody>
</table>

**A standard market-liquidity proxy.** The Amihud illiquidity measure is the average price move per unit of traded value:

```text
ILLIQ = mean over days of ( |R_d| / Value_d )
```

where `R_d` is the day's return and `Value_d` the day's traded value. Higher means each unit of volume moves the price more, which is exactly what illiquidity is. It is crude, but it is computable from data everyone has, and it is comparable across time for a single instrument.

**The funding constraint.** For a levered holder facing a haircut `h` (the fraction of an asset's value that must be funded with the holder's own capital):

```text
max assets = equity / h

max leverage = 1 / h
```

At a 10% haircut, one unit of equity supports ten units of assets. The haircut is the single most important number in a funding regime, and it is set by the lender, not the borrower.

> info **Leverage is a description of the loss multiplier** A position levered `L` times turns a 1% move in the assets into an `L`% move in the equity. Everything in the worked example below is a consequence of that one identity.

---

#### Worked Example: The Deleveraging Spiral

A holder has 1,000 of assets funded with 100 of equity and 900 of borrowing. The haircut is 10%, so the position is exactly at the constraint: `100 / 0.10 = 1,000`.

Conditions deteriorate and the lender doubles the haircut to 20%.

**Step 1 — the mechanical requirement, at unchanged prices.**

```text
maximum assets now = 100 / 0.20 = 500
required sale      = 1,000 - 500 = 500
```

Half the book must go, from a haircut change alone. No price has moved yet.

**Step 2 — the sale moves prices.** Suppose the selling depresses the mark on the entire book by 5%.

```text
assets            = 1,000 * 0.95 = 950
equity            = 950 - 900    =  50      (the debt does not fall)
maximum assets    = 50 / 0.20    = 250
required sale     = 950 - 250    = 700
```

The requirement grew from 500 to 700. The act of meeting it made it larger. Note where the damage lands: assets fell 5%, but equity fell 50%, because leverage amplifies the mark-to-market move by the leverage ratio.

**Step 3 — the boundary.** At a 10% mark-down, assets are 900 and the debt is still 900, so equity is zero and the whole position is at risk. A 10% decline wipes out a position levered ten times. This is arithmetic, not a scenario — it is the definition of 10x leverage.

<table>
  <tbody>
    <tr>
      <td><strong>Mark-down</strong></td><td><strong>Assets</strong></td><td><strong>Equity</strong></td><td><strong>Max assets at h = 20%</strong></td><td><strong>Must sell</strong></td>
    </tr>
    <tr>
      <td>0%</td><td>1,000</td><td>100</td><td>500</td><td>500 (50%)</td>
    </tr>
    <tr>
      <td>5%</td><td>950</td><td>50</td><td>250</td><td>700 (74%)</td>
    </tr>
    <tr>
      <td>10%</td><td>900</td><td>0</td><td>0</td><td>900 (100%)</td>
    </tr>
  </tbody>
</table>

Now hold this picture and add the crowding problem: every holder with a similar position faces the same haircut change at the same moment and sells the same assets into the same book. The 5% mark-down assumed above is not exogenous — it is produced by the aggregate of these sales.

---

#### Reflexivity: Why the Loop Closes

The spiral has a well-known formal structure, usually described as the interaction of margin and loss spirals:

1. **Losses reduce equity.** Levered holders lose more than the asset move, by the leverage ratio.
2. **Reduced equity forces sales.** Positions must shrink to fit the remaining capital.
3. **Sales move prices.** The more crowded the position and the thinner the book, the more they move.
4. **Price moves raise measured volatility.** Volatility is the input to almost every risk model and margin methodology.
5. **Higher volatility raises haircuts.** Risk-based margin is mechanically procyclical: it demands more capital exactly when capital is scarcest.
6. **Higher haircuts reduce the position each unit of equity can support.** Return to step 2.

Each individual link is rational and often contractually mandated. The system-level result is that a small shock can produce a large, self-reinforcing move — and that the same mechanism runs in reverse on the way up, with falling volatility permitting more leverage, which suppresses volatility further.

> warning **Risk-based margin is procyclical by construction** A margin model that responds to realised volatility will always tighten into a selloff. It is not a flaw in any particular model; it is what "risk-based" means. Any strategy relying on continuous access to leverage should assume its own funding terms deteriorate in the states where its positions are losing.

---

#### Why It Is a Slow-Moving Regime Variable

Leverage is built through many small decisions taken over long periods, each individually reasonable: a slightly larger position because volatility has been low, a marginally looser haircut because the risk model saw a quiet year. None is a discrete event, so nothing triggers a detector. This gives liquidity conditions three properties useful for regime work:

- **High persistence.** The funding regime rarely reverses within days. Estimated persistence in a [Markov switching model](/regimes-macro/markov-switching) fitted to funding-condition proxies is usually much higher than for return-based states.
- **Partial observability.** Unlike a latent volatility regime, the build-up leaves traces: open interest, margin debt, secured-unsecured funding spreads, collateral haircuts. These are noisy and incomplete, but they are not purely inferred from prices.
- **Asymmetric speed.** The accumulation phase can be tracked with a slow-moving indicator. The unwind cannot — it is faster than any detector's delay. See [Changepoint Detection](/regimes-macro/changepoint-detection).

The practical implication is that liquidity is better used as a *conditioning* variable than as a *timing* one. Knowing the system is highly levered does not say when it will unwind, but it does say what the loss distribution looks like if it does.

---

#### In Practice Across Asset Classes

**Equities.** Market liquidity is visible in spread and depth, and both deteriorate with volatility. Funding shows up in securities-lending availability and borrow cost; a rising cost to borrow a name is a funding-liquidity signal, not a fundamental one. See [Short Selling](/markets/short-selling).

**Rates.** Government bond markets are usually the deepest available, which is precisely why they are sold first when cash is needed. Liquidity stress can therefore appear in the safest asset before it appears in the riskiest one, inverting the usual ordering.

**FX.** Liquidity is concentrated in the major pairs and evaporates in less traded ones. Cross-currency basis is a direct read on the cost of funding one currency against another, and widens when funding is scarce.

**Commodities.** Physical constraints mean funding and storage interact. A holder who cannot fund inventory must sell it physically, and warehousing capacity puts a hard floor under how fast that can happen.

**Credit.** The most exposed of the traditional asset classes, because market liquidity is dealer-intermediated and dealer inventory is itself funded. When dealers cannot fund inventory, they stop bidding, and the market does not merely widen — it stops quoting.

**On-chain markets.** The mechanism is unusually explicit and fully observable. Collateral factors are published parameters rather than negotiated terms, liquidations are executed by open bots against public thresholds, and pool depth is queryable at every block. The cascade is the one described above running in minutes rather than days, and liquidation incentives make the forced selling profitable for a third party and therefore reliably fast. Funding rates on [perpetual futures](/building-blocks/perpetual-futures) are a continuously published price of levered directional exposure, with no traditional-market equivalent. See [Liquidations](/building-blocks/liquidations), [Leverage and Liquidation](/risk/leverage-liquidation), [Lending Architecture](/protocols/lending-architecture), and [Liquidity](/signals/liquidity).

---

#### Assumptions and Failure Modes

- **Observed depth is available depth.** Displayed liquidity can be withdrawn faster than it can be consumed. Book depth measured in calm conditions systematically overstates what will be there when you need it.
- **Impact is linear in size.** It is not, especially past the visible depth. Impact models calibrated on normal-size trades understate the cost of liquidating a position that is large relative to the book. See [Market Impact](/execution/market-impact).
- **Funding terms are stable.** Haircuts, credit lines, and collateral eligibility are revocable, often on short notice. A strategy's viability can change without any market price changing.
- **Your position is uncorrelated with everyone else's.** Crowding is the amplifier in every step of the spiral. A position is liquid only if others are not exiting it simultaneously.
- **Liquidity proxies measure liquidity.** Amihud and its relatives are ratios of price move to volume, and both terms move for reasons unrelated to liquidity. Treat them as noisy and directional, not as levels.
- **Backtests reflect execution cost.** Filling at the mid-price assumes infinite liquidity at all times, which is precisely wrong in the states that determine the tail. See [Backtest vs Live](/risk/backtest-vs-live) and [Slippage](/microstructure/slippage).

---

#### Code

```python
def deleveraging_requirement(assets, debt, new_haircut, mark_down=0.0):
    """How much must be sold to satisfy a haircut, given a mark-down.

    The mark-down is not exogenous - the forced selling produces it -
    so iterate over a range rather than trusting a single figure.
    """
    marked_assets = assets * (1.0 - mark_down)
    equity = marked_assets - debt
    if equity <= 0:
        return marked_assets            # equity gone; the whole position is at risk
    max_assets = equity / new_haircut
    return max(0.0, marked_assets - max_assets)


def amihud_illiquidity(returns, traded_values):
    """Average absolute return per unit of traded value.

    Scale-dependent, so only compare an instrument against its own history.
    """
    ratios = [abs(r) / v for r, v in zip(returns, traded_values) if v > 0]
    return sum(ratios) / len(ratios)
```

---

#### See Also

* [Correlation Breakdown](/regimes-macro/correlation-breakdown)
* [Macro Factors](/regimes-macro/macro-factors)
* [Rates and Inflation Regimes](/regimes-macro/rates-and-inflation)
* [Leverage and Liquidation](/risk/leverage-liquidation)
* [Market Impact](/execution/market-impact)
* [Liquidity](/signals/liquidity)
* [Slippage](/microstructure/slippage)

---
