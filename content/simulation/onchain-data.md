### Connecting Simulations to Real On-Chain Data

> info **Metadata** Level: Advanced | Prerequisites: Why Backtest and Simulate?, Event Logs and Decoding, RPC Nodes | Tags: simulation, replay, block-level, fidelity, gas, state-forking

On-chain markets offer something no other asset class does: the complete state transition history is public, and the machine that produced it is deterministic and available to rerun. In principle a simulation can stop approximating and start *replaying* — executing a candidate transaction against the exact state that existed at a chosen block, and reading back the exact output, the exact fee, and the exact gas consumed.

That capability is real and it is narrower than it sounds. Replay gives you perfect fidelity on everything the virtual machine computes and no information at all about the things it does not: where your transaction would have been ordered, how other participants would have responded, and whether the block would have been assembled differently with you in it. The counterfactual problem described in [Why Backtest and Simulate?](/simulation/why-backtest) does not disappear on chain. It relocates, from the fill model into transaction ordering.

---

#### Three Fidelity Tiers

<table>
  <tbody>
    <tr><td><strong>Tier</strong></td><td><strong>Inputs</strong></td><td><strong>Gets right</strong></td><td><strong>Still cannot say</strong></td></tr>
    <tr><td>Synthetic</td><td>Assumed price process, assumed depth and fees</td><td>Distributional behaviour over unlimited paths</td><td>Anything about the actual market that existed</td></tr>
    <tr><td>Historical price replay</td><td>Real price series, modelled execution</td><td>Realised path, realised volatility clustering</td><td>Actual pool depth, actual fee accrual, actual gas</td></tr>
    <tr><td>Block-level state replay</td><td>Real state at each block, executed in a virtual machine</td><td>Exact swap output, fees, reverts, gas consumed</td><td>Ordering, other participants' reactions, block composition</td></tr>
  </tbody>
</table>

The tiers are complements rather than a ladder to climb. A synthetic simulation answers questions about the distribution — what happens across ten thousand paths, most of which never occurred — and no amount of replay can answer that, because history is one path. A replay answers questions about mechanism, calibration and cost with an accuracy no model achieves. Using a replay for a distributional question is the common error: it produces a sample of size one and the confident precision of an exact computation.

> info **Choose the tier from the question, not from available effort** Distribution and tail behaviour need synthetic paths. Cost calibration, revert conditions and mechanism verification need replay. A study needing both usually replays to calibrate the cost model and then simulates using it.

---

#### What Block-Level Replay Actually Does

A replay instantiates a virtual machine whose state is seeded from an archive node at a chosen block, executes your transaction against it, and reports the result. Because the machine is the same one the chain runs, the following are exact rather than modelled:

- **Swap output for your size**, computed along the real curve with the real reserves, including multi-hop routing and every rounding decision the contract makes.
- **Fee accrual** under the protocol's own accounting, including tier selection and any fee-on-transfer behaviour.
- **Revert conditions.** Whether the transaction would have failed at all, and on which requirement — which is exactly the failed-attempt term that price-series backtests silently omit.
- **Gas consumed**, as a unit count, which is the input to the cost calculation below.

Three things remain assumptions, and they are the ones that matter for a competitive strategy.

**Position within the block.** Inserting your transaction at the top of a block gives a different result from inserting it at the bottom, because the state differs by every transaction in between. A replay must choose an insertion index, and that choice is a claim about ordering, not an observation. Assuming the most favourable position is the on-chain form of assuming perfect fills.

**Reaction.** Other participants would have seen your transaction, and some of them exist specifically to respond to it. Replay executes your transaction against a world that never knew about it. For a small trade in a deep pool this is a mild assumption; for a trade that moves the price it is the same invariance assumption that fails in every other market, restated in new vocabulary. See [Slippage, Fees, and Frontrunning](/risk/slippage-frontrunning).

**Block composition.** The block you are inserting into was built by someone optimising its contents. A different transaction set implies a different block, and the transactions you are replaying against might not all have been included.

---

#### Aligning Block Time with Wall Time

Blocks are the chain's clock and they are not a clock in any conventional sense.

A block timestamp is *declared* by the proposer within a protocol-permitted tolerance, not measured. It is monotonic and approximately correct, which makes it fine for daily buckets and unsuitable for sub-minute alignment against an off-chain series. Block intervals are also irregular — variable on some chains, nominally fixed on others but with skipped slots — so a fixed number of blocks is not a fixed span of time, and an indicator computed over "the last 100 blocks" has a window whose length drifts.

Three rules follow, and violating any of them corrupts a study quietly:

- **Join on timestamps with an as-of predicate, never on equality.** Aligning an on-chain series to an exchange series is a backward as-of merge: each on-chain observation takes the most recent off-chain value at or before it. An equality join drops nearly everything; a forward join leaks the future.
- **Resample to a common grid before comparing.** Two irregular series compared point-to-point produce spurious lead-lag structure that is entirely an artefact of sampling. See [Time Series Handling](/data-tooling/time-series).
- **Do not assume a shared clock across chains.** Multi-chain simulations have no common ordering at all. Two events on different chains have no defined sequence beyond their timestamps, which are declared independently by different proposers.

---

#### Real Costs, Especially Gas

A replay reports gas *units*. Converting that into a cost requires the price paid per unit and the value of the native asset:

```text
gas_cost_native    = gas_used * effective_gas_price
gas_cost_numeraire = gas_cost_native * native_asset_price
```

The second line is the one that gets skipped, and skipping it introduces a bias with a definite sign. Both the gas price and the native asset's price rise during volatile periods, and volatile periods are when most strategies transact most. A model using a fixed cost per transaction is therefore optimistic in exactly the states where the strategy is busiest, which is the same structural error as assuming constant spreads in [Why Backtest and Simulate?](/simulation/why-backtest). Both terms must be taken from the historical record at the block, not from a constant.

Two related costs belong in the same calculation. **Reverted transactions** consume gas and produce nothing; a replay is the only way to know which of your intended actions would have reverted, and omitting them understates cost while overstating fill rates. **Priority fees** are set competitively, so a strategy that must be included promptly pays more precisely when block space is contested.

---

#### Code

```python
def replay_candidate_trade(archive, block_number, insertion_index, build_tx):
    """Execute one candidate transaction against real state at a block.

    insertion_index is an assumption dressed as a parameter. State differs by
    every transaction ordered before yours, so sweeping this index and reporting
    the range is more honest than reporting a single favourable position.
    """
    vm = archive.fork_at(block_number, apply_txs_up_to=insertion_index)
    receipt = vm.execute(build_tx(vm.read_state()))
    return {
        "reverted": receipt.reverted,
        "revert_reason": receipt.revert_reason,
        "amount_out": receipt.decoded_output,
        "gas_used": receipt.gas_used,
        "effective_gas_price": receipt.effective_gas_price,
    }


def cost_in_numeraire(receipt, native_price_at_block):
    """Gas is denominated in the native asset, whose price is not a constant.

    A fixed per-transaction cost is optimistic precisely during volatile
    periods -- when gas price and native price both rise, and when most
    strategies trade most.
    """
    gas_native = receipt["gas_used"] * receipt["effective_gas_price"]
    return gas_native * native_price_at_block


def align_onchain_to_offchain(onchain_df, offchain_df):
    """Backward as-of join: each on-chain observation sees only past off-chain data."""
    import pandas as pd
    return pd.merge_asof(
        onchain_df.sort_values("block_timestamp"),
        offchain_df.sort_values("exchange_timestamp"),
        left_on="block_timestamp",
        right_on="exchange_timestamp",
        direction="backward",
    )
```

---

#### The Effort Trade-off

Replay costs are dominated by archive access, since seeding state at a block is the expensive operation and a per-block loop over a long history multiplies it. That cost profile suggests a practical sequencing rather than a choice: establish whether an idea is arithmetically capable of working with a cheap synthetic model, then replay a **sample** of blocks — stratified across calm and volatile regimes rather than drawn contiguously — to calibrate costs, revert rates and slippage, then return to the synthetic model with those parameters for the distributional work.

Sampling matters more than volume here. A thousand blocks spanning several regimes is more informative than a hundred thousand consecutive ones from a quiet week, because the parameters being calibrated are precisely the ones that vary with conditions.

---

#### Assumptions and Failure Modes

- **Assumes state at the block is state at your insertion point.** It is not, unless you specify the index. Replaying against end-of-block state means trading after everything that happened in it.
- **Assumes your transaction changes nothing.** For meaningful size it changes reserves, and therefore what every subsequent transaction in the block would have done.
- **Assumes the archive is canonical.** Archives can retain data from reorganised blocks. Pin block hashes and verify the parent chain, as in [Event Logs and Decoding](/data-tooling/event-logs).
- **Assumes the observed transaction set is the whole story.** It is the set that succeeded and was included. Attempts that reverted or were never included are largely invisible, so competitive intensity is systematically understated.
- **Assumes historical gas prices apply to you.** They reflect the demand that existed. A strategy adding transactions at contested moments raises the price it pays.
- **Assumes replay generalises.** It is one path. Confidence intervals from a replay are confidence intervals about history, not about the future.
- **Assumes protocol behaviour is stable.** Upgradeable contracts change what a replay at an old block tells you about behaviour today, since you are executing code that is no longer deployed.

> warning **Educational content only** This page describes simulation methodology. High replay fidelity establishes what the machine would have computed, not that a strategy would have been profitable.

---

#### See Also

* [Why Backtest and Simulate?](/simulation/why-backtest)
* [Event Logs and Decoding](/data-tooling/event-logs)
* [RPC Nodes](/data-tooling/rpc-nodes)
* [Data Pipeline Replay](/building-simulations/data-pipeline-replay)
* [Data Preparation for Backtests](/simulation/data-prep)
* [Slippage, Fees, and Frontrunning](/risk/slippage-frontrunning)

---
