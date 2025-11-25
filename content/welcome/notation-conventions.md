### Notation & Conventions

> info **Metadata** Level: All | Prerequisites: None | Tags: [notation, math, code-style, conventions]

This page explains the symbols, naming, and formatting you'll see across Arth. The goal is simple: when you see a formula or a code snippet, you should not have to guess what the symbols mean.

If something looks unfamiliar, you can always come back here for a quick reminder.

#### Why Notation Matters

DeFi combines several worlds:

* Financial markets
* Cryptography and protocols
* Probability and statistics
* Software and data systems

Each of those worlds has its own habits and symbols. Arth uses a consistent, minimal set of conventions so the same symbol means the same thing wherever you see it.

---

#### Prices, Returns, and Volatility

You'll often see these symbols:

* `P_t` — price at time `t`
* `P[t-1]` — previous price
* `R_t` — simple return between `t-1` and `t`
  * Formula: `R_t = (P_t - P[t-1]) / P[t-1]`
* `r_t` — log return
  * Formula: `r_t = ln(1 + R_t)`
* `sigma` — volatility (standard deviation of returns), sometimes annualised as `sigma_ann`

Where a different symbol is used for good reason, the article will define it locally.

---

#### Portfolios, Strategies, and Performance

Common symbols:

* `w_i` — weight of asset `i` in a portfolio
* `R_p` — portfolio return
* `R_f` — risk-free rate (if used)
* `S` — Sharpe ratio
  * Formula: `S = (R_p - R_f) / sigma_p`
* `MDD` — maximum drawdown
* `f` — fraction of capital allocated in position sizing (for example in Kelly-style formulas)
* `L` — leverage factor

When something can be interpreted in multiple ways (for example, “leverage” can mean different things), the article will explain the meaning in context.

---

#### Probability and Expectations

For probabilistic ideas we use:

* `X`, `Y` — random variables
* `E[X]` — expectation (mean) of `X`
* `Var(X)` — variance of `X`
* `Cov(X, Y)` — covariance of `X` and `Y`
* `rho(X, Y)` — correlation between `X` and `Y`
* `P(A)` — probability of event `A`

When an article uses a particular distribution (for example, normal, lognormal, Poisson), it will say so explicitly.

---

#### Indicators and Signals

Indicators are often introduced with:

* A full name, for example **Relative Strength Index**, and
* An abbreviation, for example **RSI**.

Page titles and headings will usually include both, for example: Relative Strength Index (RSI)

Within formulas, we might write:

* `RSI_t` — RSI value at time `t`
* `MA_t` — moving average at time `t`

Where multiple lookback windows exist (for example, fast vs slow moving averages), simple subscripts are used: `MA_fast`, `MA_slow`, `MA_fast/slow`, etc.

---

#### Code Examples

Arth uses three main “flavours” of code:

* **Python** — for data analysis, statistics, and backtesting.
* **TypeScript** (or JavaScript) — for on-chain interactions, simulations in TS, and integration examples.
* **Pseudocode** — when the key idea is the logic, not the exact syntax.

You can spot them by the fences:

```python
# Python example
returns = prices.pct_change().dropna()
vol = returns.std() * (252 ** 0.5)
```

```ts
// TypeScript example
const simpleReturn = (pNow: number, pPrev: number) =>
  (pNow - pPrev) / pPrev;
```

```text
# Pseudocode example
for each time step:
    update signals
    if entry conditions:
        open position
```

Conventions:

* Variable names are descriptive (for example, `price`, `returns`, `position_size`) rather than single letters.
* Examples are written to be as short as possible while still being understandable.
* If an example omits error handling or production concerns, that is intentional and usually stated.

---

#### Document Conventions

Across the docs you'll see some repeated patterns:

* **Level and prerequisites** at the top of a page help you decide whether to read now or later.
* **Callout boxes** highlight assumptions, warnings, or side notes.
* **“See also” sections** at the end of a page link to closely related topics.
* **Tags** list the key concepts, indicators, and formulas used on the page.

We also follow some writing habits:

* Define terms before using abbreviations.
* Put important assumptions near the top, not hidden in the middle.
* Use the same phrase for the same concept across the site whenever possible.

If something feels inconsistent, it is fair to assume it might be a mistake; you can always raise an issue or suggest an edit.

---

#### When in Doubt

If you encounter a symbol, abbreviation, or variable name you don't recognise:

1. Check the first few paragraphs of the page; most things are defined there.
2. Look in the **Reference** section:
   * Glossary
   * Indicator Index
   * Formula Cheat Sheet
3. If it still isn't clear, treat that as a useful signal: the docs may need improvement, and you are welcome to point it out.
