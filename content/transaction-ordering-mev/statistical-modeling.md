### Statistical Modeling

> info **Metadata** Level: Advanced | Prerequisites: Quantitative Impacts, Hypothesis Testing, Autocorrelation | Tags: mev, measurement, base-rates, selection-bias, bootstrap, identification

Blockchain data is unusually complete: every included transaction, its position, and its effects are permanently available to anyone. That completeness invites a mistake. Because the record looks exhaustive, analysts treat measured extraction as a census rather than as a sample, and skip the identification work they would do without hesitation on any other dataset.

It is not a census. The chain records what was *included*, which is the output of a selection process; it records what a heuristic *classifies* as extraction, which is the output of a fallible detector; and it records only the legs that settled on-chain, which for several important strategies is not all of them. This page is about getting a defensible number out of that, and about knowing which number you got.

---

#### Defining the Quantity

Two quantities are routinely conflated. **Extractable value** is a maximum over admissible orderings, measured against a reference ordering — the definition developed in [the section overview](/transaction-ordering-mev). **Realised extraction** is what a specific chosen ordering actually produced:

```text
REV(B) = sum over identified extractive sequences in B of
         (value_out - value_in - gas_paid)
```

where:

- `B` is a block
- an *identified extractive sequence* is a set of transactions your classifier labels as one extraction attempt
- values are converted to a common numeraire at a stated reference price

The relationship between them is an inequality, not an approximation:

```text
REV(B) <= EV(B, pi_ref)
```

The realised ordering is one admissible ordering, so what it produced cannot exceed the maximum over all of them. `REV` is therefore a lower bound on extractable value and, separately, a lower bound on user cost — as the worked example in [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts) shows, a material share of what a user loses ends up as fee revenue rather than as extractor profit.

> warning **Report which quantity you computed** "MEV" without a qualifier is ambiguous between an upper bound on what was available, a lower bound on what was taken, and a middle figure describing what users paid. Papers and dashboards disagree less than they appear to; they are often measuring different objects.

---

#### Worked Example: What a Detector Actually Measures

Sandwiches are identified heuristically — an opposite-direction pair from one party, bracketing a third party's swap in the same pool in the same block. The heuristic is good. It is not perfect, and imperfection interacts badly with a low base rate.

All figures below are constructed to make the arithmetic legible. Take a sample of 100,000 swaps in which the true incidence of sandwiching is 2%, and a detector with **sensitivity 0.90** (it catches 90% of real sandwiches) and **specificity 0.98** (it correctly clears 98% of innocent swaps).

<table>
  <tbody>
    <tr><td></td><td><strong>Truly sandwiched</strong></td><td><strong>Not sandwiched</strong></td><td><strong>Total</strong></td></tr>
    <tr><td><strong>Flagged</strong></td><td>1,800</td><td>1,960</td><td>3,760</td></tr>
    <tr><td><strong>Not flagged</strong></td><td>200</td><td>96,040</td><td>96,240</td></tr>
    <tr><td><strong>Total</strong></td><td>2,000</td><td>98,000</td><td>100,000</td></tr>
  </tbody>
</table>

1. **True positives**: `0.90 * 2,000 = 1,800`.
2. **False positives**: `(1 - 0.98) * 98,000 = 1,960`. There are 49 innocent swaps for every guilty one, so even a 2% error rate on the innocent majority produces more false alarms than true catches.
3. **Measured incidence**: `3,760 / 100,000 = 3.76%`, against a truth of 2.00% — an overstatement of 88%.
4. **Precision**: `1,800 / 3,760 = 47.9%`. Fewer than half the flagged cases are real.

The general relation is:

```text
observed_rate = sens * pi + (1 - spec) * (1 - pi)
```

which inverts to the standard prevalence correction:

```text
pi_hat = (observed_rate + spec - 1) / (sens + spec - 1)
```

Applying it: `(0.0376 + 0.98 - 1) / (0.90 + 0.98 - 1) = 0.0176 / 0.88 = 0.02`, recovering the truth exactly. The correction needs an independent estimate of `sens` and `spec`, which means hand-labelling a sample — the step most analyses skip.

The bias worsens as the phenomenon gets rarer. At a true incidence of 0.5% with the same detector, true positives fall to 450 while false positives rise to 1,990: measured incidence of 2.44% against 0.5% truth, an overstatement of nearly fivefold, and precision of 18.4%.

---

#### The Identification Problems

- **Intent is not observable.** Two trades bracketing a third can be a sandwich, or a market maker quoting both sides, or coincidence in a busy pool. The chain records positions, not purposes, and no amount of data resolves this without an assumption.
- **The reference ordering is normative.** Extraction is defined relative to a counterfactual sequence that the protocol never specified. Different plausible references give different answers, and the difference is not noise — it is a different question.
- **Actors are addresses, not entities.** Address clustering is itself a fallible classifier, and its errors compound with the detector's. Vertically integrated operations move value through internal accounting that never appears as a transfer.
- **Some legs are off-chain.** Non-atomic strategies — CEX-DEX arbitrage above all — settle one leg somewhere the chain cannot see. On-chain data shows the trade and not the profit, so any on-chain-only estimate omits a category rather than measuring it imprecisely.
- **The denominator is a choice.** Extraction per block, per unit of volume, per active user, and per unit of liquidity move independently and tell different stories. State the denominator or the number means nothing.

---

#### Selection and Censoring

The observed sample is the winners' sample, and this biases several quantities in the same direction.

- **Losing bundles leave no trace.** Bundles that lost the auction were never included, so any estimate of competition built from on-chain data counts only successes. Attempt counts are unobservable, which makes success *rates* unidentifiable from the chain alone.
- **Reverted attempts are inconsistently visible.** Where revert protection is used the failure is invisible; where it is not, the failure is on-chain. Whether a failure is observable therefore depends on the extractor's submission choices, which correlate with sophistication — a textbook non-random missingness pattern.
- **Profit per attempt is inflated.** Averaging profit across observed extractions conditions on success. The expected profit of an *attempt* is lower by whatever the failure rate is, and that rate is exactly what you cannot see.
- **Competition depresses margin without reducing incidence.** As bidding intensifies, more of the extracted value flows to builders and proposers and less is retained by searchers. A series of searcher margins trending to zero is fully consistent with user cost being flat. Measuring the wrong side of the ledger produces the wrong conclusion.

---

#### Base Rates, Clustering, and Tails

Three properties of extraction data break standard inference.

**Opportunities cluster.** Arbitrage and liquidation opportunities are generated by price movement, and price movement is autocorrelated in magnitude. Extraction events therefore arrive in bursts, and treating blocks as independent draws produces standard errors that are far too small. Use a block bootstrap with a block length exceeding the autocorrelation horizon — see [Bootstrap](/stat-methods/bootstrap) and [Autocorrelation](/quant-math/autocorrelation).

**Value per event is heavy-tailed.** A small number of events dominate any sum, so the sample mean is unstable and a longer sample does not obviously help: adding data adds tail draws. Report the distribution — median, upper quantiles, and the share contributed by the largest few events — rather than a mean alone.

**Feature searches are multiple tests.** Hunting for predictors of extraction across many candidate features, pools, and windows will find apparently significant relationships in data with no structure at all. Apply the corrections in [Multiple Testing](/stat-methods/multiple-testing), and treat an in-sample relationship as a hypothesis until it survives out-of-sample — the discipline of [Backtest vs Live](/risk/backtest-vs-live) applies unchanged.

---

#### Assumptions and Failure Modes

- **Detector performance is assumed known.** Sensitivity and specificity must come from a hand-labelled sample; assuming them defeats the point of the correction. They also drift as strategies evolve, so a detector calibrated on one period is miscalibrated on another.
- **The correction assumes constant performance across strata.** Applying one pair of rates to pools with very different liquidity, or to periods with different congestion, will bias the corrected estimate in ways the formula cannot flag.
- **Node coverage is partial.** Mempool-based analysis depends on what your node saw. Different vantage points observe different pending sets, and transactions routed privately were never in any mempool. Mempool-derived arrival times are observations of your node, not of the network.
- **Prices used for conversion are themselves contested.** Valuing multi-asset flows requires a price at a moment inside a block. The choice of source and timestamp is a modelling decision that propagates into every aggregate.
- **Simulation-based counterfactuals inherit their model.** Re-simulating a block under a different ordering assumes every contract behaves as modelled and that no participant would have behaved differently — an assumption that fails precisely for the strategic actors whose behaviour you are measuring.
- **The absence of detected extraction is weak evidence.** A pool with no flagged events may be uncontested, or may be contested by a strategy your heuristic does not describe.

---

#### Code

```python
import numpy as np


def corrected_prevalence(observed_rate, sensitivity, specificity):
    """Rogan-Gladen correction for an imperfect detector.

    Returns the estimated true rate. Can fall outside [0, 1] when the
    observed rate is inconsistent with the stated detector performance,
    which is a useful signal that the calibration is wrong.
    """
    denominator = sensitivity + specificity - 1
    if denominator <= 0:
        return np.nan  # detector is no better than chance
    return (observed_rate + specificity - 1) / denominator


def block_bootstrap_mean(series, block_length, n_draws=10_000, seed=0):
    """Bootstrap the mean of a clustered series.

    Sampling contiguous blocks preserves the burst structure that
    i.i.d. resampling destroys, so the interval is not falsely tight.
    """
    rng = np.random.default_rng(seed)
    values = np.asarray(series)
    n_blocks = int(np.ceil(len(values) / block_length))
    starts_max = len(values) - block_length

    means = np.empty(n_draws)
    for i in range(n_draws):
        starts = rng.integers(0, starts_max + 1, size=n_blocks)
        sample = np.concatenate([values[s:s + block_length] for s in starts])
        means[i] = sample[:len(values)].mean()
    return means


corrected_prevalence(0.0376, 0.90, 0.98)  # 0.02
```

---

#### See Also

* [Quantitative Impacts](/transaction-ordering-mev/quantitative-impacts)
* [Transaction Ordering & MEV](/transaction-ordering-mev)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Bootstrap](/stat-methods/bootstrap)
* [Backtest vs Live](/risk/backtest-vs-live)
* [On-Chain Data in Backtests](/simulation/onchain-data)

---
