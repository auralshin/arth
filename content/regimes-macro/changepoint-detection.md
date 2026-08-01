### Changepoint Detection

> info **Metadata** Level: Intermediate | Prerequisites: Hypothesis Testing, Volatility, Market Regimes | Tags: regimes, changepoint, cusum, detection-delay, false-alarms, monitoring

A **changepoint** is a moment at which the statistical properties of a series change: the mean shifts, the volatility jumps, a correlation moves. **Changepoint detection** is the family of methods that locate such moments. It answers a narrower question than a [Markov switching model](/regimes-macro/markov-switching) — it does not assume the regimes recur, and it does not need to know how many there are — which makes it useful when the concern is simply "has something changed" rather than "which of `K` known states are we in".

The subject is dominated by one unavoidable trade-off. Any detector that fires quickly on a real change also fires often on noise; any detector that rarely raises a false alarm needs more evidence and therefore takes longer to confirm a real one. You do not choose whether to accept detection delay. You choose how much of it to accept, and you pay for every day you shave off in false alarms.

---

#### Offline Versus Online

The two settings are different problems and use different tools.

<table>
  <tbody>
    <tr>
      <td><strong>Aspect</strong></td><td><strong>Offline (retrospective)</strong></td><td><strong>Online (sequential)</strong></td>
    </tr>
    <tr>
      <td>Data available</td><td>The whole series</td><td>Everything up to now</td>
    </tr>
    <tr>
      <td>Question</td><td>Where were the breaks?</td><td>Has a break happened yet?</td>
    </tr>
    <tr>
      <td>Typical methods</td><td>Binary segmentation, PELT, dynamic programming</td><td>CUSUM, EWMA control charts, sequential likelihood ratio</td>
    </tr>
    <tr>
      <td>Tuned for</td><td>Segment accuracy</td><td>Delay against false-alarm rate</td>
    </tr>
    <tr>
      <td>Usable for live sizing</td><td>No</td><td>Yes</td>
    </tr>
  </tbody>
</table>

Offline methods are the changepoint analogue of smoothed HMM probabilities: they see the future and are therefore excellent for describing history and useless for generating positions. If a backtest segments the sample first and then trades within segments, it has already lost.

Offline detection also has a subtler role that is entirely legitimate: deciding whether a research dataset should be split before fitting anything. Estimating a covariance matrix across a known structural break produces a matrix that describes neither side of it.

---

#### CUSUM

The **cumulative sum (CUSUM)** chart is the workhorse of online detection. It accumulates evidence for a shift and resets whenever the evidence turns negative, so it does not carry stale history forward.

For detecting an upward shift in the mean of a standardised series `x_t`:

```text
S_t = max(0, S_(t-1) + x_t - k)

alarm when S_t exceeds h
```

where:

- `x_t` is the observation, standardised so that under no change it has mean 0 and unit variance
- `k` is the **slack** or reference value, the size of shift you are willing to ignore, conventionally half the shift you want to catch
- `h` is the **decision threshold**
- `S_0 = 0`, and `S_t` resets to 0 whenever the running sum would go negative

A two-sided version runs a second accumulator on `-x_t` in parallel. The recursion is a sequential likelihood-ratio test in disguise: `x_t - k` is proportional to the log-likelihood ratio between "shifted" and "unshifted" for Gaussian data, and the reset at zero is what converts a fixed-sample test into a repeated one.

---

#### Worked Example: Detecting a Volatility Shift

Monitor a standardised absolute-return series with `k = 0.5` and `h = 4.0`. The true volatility regime shifts upward starting at observation 4.

<table>
  <tbody>
    <tr>
      <td><strong>t</strong></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td>
    </tr>
    <tr>
      <td><strong>x_t</strong></td><td>0.2</td><td>-0.6</td><td>0.4</td><td>1.1</td><td>0.9</td><td>1.4</td><td>2.0</td><td>1.3</td>
    </tr>
    <tr>
      <td><strong>S_t</strong></td><td>0.0</td><td>0.0</td><td>0.0</td><td>0.6</td><td>1.0</td><td>1.9</td><td>3.4</td><td>4.2</td>
    </tr>
  </tbody>
</table>

Working through the turning points:

1. `t = 1`: `0 + 0.2 - 0.5 = -0.3`, so `S_1 = max(0, -0.3) = 0`. The same happens at `t = 2` and `t = 3` — each quiet observation is discarded rather than carried forward.
2. `t = 4`: `0 + 1.1 - 0.5 = 0.6`. Evidence starts accumulating on the first observation from the new regime.
3. `t = 5` through `t = 7`: `0.6 + 0.4 = 1.0`, then `1.0 + 0.9 = 1.9`, then `1.9 + 1.5 = 3.4`. Still below `h`.
4. `t = 8`: `3.4 + 1.3 - 0.5 = 4.2`, which exceeds `h = 4.0`. **Alarm.**

The shift began at `t = 4`; the alarm fires at `t = 8`. Five observations of the new regime were consumed before the detector was willing to commit.

**Checking against the approximation.** Ignoring overshoot, the expected number of observations to alarm once a shift of size `delta` is underway is roughly `h / (delta - k)`. The post-shift observations average `(1.1 + 0.9 + 1.4 + 2.0 + 1.3) / 5 = 1.34`, so the drift per step is `1.34 - 0.5 = 0.84`, giving `4.0 / 0.84 = 4.8` observations. The realised delay of 5 matches closely.

---

#### The Delay Versus False-Alarm Trade-off

The threshold `h` is the only real dial, and it moves both quantities at once. The standard summaries are:

- **`ARL_0`** — the average run length to a false alarm when nothing has changed. Larger is better.
- **`ARL_1`** — the average delay to detection once a change has occurred. Smaller is better.

For CUSUM, `ARL_1` grows roughly *linearly* in `h`, while `ARL_0` grows roughly *exponentially* in `h`. That asymmetry is what makes CUSUM attractive: modest increases in threshold buy large increases in the time between false alarms for a proportionally smaller increase in delay. But it is still a monotone trade — there is no setting that improves both.

Two consequences worth internalising.

**Every detector lags, and the lag is not a bug.** A detector that fired the instant a regime changed would have to be firing constantly, because at any moment the recent data is at least weakly consistent with a change. The delay is the price of the evidence. Practically, it means a regime-conditional strategy takes the first part of every regime change at the old parameters. Sizing should assume that, not hope against it.

**Detection is a multiple-testing problem in time.** Running a detector every day on many series means many opportunities to be wrong. If a detector has `ARL_0 = 500` days and you run it on 40 instruments, you should expect a false alarm roughly every 12 days somewhere in the book, purely from noise. See [Multiple Testing](/stat-methods/multiple-testing).

> warning **Standardisation must be causal** Standardising `x_t` using the full sample's mean and standard deviation leaks the future into the detector and will make it look far sharper than it is. Use an expanding or trailing estimate that only ever sees the past.

> info **Level shifts and variance shifts need different inputs** CUSUM on raw returns detects a change in mean. To detect a change in volatility, run it on a variance proxy such as squared or absolute standardised returns. Applying the mean-shift chart to returns and expecting it to catch a volatility regime is a common and silent failure.

---

#### In Practice Across Asset Classes

**Equities.** Volatility changepoints are the usual target, run on realised volatility or absolute returns. Beware earnings dates and index reconstitutions, which create genuine one-off jumps that a detector will report as regime changes.

**Rates.** Scheduled policy meetings and data releases mean many changepoints are calendar-known in advance. A detector that rediscovers a scheduled event several days late is adding nothing; the interesting cases are the unscheduled ones.

**FX.** Changepoints in a managed or pegged currency can be discrete policy decisions with no statistical build-up at all — the series is stable and then it is not. Sequential detectors have nothing to accumulate before the break, so the delay collapses to zero but the warning value is also zero.

**Commodities.** Contract rolls introduce artificial jumps in stitched series. Detect on the roll-adjusted series or the detector will find a changepoint on every roll date. See [Roll and Carry](/markets/roll-and-carry).

**Credit.** Infrequent marks smooth the series, so a genuine break appears as a gradual drift and the detector reports it late and with low confidence. Aggregating to a lower frequency before detecting usually helps.

**On-chain markets.** Detection is often applied to funding rates, open interest, or pool depth rather than to prices, since positioning frequently changes before price does. Protocol upgrades, incentive-programme starts, and liquidity migrations create real structural breaks that are not market regimes at all — see [Liquidity](/signals/liquidity) and [Yield Farming](/building-blocks/yield-farming).

---

#### Assumptions and Failure Modes

- **Independent observations.** CUSUM's false-alarm properties assume serially uncorrelated input. Autocorrelated data produces far more false alarms than the nominal `ARL_0` suggests. Pre-whitening, or widening `h` empirically, is necessary.
- **Known pre-change parameters.** The chart is calibrated against a baseline mean and variance. If those are themselves estimated on a short window, the detector inherits their noise and can trigger on estimation error.
- **A single, abrupt change.** Gradual drift is detected late and at an ambiguous location. Multiple closely spaced changes confuse both offline segmentation and online charts.
- **Stable data quality.** A change in vendor, a fixing-time shift, or a corrected data feed is a changepoint in the data, not the market. Most "regime changes" found in a new dataset are data problems. See [Data Cleaning](/data-tooling/cleaning).
- **The monitored statistic captures the regime.** A detector on returns cannot see a liquidity change until it moves prices.
- **Restart discipline.** After an alarm, the chart must be reset and the baseline re-estimated on post-change data. Failing to reset produces immediate repeat alarms; resetting too eagerly discards the evidence you just paid for.
- **Thresholds must be set before looking.** Tuning `h` until the alarms line up with remembered episodes is curve-fitting on history.

---

#### Code

```python
import numpy as np

def cusum(standardised, slack=0.5, threshold=4.0, two_sided=True):
    """Sequential CUSUM. Returns the running statistics and alarm indices.

    `standardised` must be causally standardised - using full-sample
    moments here would leak the future into the detector.
    """
    pos = neg = 0.0
    upper, lower, alarms = [], [], []
    for t, x in enumerate(standardised):
        pos = max(0.0, pos + x - slack)
        neg = max(0.0, neg - x - slack) if two_sided else 0.0
        upper.append(pos)
        lower.append(neg)
        if pos > threshold or neg > threshold:
            alarms.append(t)
            pos = neg = 0.0          # reset after an alarm, then re-baseline
    return np.array(upper), np.array(lower), alarms


def approximate_detection_delay(threshold, shift_size, slack=0.5):
    """Rough expected delay once a shift of `shift_size` is underway.

    Ignores overshoot past the threshold, so it is a mild underestimate.
    Undefined when the shift is no larger than the slack: the chart
    resets as fast as it accumulates and never reliably fires.
    """
    drift = shift_size - slack
    return threshold / drift if drift > 0 else np.inf
```

---

#### See Also

* [Markov Switching Models](/regimes-macro/markov-switching)
* [Hidden Markov Models](/regimes-macro/hidden-markov-models)
* [Market Regimes: An Overview](/regimes-macro/regimes-overview)
* [Multiple Testing](/stat-methods/multiple-testing)
* [Unit Roots](/stat-methods/unit-roots)
* [Data Cleaning](/data-tooling/cleaning)

---
