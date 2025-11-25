### Risk & Reality Check

> info **Metadata** Level: All | Prerequisites: None | Tags: [risk, disclaimers, backtesting, limitations]

This page sets expectations for how to read Arth responsibly.

The short version: these docs aim to help you understand DeFi and quantitative ideas more clearly. They are not instructions to follow blindly, and they are not guarantees of how markets will behave.

#### What Arth Is For

Arth is designed to:

* Explain how protocols, indicators, and strategies work.
* Show how to reason about risk and uncertainty.
* Provide examples and tools you can adapt to your own work.

It is good at:

* Giving you language and mental models.
* Showing you how to build simple tests and simulations.
* Making the assumptions in an idea visible.

It is not good at:

* Telling you what to buy, sell, or stake.
* Predicting the future.
* Removing the need for your own judgment.

---

#### Not Investment or Trading Advice

Nothing in Arth is financial, investment, or trading advice.

Even when we:

* Use real data
* Show performance charts
* Describe strategies that would have done well historically

we are still showing **examples**, not recommendations. Any decisions you make based on these ideas are your own responsibility.

---

#### Why Backtests and Examples Can Mislead

Backtests and examples are useful, but they have limits. Common issues include:

* **Changing market regimes** – volatility, liquidity, and participant behavior change over time.
* **Overfitting and hindsight** – it is easy to tweak rules until they fit past data too well.
* **Data quality problems** – missing data, bad candles, survivorship bias.
* **Simplified execution assumptions** – fills, slippage, and fees are rarely as clean as the charts suggest.

Because of this, treat backtests and simulations as **stories about what might have happened under specific conditions**, not as forecasts.

---

#### On-Chain Realities: Slippage, Gas, and MEV

Real DeFi trading happens inside a system with its own rules and frictions:

* Slippage and depth – large trades move the price; small pools can “break” simple assumptions quickly.
* Gas costs – high gas can wipe out expected edge.
* Transaction ordering and MEV – sandwiches, front-running, and other behaviors can drastically change realised prices.
* Failed or stuck transactions – often the biggest loss is not getting in or out when you intended.

Even if a strategy looks appealing in a clean model, these details can turn expected profit into actual loss.

---

#### Leverage, Compounding, and Risk of Ruin

Many DeFi tools make it easy to use leverage, loop positions, or stack strategies.

Important realities:

* **Losses compound too.** A sequence of small losses under leverage can be far more damaging than it looks in a simple chart.
* **Liquidations are discrete.** Once collateral falls below a threshold, a position can be closed regardless of your longer-term view.
* **Kelly-style “optimal” sizing is fragile.** Small errors in your edge estimates can lead to very aggressive, unsafe bet sizes.

Whenever a page discusses leverage or position sizing, read the risk notes carefully and consider starting with smaller, more conservative allocations than any “optimal” formula suggests.

---

#### How to Read Strategy Pages Safely

Each strategy page is written with a structure so you can evaluate it critically. Pay attention to:

* **Assumptions** – data, markets, and conditions. Are they realistic for you?
* **Scope** – what's deliberately left out? (taxes, MEV, certain fees?)
* **Data & time period** – which assets/regimes were analysed?
* **Risk section** – worst-case scenarios, failure modes, parameter sensitivity.

Use these sections as a checklist. If they feel incomplete, assume the analysis is incomplete.

---

#### Using Arth in Your Own Work

A healthy workflow:

1. Learn the building blocks (AMMs, lending, perps, liquidations, risk measures).
2. Use examples as starting points. Copy structures, not parameter values.
3. Test in a controlled way: small sizes, multiple regimes, stress tests.
4. Keep your own risk notes (beliefs, ignored factors, stop conditions).
5. Stay skeptical of “too good” results; smooth curves with high returns usually mean something important is missing.

---

#### Final Thought

These docs are written to make complex systems more understandable, not to make them safe by default.

If you remember one thing from this page, let it be this: **every formula, indicator, or strategy lives inside a messy, changing world.** Use Arth to see that world more clearly, not to forget that it exists.
