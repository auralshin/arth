### Python Setup

> info **Metadata** Level: Beginner | Prerequisites: Basic Python | Tags: python, environments, dependencies, packaging, project-layout, reproducibility

The environment is part of the experiment. A backtest result depends on the version of every library that touched the data, and library defaults change: a rolling window's minimum-observation behaviour, a sort's stability, a rounding rule, a resampling boundary. None of these produce an error when they change. They produce a slightly different number, in code you did not modify, and you will attribute the difference to something else.

This is why environment setup belongs in a research handbook rather than in an onboarding document. "It worked on my machine six months ago" and "the result is wrong" are the same sentence with different emphasis. The goal is not tidiness — it is that a colleague, or you next year, can reconstruct the exact conditions under which a number was produced. See [Reproducible Experiments](/data-tooling/reproducible).

---

#### Declared Versus Locked

Two files do two different jobs, and conflating them is the root of most environment drift.

```text
pyproject.toml          the declaration: what this project needs
  dependencies = ["pandas>=2.2", "pyarrow>=16", "numpy>=1.26"]
  loose ranges, human-edited, expresses intent

uv.lock / requirements.lock    the resolution: exactly what was installed
  pandas==2.2.2  --hash=sha256:...
  pyarrow==16.1.0 --hash=sha256:...
  numpy==1.26.4  --hash=sha256:...
  every transitive dependency, exact versions, machine-generated
```

The declaration allows a range so upgrades are possible. The lockfile removes the range so installs are identical. Both are committed. Installing from the declaration in production means the resolver picks whatever is newest that day, which is how two machines end up with different pandas versions and a result that will not reproduce.

Hashes matter beyond version numbers. A pinned version without a hash still trusts that the artefact for that version has not changed. Hash-pinned installs turn a supply-chain substitution into a failed install rather than a silent one.

Pin the interpreter too. A `.python-version` file, or an explicit `requires-python`, prevents the case where the lockfile resolves differently because a dependency ships different wheels per Python version.

<table>
  <tbody>
    <tr>
      <td><strong>Tool</strong></td>
      <td><strong>Handles</strong></td>
      <td><strong>Trade-off</strong></td>
    </tr>
    <tr>
      <td>venv plus pip</td>
      <td>Pure-Python and wheel-packaged dependencies</td>
      <td>No lockfile of its own; needs pip-tools or a compiled requirements file</td>
    </tr>
    <tr>
      <td>uv</td>
      <td>Resolution, locking, interpreter management, virtual environments</td>
      <td>Newer tool; a fast-moving ecosystem</td>
    </tr>
    <tr>
      <td>Poetry</td>
      <td>Declaration, locking, and packaging in one workflow</td>
      <td>Resolution can be slow on wide dependency trees</td>
    </tr>
    <tr>
      <td>conda / mamba / pixi</td>
      <td>Non-Python native libraries and compiled toolchains</td>
      <td>Heavier; mixing conda and pip in one environment causes conflicts</td>
    </tr>
    <tr>
      <td>Container image</td>
      <td>The operating system, system libraries, and the interpreter</td>
      <td>The strongest guarantee and the slowest iteration loop</td>
    </tr>
  </tbody>
</table>

> warning **A notebook kernel can point anywhere** Jupyter kernels are registered independently of the environment you activated in the shell. A kernel silently bound to a different interpreter is a common cause of "the same code gives different answers", and it is invisible until you print the interpreter path. See [Notebooks](/data-tooling/notebooks).

---

#### Project Layout

```text
research-project/
├── pyproject.toml          declaration, tool config, package metadata
├── uv.lock                 exact resolution, committed
├── .python-version         interpreter pin
├── src/
│   └── research/
│       ├── data/           loaders, validation, point-in-time views
│       ├── features/       signal construction — pure functions
│       ├── backtest/       simulation engine and cost model
│       └── config.py       typed settings, no hard-coded paths
├── notebooks/
│   ├── 2024-06-11-carry-exploration.ipynb
│   └── README.md           what each notebook concluded, and whether it is live
├── tests/
│   └── test_features.py    including look-ahead regression tests
├── scripts/
│   └── build_dataset.py    thin entry points; logic lives in src/
└── data/                   gitignored; contents referenced by hash, never committed
```

Three conventions carry most of the value.

**`src/` layout with an installed package.** Installing the project in editable mode means notebooks and scripts import `research.features` rather than manipulating `sys.path`. Path manipulation is the single most common reason a notebook runs for its author and nobody else.

**Date-prefixed notebook names.** Notebooks are lab notes, and lab notes are chronological. A name like `analysis_final_v2_real.ipynb` tells you nothing; a date and a topic tells you when the thinking happened and what data vintage it used.

**Data is never in version control.** Git handles text diffs, not gigabyte binaries. Reference data by content hash in a manifest and keep the bytes in object storage. See [Building a Simple Data Pipeline](/data-tooling/pipeline).

---

#### Notebooks or Modules

The boundary is not stylistic. It follows from whether the code is being read once or run repeatedly.

<table>
  <tbody>
    <tr>
      <td><strong>Belongs in a notebook</strong></td>
      <td><strong>Belongs in a module</strong></td>
    </tr>
    <tr>
      <td>Looking at a distribution for the first time</td>
      <td>Anything a second notebook also needs</td>
    </tr>
    <tr>
      <td>Narrative that explains a decision to a reader</td>
      <td>Anything with a branch worth testing</td>
    </tr>
    <tr>
      <td>Plots and diagnostics of a single dataset</td>
      <td>Anything a scheduled job runs</td>
    </tr>
    <tr>
      <td>One-off reconciliation between two sources</td>
      <td>Anything whose output feeds a trading decision</td>
    </tr>
  </tbody>
</table>

The useful practice is promotion: a function written in a notebook that survives being useful twice moves into `src/`, gains a test, and is imported back into the notebook. The notebook then shows the *analysis* rather than the *implementation*, which is what a reader wanted to see anyway.

Testing deserves one specific mention. The highest-value test in a research codebase is not a unit test of an indicator; it is a **look-ahead regression test**. Feed a feature function a series truncated at time `t`, then feed it the full series, and assert that the values up to `t` are identical. A feature that fails this test uses future information, and the assertion catches it in seconds rather than in production.

---

#### Configuration and Secrets

Configuration is an input to the experiment and belongs beside the code, in a typed settings object loaded from a file. Hard-coded absolute paths and magic constants scattered through modules are what make an environment unshareable.

Secrets are the exception: vendor API keys and node credentials come from the environment or a secrets manager, never from a committed file, and never from a notebook cell that gets exported to HTML. A useful reflex is that anything you would be unhappy to see in a rendered notebook output does not belong in a variable a notebook can print.

---

#### In Practice Across Asset Classes

The dependency surface differs more than the workflow does.

**Equities.** Exchange calendars are a hard dependency, not a convenience. Holidays, half-days, and historical calendar changes cannot be derived from a weekday rule, and getting them wrong shifts every date-indexed calculation. Symbology mapping tables are a second, larger dependency.

**Futures and options.** Pricing and curve libraries frequently wrap native code, which is where pure-Python packaging stops being sufficient and conda-style tooling or containers start paying for themselves. Pin the native library version, not just the Python wrapper.

**FX.** Light on dependencies but heavy on convention constants: quote conventions, settlement rules, and value-date calendars. These are best held as versioned data files inside the package rather than as constants in code, so a convention change is a diffable change.

**Fixed income.** Day-count conventions and schedule generation are the dependency, and they are notoriously easy to implement subtly wrong. This is a case for a well-tested library over a local implementation. See [Curve Construction](/markets/curve-construction).

**On-chain.** The environment includes an endpoint, not only packages. An archival node or provider, its version, and the chain identifier all affect what a query returns, so they belong in the manifest alongside library versions. See [RPC Nodes](/data-tooling/rpc-nodes).

---

#### Assumptions and Failure Modes

- **Assumes the declaration is enough.** Without a lockfile, two installs a week apart resolve differently, and a transitive upgrade changes results.
- **Assumes libraries are backward compatible.** Defaults change between minor versions in ways that alter numbers without raising warnings.
- **Assumes the kernel matches the shell.** Jupyter kernels bind to an interpreter independently, and the mismatch is invisible until printed.
- **Assumes a container fixes everything.** It fixes the system layer; unpinned dependencies inside the image still drift on every rebuild.
- **Assumes data lives beside code.** It does not, so a repository that runs perfectly still reproduces nothing without a data manifest.
- **Assumes the environment is the only variable.** Locale, timezone, and thread-count environment variables all change output, and none of them appear in a lockfile.
- **Assumes setup is a one-off.** Environments rot. A monthly rebuild from the lockfile catches the drift while it is still small.

---

#### Code

```python
# tests/test_features.py — the test that earns its keep in research code.
import numpy as np
import pandas as pd
from research.features import momentum_signal


def test_signal_is_causal():
    """Values computed on a truncated series must equal those computed on
    the full series. Any future-looking operation — a centred window, a
    full-sample z-score, a scaler fitted on everything — breaks this.
    """
    rng = np.random.default_rng(0)
    idx = pd.date_range("2020-01-01", periods=500, freq="B", tz="UTC")
    prices = pd.Series(100 * np.exp(rng.normal(0, 0.01, 500).cumsum()), index=idx)

    cutoff = idx[300]
    truncated = momentum_signal(prices.loc[:cutoff])
    full = momentum_signal(prices).loc[:cutoff]

    pd.testing.assert_series_equal(truncated, full, check_names=False)


def test_environment_is_the_expected_one():
    """Cheap guard against a notebook kernel bound to another interpreter."""
    import sys, pandas
    assert sys.version_info[:2] >= (3, 11)
    assert pandas.__version__.startswith("2.")
```

```text
# Typical lifecycle. The lockfile is the artefact that matters.
uv sync                     # install exactly what uv.lock specifies
uv add "statsmodels>=0.14"  # updates pyproject.toml and uv.lock together
uv lock --upgrade           # deliberate, reviewable dependency bump
uv run pytest               # runs inside the locked environment, not the shell's
```

---

#### See Also

* [Working with Market Data in Python](/data-tooling/python)
* [Notebooks](/data-tooling/notebooks)
* [Reproducible Experiments](/data-tooling/reproducible)
* [Building a Simple Data Pipeline](/data-tooling/pipeline)
* [Code Examples](/contributing/code-examples)
* [Operational Risk](/risk/operational)

---
