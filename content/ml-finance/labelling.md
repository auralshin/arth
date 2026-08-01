### Labelling: Defining What the Model Predicts

> info **Metadata** Level: Intermediate | Prerequisites: Returns, Volatility, Feature Engineering | Tags: machine-learning, labelling, triple-barrier, sample-weights, supervised-learning

Every supervised model needs a target. In most domains the target is given — the image is a cat or it is not. In finance the target is *constructed*, and the construction is a modelling choice with more influence on the result than the choice of algorithm. Two teams with identical features and identical models will reach opposite conclusions if one labels a five-day forward return and the other labels which of a profit target and a stop was touched first.

The reason is that the label defines the question. A five-day forward return asks "where will the price be in five days?", which is a question no trading strategy actually poses, because no strategy holds blindly for five days through arbitrary drawdown. A barrier-based label asks "if I opened this position with this stop and this target, which would I have hit?", which is the question a strategy poses. The second label is harder to compute and produces a model that is directly actionable.

---

#### The Fixed-Horizon Problem

The naive label is the sign of the return over a fixed horizon `h`:

```text
y_t = sign(P_{t+h} / P_t - 1)
```

Three things are wrong with it. **It ignores the path**: a position that fell 8% before recovering to close 0.5% up is labelled `+1`, identical to one that rose steadily, though any real position with a stop would have been closed at the bottom. **The horizon is arbitrary and volatility-blind**: a 1% move over five days is unremarkable for a high-volatility instrument and a large event for a low-volatility one, so a fixed threshold applied across instruments or regimes labels mostly volatility rather than information. **And it produces near-balanced noise**: with a threshold of zero, roughly half the labels are `+1` by construction; with a threshold band, most become `0` and the classes go severely imbalanced.

---

#### The Triple-Barrier Method

The **triple-barrier method** labels each observation by which of three barriers the price path touches first: an upper barrier (profit target), a lower barrier (stop loss), and a vertical barrier (a time limit). The horizontal barriers are set as multiples of an estimate of the instrument's volatility at entry, so they adapt across instruments and regimes.

```text
upper_t = P_t * (1 + pt_mult * sigma_t)
lower_t = P_t * (1 - sl_mult * sigma_t)
t_vertical = t + max_bars

y_t = +1   if the upper barrier is touched first
y_t = -1   if the lower barrier is touched first
y_t =  0   if the vertical barrier is reached first
```

where:

- `P_t` is the entry price at bar `t`
- `sigma_t` is a trailing estimate of per-bar volatility, computed with data up to `t` only
- `pt_mult`, `sl_mult` are the profit-target and stop-loss multipliers
- `max_bars` is the holding-period limit

Symmetric multipliers (`pt_mult = sl_mult`) produce a label about direction. Asymmetric multipliers encode a payoff preference into the label itself, which is legitimate but means the model is no longer predicting direction.

---

#### Worked Example

Entry at bar `t0` with `P_t0 = 100.00` and a trailing daily volatility estimate of `sigma = 1.5%`. Using `pt_mult = sl_mult = 2` gives barriers at plus and minus 3%: upper at `103.00`, lower at `97.00`. The vertical barrier is 5 bars.

<table>
  <tbody>
    <tr><td><strong>Bar</strong></td><td><strong>Close</strong></td><td><strong>Upper (103.00)</strong></td><td><strong>Lower (97.00)</strong></td><td><strong>Status</strong></td></tr>
    <tr><td>t0</td><td>100.00</td><td>no</td><td>no</td><td>entry</td></tr>
    <tr><td>t0 + 1</td><td>101.20</td><td>no</td><td>no</td><td>open</td></tr>
    <tr><td>t0 + 2</td><td>102.40</td><td>no</td><td>no</td><td>open</td></tr>
    <tr><td>t0 + 3</td><td>103.50</td><td>touched</td><td>no</td><td>label +1, exit</td></tr>
    <tr><td>t0 + 4</td><td>100.80</td><td>-</td><td>-</td><td>not observed</td></tr>
    <tr><td>t0 + 5</td><td>99.50</td><td>-</td><td>-</td><td>not observed</td></tr>
  </tbody>
</table>

The triple-barrier label is `+1`, assigned at bar `t0 + 3`, with a realised return of about 3% (assuming the exit fills at the barrier rather than the close). The fixed-horizon label over the same window is `sign(99.50 / 100.00 - 1) = -1`, a return of `-0.5%`.

The same path, the same entry, opposite labels. The fixed-horizon label is not wrong as a statement about prices — the price did fall over five days. It is wrong as a description of what a strategy with a 3% target would have experienced, which is a 3% gain booked on day three. A model trained on the fixed-horizon label is being taught to avoid exactly the setups the strategy profits from.

> info **The label carries the exit rule** Once barriers are in the label, the exit logic has moved out of the strategy and into the training data. Changing the stop distance in production without relabelling and retraining silently invalidates the model.

---

#### Overlapping Labels and Sample Weights

Barrier labels have variable, overlapping lifespans. Two samples determined by the same bars are not independent observations, and treating them as such overstates the sample size — the same error described in [ML Overview](/ml-finance/ml-overview).

**Uniqueness** measures how much of a label's lifespan it does not share. For each bar, count how many labels are live (the *concurrency*); a label's uniqueness is the average of `1 / concurrency` across the bars it spans. Three labels over six bars:

<table>
  <tbody>
    <tr><td><strong>Bar</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><td><strong>Label A (bars 1-3)</strong></td><td>live</td><td>live</td><td>live</td><td>-</td><td>-</td><td>-</td></tr>
    <tr><td><strong>Label B (bars 2-4)</strong></td><td>-</td><td>live</td><td>live</td><td>live</td><td>-</td><td>-</td></tr>
    <tr><td><strong>Label C (bars 4-6)</strong></td><td>-</td><td>-</td><td>-</td><td>live</td><td>live</td><td>live</td></tr>
    <tr><td><strong>Concurrency</strong></td><td>1</td><td>2</td><td>2</td><td>2</td><td>1</td><td>1</td></tr>
  </tbody>
</table>

- Uniqueness of A over bars 1, 2, 3: `(1/1 + 1/2 + 1/2) / 3 = 2.0 / 3 = 0.667`
- Uniqueness of B over bars 2, 3, 4: `(1/2 + 1/2 + 1/2) / 3 = 1.5 / 3 = 0.500`
- Uniqueness of C over bars 4, 5, 6: `(1/2 + 1/1 + 1/1) / 3 = 2.5 / 3 = 0.833`

Average uniqueness is `(0.667 + 0.500 + 0.833) / 3 = 0.667`. Three rows carry the evidence of about two independent observations.

These uniqueness values become `sample_weight` in the fit, so heavily overlapped samples count less, and they set the bootstrap size for [ensembles](/ml-finance/ensembles). Two common refinements: **return attribution**, weighting each sample by the magnitude of the return realised over its lifespan; and **time decay**, down-weighting older samples on the view that recent regimes are more relevant. Time decay is a bet on non-stationarity and should be justified, not assumed.

---

#### In Practice Across Asset Classes

**Equities.** Cross-sectional labels are usually residual returns after removing market and sector effects, so the model does not simply learn beta. Barriers must be adjusted for corporate actions or a split will register as a stop-out.

**Futures and FX.** Barriers are naturally expressed in units of average true range rather than percentage, since contract notionals and typical daily ranges differ by orders of magnitude — a fixed pip barrier is a volatility bet. Roll dates need explicit handling, because a label spanning a roll can attribute the roll gap to the position.

**Credit.** The natural label is often a genuine event (default, downgrade, spread widening past a threshold) rather than a return, which makes it closer to classical classification. Severe class imbalance is the main issue. See [Default Probability](/credit/default-probability).

**On-chain and perpetuals.** Labels should account for funding accrual over the holding period, since a directionally correct position can lose money to funding. See [Funding Rate](/signals/funding-rate) and [Perpetual Futures](/building-blocks/perpetual-futures). Twenty-four-hour markets remove the session boundary that makes a "daily" bar meaningful, so the bar definition itself becomes a labelling choice.

---

#### Assumptions and Failure Modes

- **Assumes the volatility estimate is available at entry.** Computing `sigma_t` over a window that includes future bars leaks the answer into the barrier width, and every label becomes partly self-fulfilling.
- **Assumes intrabar path is observable.** Labelling from close prices misses barriers touched intrabar. Labelling from highs and lows is more realistic but cannot resolve which barrier was touched first when both were touched in the same bar. Record such cases rather than resolving them by convention.
- **Assumes the barrier is fillable.** In a gap or a fast market, the exit fills beyond the barrier. Labels built on the assumption of exact barrier fills overstate the achievable outcome. See [Slippage](/microstructure/slippage).
- **Assumes the vertical-barrier class is meaningful.** The `0` class mixes genuine non-events with slow moves that would have been closed manually. Many practitioners drop it and label only the horizontal barriers, at the cost of a selected sample.
- **Assumes labels are independent.** They are not, which is why uniqueness weights and [purged cross-validation](/ml-finance/purged-cross-validation) are both required. Weights alone do not prevent leakage across folds.
- **Assumes the label survives costs.** A barrier set inside the round-trip transaction cost labels noise as opportunity.

> warning **Relabel when the strategy changes** The label encodes the exit rule, the holding limit, and the volatility scaling. Any change to those in live trading makes the trained model an answer to a question no longer being asked.

---

#### Code

```python
import numpy as np
import pandas as pd


def triple_barrier_labels(close, high, low, entries, sigma,
                          pt_mult=2.0, sl_mult=2.0, max_bars=5):
    """Label entries by which barrier the path touches first.

    `sigma` must be a trailing volatility estimate aligned to `entries` —
    computed with no data after the entry bar, or the barrier width leaks.
    Also returns the resolution bar, which purged CV needs to know.
    """
    rows = []
    for t0, vol in zip(entries, sigma):
        upper, lower = close[t0] * (1 + pt_mult * vol), close[t0] * (1 - sl_mult * vol)
        t_end = min(t0 + max_bars, len(close) - 1)
        label, resolved_at = 0, t_end
        for t in range(t0 + 1, t_end + 1):
            hit_up, hit_dn = high[t] >= upper, low[t] <= lower
            if hit_up or hit_dn:
                # Both inside one bar: OHLC cannot say which came first.
                label = np.nan if (hit_up and hit_dn) else (1 if hit_up else -1)
                resolved_at = t
                break
        rows.append({"entry": t0, "label": label, "resolved_at": resolved_at})
    return pd.DataFrame(rows)


def average_uniqueness(entry, resolved_at, n_bars):
    """Fraction of each label's lifespan not shared with other labels."""
    concurrency = np.zeros(n_bars)
    for t0, t1 in zip(entry, resolved_at):
        concurrency[t0:t1 + 1] += 1
    return np.array([np.mean(1.0 / concurrency[t0:t1 + 1])
                     for t0, t1 in zip(entry, resolved_at)])


# weights = average_uniqueness(lbl["entry"], lbl["resolved_at"], len(close))
# model.fit(X, y, sample_weight=weights)   # overlapped rows count less
```

---

#### See Also

* [Meta-Labelling](/ml-finance/meta-labelling)
* [Purged Cross-Validation](/ml-finance/purged-cross-validation)
* [Feature Engineering](/ml-finance/feature-engineering)
* [ML Pitfalls](/ml-finance/ml-pitfalls)
* [Stop Loss](/strategies/stop-loss)
* [Volatility](/quant-math/volatility)

---
