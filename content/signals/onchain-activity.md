### On-Chain Activity Signals

> info **Metadata** Level: Intermediate | Prerequisites: Feature Engineering, Stationarity, On-Chain Data | Tags: on-chain, signals, features, exchange-flows, attribution, data-quality, defi

A public blockchain publishes its entire state and every state transition. Balances, transfers, contract calls, liquidity depth, collateral positions and their liquidation thresholds are all readable by anyone, in near real time, without a data vendor. No other market has ever offered this. In equities the equivalent would be seeing every account's holdings and every order's origin, continuously.

The temptation is to conclude that this settles the signal problem. It does not, and the reason is worth stating precisely: a blockchain gives perfect observation of *addresses*, and almost nothing in finance is about addresses. It is about entities, intentions, and economic exposure — none of which an address reliably represents. Most disappointment with on-chain signals traces to that single gap, and the useful work in this field is largely the work of closing it.

---

#### What the Data Actually Contains

Five families of feature are routinely constructed. They differ enormously in quality, and grouping them by how directly they measure something economic is more useful than grouping them by how they are computed.

**Protocol state.** Lending market utilisation, the distribution of health factors across borrowers, collateral composition, and the exact price at which each position becomes liquidatable. This is the strongest category by some margin. It is not a proxy for anything — it is a direct reading of forced-seller supply at each price level, computable from contract storage with no labelling assumptions. Nothing comparable exists off-chain. See [Liquidations](/building-blocks/liquidations).

**Automated market maker state.** Full liquidity depth at every price, fee tier by fee tier, position by position. The on-chain equivalent of a complete order book, with the useful property that it is passive and therefore does not disappear when queried. See [Concentrated Liquidity](/protocols/concentrated-liquidity).

**Supply and bridge flows.** Stablecoin mints and burns are issuer operations, individually attributable, representing capital entering or leaving through a regulated pipe — strong measurement, though what it measures is treasury plumbing as much as investor demand. Bridge flows are observable on both sides and useful for tracking where activity migrates, but are heavily distorted by incentive campaigns.

**Exchange flows.** Transfers to and from addresses believed to belong to centralised venues. Popular, intuitive, and **entirely dependent on a labelling database that is a third-party estimate**. Quality varies from good to worthless with no in-band indication of which.

**Address-derived metrics.** Active addresses, new addresses, transaction counts, gas consumed, holder concentration, top-holder shares. The most widely quoted family and the weakest. Addresses are free to create, so any metric counting them measures the cost of creation as much as adoption — and the largest balances are usually custodians, bridges, and contracts rather than holders.

---

#### Formal Definition

Raw on-chain series are almost never usable as features. Three transformations are near-mandatory.

**Stationarity.** Adoption metrics trend, so their level carries a growth component that swamps any short-horizon information. Work in logs and differences, or in ratios to a contemporaneous scale variable:

```text
level_t     = ln(raw_t)
change_t    = level_t - level_(t-k)
z_t         = (change_t - mean_N(change)) / sd_N(change)
```

See [Stationarity](/quant-math/stationarity) and [Unit Roots](/stat-methods/unit-roots).

**Scale normalisation.** An absolute flow is uninterpretable without a denominator. Two are standard and they answer different questions:

```text
supply_share_t = netflow_t / circulating_supply_t
volume_share_t = netflow_t / trailing_average_volume_t
```

The first asks how much of the asset moved; the second asks whether the move is large relative to the market's capacity to absorb it. The second is usually the more relevant to price.

**Netflow and concentration.** Exchange netflow is `inflow_to_labelled_t - outflow_from_labelled_t`, summing transfers into and out of the addresses in a venue label set. Positive netflow means tokens arriving at venues, conventionally read as prospective selling — a reading that assumes the labels are right *and* that arriving tokens are there to be sold, neither of which is guaranteed. Concentration uses a Herfindahl-style index over balance shares `s_i`:

```text
HHI_t = sum over i of s_i^2

effective_holders_t = 1 / HHI_t
```

The reciprocal is the more legible form: a distribution of 40, 25, 15, 10, 5, 3, 2 percent has an HHI of 0.259 and about **3.9 effective holders**, against 6.9 for a near-even split of the same seven. The metric is only as meaningful as the assumption that one address is one holder.

---

#### Worked Example: How a Signal Evaporates

An illustrative exchange-netflow reading. All figures are constructed to demonstrate the mechanism.

<table>
  <tbody>
    <tr><td><strong>Input</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>30-day mean daily netflow</td><td>+1,200 tokens</td></tr>
    <tr><td>30-day standard deviation</td><td>4,500 tokens</td></tr>
    <tr><td>Today's observed netflow</td><td>+16,000 tokens</td></tr>
    <tr><td>Circulating supply</td><td>120,000,000 tokens</td></tr>
    <tr><td>Trailing average daily volume</td><td>900,000 tokens</td></tr>
  </tbody>
</table>

1. **Z-score**: `(16,000 - 1,200) / 4,500 = 3.29` — a 3.3-sigma inflow, the kind of reading that appears in commentary as a warning
2. **As a share of supply**: `16,000 / 120,000,000 = 1.33` basis points
3. **As a share of daily volume**: `16,000 / 900,000 = 1.78%`

Steps 2 and 3 already deflate the story considerably. A flow worth under 2% of a day's volume is not obviously capable of moving anything, whatever its z-score against its own history. **A large deviation from a small series is still a small number**, and the z-score deliberately discards the information needed to see that.

Now the attribution problem. Suppose 12,000 of the 16,000 came from a single address later identified as the exchange's own cold-to-hot wallet rebalancing — an internal transfer, economically nothing.

4. **Corrected netflow**: `16,000 - 12,000 = 4,000`
5. **Corrected z-score**: `(4,000 - 1,200) / 4,500 = 0.62`
6. **Corrected share of volume**: `0.44%`

A 3.3-sigma event became a 0.6-sigma non-event on a single label correction. Nothing about the chain data changed — every transfer was recorded correctly and observed correctly. What changed was an assumption about what one address means, and the label set that encodes that assumption is maintained by someone else, updated on their schedule, and revised without notice.

This is the general shape of the problem. **The chain data is exact; the interpretation layer is an estimate, and the estimate is where all the error lives.** Any research process that treats a labelled on-chain dataset as ground truth has quietly imported a third party's judgement as a hard constraint.

---

#### What Is Genuinely Informative, and What Is Noise

<table>
  <tbody>
    <tr><td><strong>Feature</strong></td><td><strong>Assessment</strong></td></tr>
    <tr><td>Liquidation ladder from lending state</td><td>Strong. Directly measures forced supply at known prices. No labelling needed.</td></tr>
    <tr><td>AMM liquidity depth by price</td><td>Strong. Exact and complete. Measures capacity to absorb flow.</td></tr>
    <tr><td>Stablecoin mint and burn</td><td>Moderate. Attributable and hard to fake, but measures issuer operations too.</td></tr>
    <tr><td>Lending utilisation</td><td>Moderate. Real, but reacts to rate mechanics as much as to demand.</td></tr>
    <tr><td>Exchange netflows</td><td>Weak to moderate. Entirely dependent on label quality, which is unobservable.</td></tr>
    <tr><td>DEX volume</td><td>Weak. Includes arbitrage, routing hops, and wash volume from incentives.</td></tr>
    <tr><td>Active address and transaction counts</td><td>Weak. Trivially inflated; dominated by bots, airdrop farming, and fee-regime changes.</td></tr>
    <tr><td>Whale concentration</td><td>Weak. Largest balances are usually custodians, bridges and contracts.</td></tr>
  </tbody>
</table>

The pattern is consistent and it has an explanation. **Features derived from contract state are strong; features derived from address behaviour are weak.** Contract state is what it is — a lending position's collateral and threshold are the position. Address behaviour requires a theory of who is behind the address, and that theory is where the assumptions accumulate.

---

#### Three Structural Problems

**Attribution.** One entity controls many addresses, and one address can custody many entities. Sybil address generation is free and rationally motivated by airdrop distribution — an illustrative campaign showing 10,000 participating addresses might resolve to 1,200 funding-graph clusters, an average of 8.3 addresses per actual participant. Clustering heuristics that work on UTXO chains, such as common-input ownership, largely do not transfer to account-based chains. Smart contract wallets, account abstraction, and intent-solver architectures sever the address-to-user link entirely: the address that executes a trade may belong to a solver who never held a view. See [Wallet Analytics](/data-tooling/wallet-analytics).

**Short and non-comparable history.** A few years of data, spanning one or two cycles, during which the measurement surface itself changed repeatedly. Activity migrating to a layer two makes base-layer activity fall while economic activity rises; a fee-mechanism change alters gas metrics without altering behaviour; a protocol upgrade changes event schemas so a feature's definition silently shifts mid-series. These are structural breaks in the *instrument*, not in the market, and they do not announce themselves.

**Multiple testing.** On-chain data invites wide searches: dozens of metrics, several transforms each, several horizons. Twenty-five metrics by four transforms by five horizons is 500 tests. At a 5% threshold that is **25 expected false positives** even if nothing is informative, and the probability of at least one apparent discovery is essentially certain. Against roughly 49 independent observations in four years of daily data with monthly features, this is not a search that can distinguish signal from noise. See [Multiple Testing](/stat-methods/multiple-testing) and [ML Pitfalls](/ml-finance/ml-pitfalls).

> warning **A public ledger removes data cost, not inference cost** Free and complete data lowers the barrier to searching, which makes false discovery easier rather than harder. The scarce resource was never the data.

---

#### In Practice

**As risk features rather than return features.** The strong categories all describe market fragility — how much forced selling exists, how deep the liquidity is, how concentrated the holdings are. These are inputs to sizing and scenario analysis, where they can be useful without needing to predict direction. See [Scenario Analysis](/simulation/scenarios).

**As conditioning variables.** Combining a weak on-chain feature with a price-based signal as an interaction term demands far less of the on-chain series than using it standalone, because it only has to be informative about *when* the other signal works. See [Feature Engineering](/ml-finance/feature-engineering).

**Reconstruct rather than consume.** A feature computed from raw event logs against a node you control has known provenance and a definition that does not change without your knowledge; a feature pulled from a vendor's labelled dataset has neither. That is the difference between a signal you can debug and one you can only trust. Respect the reorganisation boundary too: recent blocks can be reorganised, so a feature computed at the chain tip is provisional, and a backtest built on finalised history is testing a different series from the one it will trade. See [Event Logs](/data-tooling/event-logs), [RPC Nodes](/data-tooling/rpc-nodes), [Dune Analytics](/data-tooling/dune-analytics) and [The Graph](/data-tooling/the-graph).

---

#### Assumptions and Failure Modes

- **Assumes one address is one economic actor.** It is neither necessary nor sufficient. This single assumption underlies active addresses, holder concentration, whale tracking, and every sybil-sensitive metric.
- **Assumes labels are correct and current.** Exchange address sets are third-party estimates that lag rotations and miss internal transfers. Step 4 of the worked example is the entire risk in one line.
- **Assumes an observed transfer implies an intention.** Tokens moving to a venue may be posted as collateral, moved for custody, or bridged onward. The inference from movement to selling is a behavioural assumption, not an observation.
- **Assumes the measurement surface is stable.** Layer-two migration, fee mechanism changes, contract upgrades, and new standards all break comparability in ways that look like signal.
- **Assumes the series is stationary after transformation.** Adoption trends, incentive campaigns, and regime shifts leave structure that a rolling z-score does not remove and can actively disguise.
- **Assumes the signal is not a target.** Metrics that attract capital attract manufacture. Wash trading to inflate DEX volume, address generation to inflate activity, and circular deposits to inflate total value locked are all cheap and all rational when someone is trading on the number.
- **Assumes size is irrelevant.** Steps 2 and 3 are the corrective. A statistically extreme flow that is economically trivial is a common outcome of z-scoring a small series.
- **Assumes the data pipeline is deterministic.** Decimal handling, reorganisations, failed transactions, internal transfers, and proxy upgrades all silently change a series. See [Data Cleaning](/data-tooling/cleaning).

---

#### Code

```python
import numpy as np
import pandas as pd


def stationary_feature(raw_series, diff_periods=7, window=90):
    """Log-difference then standardise. Raw on-chain levels trend with
    adoption, so their level is mostly growth and not information.
    """
    level = np.log(raw_series.clip(lower=1e-12))
    change = level.diff(diff_periods)
    rolling = change.rolling(window)
    return (change - rolling.mean()) / rolling.std(ddof=1)


def netflow_features(inflow, outflow, circulating_supply,
                     trailing_volume):
    """Exchange netflow with both denominators.

    The z-score says whether the flow is unusual for this series; the
    volume share says whether it is large enough to matter. Report both:
    a 3-sigma flow worth 1% of a day's volume is not a market event.
    """
    netflow = inflow - outflow
    rolling = netflow.rolling(30)
    return pd.DataFrame({
        "netflow": netflow,
        "zscore": (netflow - rolling.mean()) / rolling.std(ddof=1),
        "supply_share": netflow / circulating_supply,
        "volume_share": netflow / trailing_volume,
    })


def effective_holders(balances):
    """Reciprocal Herfindahl index over balance shares.

    Only as meaningful as the assumption that one address is one holder,
    which custodians, bridges and contracts all violate.
    """
    shares = np.asarray(balances) / np.sum(balances)
    return 1.0 / np.sum(shares**2)


def liquidation_ladder(positions, price_grid):
    """Collateral forced to market at each candidate price.

    The strongest on-chain feature family: computed from contract state,
    needs no address labelling, and measures supply rather than sentiment.

    positions: iterable of (collateral_units, liquidation_price).
    """
    return np.array([
        sum(units for units, trigger in positions if price <= trigger)
        for price in price_grid
    ])
```

---

#### See Also

* [Feature Engineering](/ml-finance/feature-engineering)
* [Event Logs](/data-tooling/event-logs)
* [Wallet Analytics](/data-tooling/wallet-analytics)
* [Dune Analytics](/data-tooling/dune-analytics)
* [What Is a Signal](/signals/what-is-signal)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Stationarity](/quant-math/stationarity)

---
