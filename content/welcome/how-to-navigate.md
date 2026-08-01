### How to Navigate These Docs

> info **Metadata** Level: All | Prerequisites: None | Tags: [welcome, overview, navigation]

Welcome to Arth. You can think of these docs as a city with different neighborhoods:

1. **Start Here** – where you get your bearings, build intuition, and pick a path that matches your background.
2. **The Quant Core** – Math & Probability, Statistics & Time Series, Stochastic Processes, Markets & Microstructure, Signals, Strategy Design, Portfolio & Risk, Data & Tooling, Simulation & Backtesting. These are the “chapters” you’ll keep coming back to, and none of them assume a particular market.
3. **DeFi & On-Chain Markets** – a full domain section for on-chain finance: primitives, protocol designs, MEV and ordering, execution environments, and on-chain data.
4. **Reference & Tools** – glossaries, cheat sheets, indices, and practical guides that help you quickly look things up or turn ideas into something testable.

The split matters: the quant core teaches the method, and the domain sections show the method applied. A Sharpe ratio, a stop-loss, and an overfitted backtest behave the same way whether the returns came from a futures position or a liquidity position.

Use the sidebar to browse by topic, or the search bar to jump directly to what you care about (for example, type “RSI”, “impermanent loss”, or “Sharpe ratio”).

---

#### Recommended Reading Paths

You don’t have to read Arth from start to finish. Pick the path that feels closest to where you are now.

**If you’re new to markets**

You’re curious about how trading and investing actually work, beyond headlines and tips.

* Start in **Start Here** for reading guidance and a realistic view of what quantitative work can and can’t tell you.
* Move into **Statistics & Time Series** for the vocabulary you’ll use everywhere: returns, volatility, autocorrelation.
* Then read **Portfolio & Risk → Performance Metrics** so you can tell a good track record from a lucky one.
* Along the way, look for callouts labelled “risk” or “common mistakes” – they highlight ways people actually lose money.

**If you come from a math or stats background**

You’re comfortable with formulas and distributions and want to see how they map onto markets.

* Skim **Math & Probability** and **Stochastic Processes** to align on notation and assumptions.
* Connect those ideas to real markets in **Signals & Features** and **Strategy Design**.
* Spend real time in **Simulation & Backtesting** – it’s where most theoretically sound ideas quietly die.
* Use **Portfolio & Risk** for the sizing and evaluation machinery.

**If you’re a developer or analyst building things**

You want to source data, compute something correct, and ship it.

* Start in **Data & Tooling** for data sources, cleaning, pipelines, and reproducible environments.
* Read **Simulation & Backtesting** before writing your own backtester – especially the failure modes.
* Use **Reference** as your lookup layer: formulas, notation, metric and indicator indices.
* Dip into **Markets & Microstructure** when your numbers and your fills disagree.

**If you’re already trading**

You understand the basics and maybe run some strategies, but want more structure and better reasoning.

* Spend time in **Signals & Features** to see clearly defined indicators (with intuition, formulas, and examples).
* Use **Strategy Design** for structured write-ups: what the idea is, how it’s tested, and what can go wrong.
* Read **Portfolio & Risk** to move from “this trade worked” to “this process has an edge”.
* Read **Markets & Microstructure** to understand the costs that separate a backtest from a fill.

**If you’re here for DeFi specifically**

You want the on-chain instance of all of the above.

* Start with **DeFi & On-Chain Markets → Orientation** for what DeFi is and how people actually use it.
* Move into **Primitives** for the core ingredients: tokens, swaps, AMMs, lending, stablecoins, oracles, perps.
* Go deeper with **Protocol Deep Dives**, then **MEV & Transaction Ordering** and **Execution Environments**.
* Use **On-Chain Data** when you’re ready to query chains yourself.
* Jump back into the quant core whenever you need the general version of a concept.

**If you care about protocol risk and system design**

You might be a protocol designer, risk reviewer, or someone who wants to understand failure modes.

* Read **DeFi & On-Chain Markets → Primitives** and **Protocol Deep Dives** to see how common designs are structured.
* Pair that with **On-Chain Risk & Simulation** for smart contract risk, oracle manipulation, and frontrunning.
* Add **Portfolio & Risk → Risk Management** for the non-chain-specific failure modes.
* Browse **Case Studies** to see real or realistic examples of what goes wrong and why.

#### Quick Map of Key Sections

Here's a plain-language map of what lives where:

<table>
  <tbody>
    <tr>
      <td><strong>Math &amp; Probability</strong></td>
      <td>Random variables, expectation, variance, covariance, limit theorems, sampling.</td>
    </tr>
    <tr>
      <td><strong>Statistics &amp; Time Series</strong></td>
      <td>Turning a price series into estimates: returns, volatility, autocorrelation, stationarity.</td>
    </tr>
    <tr>
      <td><strong>Stochastic Processes</strong></td>
      <td>Models of price motion: random walks, GBM, mean reversion, jumps.</td>
    </tr>
    <tr>
      <td><strong>Markets &amp; Microstructure</strong></td>
      <td>How trades actually happen: orderbooks, slippage, fees, routing, latency.</td>
    </tr>
    <tr>
      <td><strong>Signals &amp; Features</strong></td>
      <td>A catalog of tools like RSI, MACD, Bollinger Bands, volume, funding, and basis features.</td>
    </tr>
    <tr>
      <td><strong>Strategy Design</strong></td>
      <td>Full strategy stories: what the idea is, how it's built, how it behaves, and how it breaks.</td>
    </tr>
    <tr>
      <td><strong>Portfolio &amp; Risk</strong></td>
      <td>Sharpe, drawdown, VaR, Kelly, mean-variance, position sizing, and risk management.</td>
    </tr>
    <tr>
      <td><strong>Data &amp; Tooling</strong></td>
      <td>How to get data, clean it, and work with it in code or notebooks.</td>
    </tr>
    <tr>
      <td><strong>Simulation &amp; Backtesting</strong></td>
      <td>How to test strategies, build backtests, and run simulations without fooling yourself.</td>
    </tr>
    <tr>
      <td><strong>DeFi &amp; On-Chain Markets</strong></td>
      <td>The on-chain domain: primitives, protocol designs, MEV and ordering, execution environments, on-chain data, and the strategies and risks specific to them.</td>
    </tr>
    <tr>
      <td><strong>Case Studies</strong></td>
      <td>"Tourist guides" through real scenarios: what happened, why it mattered, what we can learn.</td>
    </tr>
    <tr>
      <td><strong>Reference</strong></td>
      <td>Glossaries, indices, cheat sheets, and notation.</td>
    </tr>
    <tr>
      <td><strong>Contributing</strong></td>
      <td>How to suggest edits, add content, and understand the docs pipeline.</td>
    </tr>
  </tbody>
</table>

---

#### Tips for Finding Content Faster

You don’t have to remember where everything lives. A few simple habits help:

* **Use the search bar.**
  Type what you have in mind:

  * “RSI” to see how Relative Strength Index works and how it’s used in strategies.
  * “impermanent loss” to find AMM and LP explanations.
  * “Sharpe” to jump to risk and performance measures.

* **Browse by section when you’re exploring.**
  Use the sidebar when you’re in “browsing mode” and not looking for anything specific. Opening a section often reveals related topics you hadn’t thought to search for.

* **Use the reference pages as a hub.**

  * The **Glossary** is great when a term feels familiar but you can’t quite recall it.
  * The **Indicator Index** lists all signals and indicators in one place.
  * The **Formula Cheat Sheet** lists key formulas with links to the full explanations.

* **Follow “See also” links.**
  Most pages end with a short list of related topics. Use these to build your own path: from a simple idea like “moving averages” to richer ideas like “trend-following” or “backtesting”.

---

#### Staying Oriented While You Read

A few conventions are used throughout the docs to help you keep track of where you are:

* Each page starts with a rough **level** (Beginner / Intermediate / Advanced) and **prerequisites**, so you can decide whether to read it now or bookmark it for later.
* Important assumptions and risks are called out explicitly, rather than buried in the middle.
* Longer topics have an overview page at the top of the section, which suggests an order for the subtopics.

If you ever feel lost, you can:

* Go back to the **Start Here** section and pick a reading path.
* Use the search bar to jump straight to the term or formula you have in mind.
* Open the **Reference** section and use the indices to find the right page.

The aim is that you always know what you’re reading, why it matters, and where to go next—whether you’re learning what volatility means or sharpening an existing research process.

---

#### See Also

* [Reading Paths](/welcome/reading-paths) – Full routes for six different backgrounds
* [Prerequisites](/welcome/prerequisites) – What each section assumes you know
* [How to Read an Arth Article](/start-here/how-to-read) – Getting the most out of a single page
* [Notation & Conventions](/welcome/notation-conventions) – Symbols and code style used site-wide
* [Risk & Reality Check](/welcome/risk-reality-check) – How to read the strategy material responsibly
* [Glossary](/reference/glossary) – The lookup layer when a term is unfamiliar
* [Trading Foundations](/trading-foundations) – A good first stop inside the quant core
