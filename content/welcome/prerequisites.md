### Prerequisites

> info **Metadata** Level: All | Prerequisites: None | Tags: overview, prerequisites, navigation

This page explains what you *do* and *don’t* need before using Arth.  
You don’t need to be a quant, a Solidity dev, or a professional trader to get value here — but you will get more out of the library if you know roughly where you’re starting from.

Use this page to calibrate: check what you already have, what you can safely ignore for now, and which gaps you might want to close as you go.

---

#### Knowledge Prerequisites

Think of prerequisites in three layers: **computer basics**, **finance/DeFi basics**, and **math/quant basics**. You don’t need to be strong in all three to start, but it helps to know where you stand.

**1. Absolute minimum (to read most “Welcome” and overview pages)**

You should be comfortable with:

* Using a web browser and installing browser extensions
* Copy-pasting text and command snippets
* Basic idea of what a website, URL, and account are

That’s enough for pages in `/welcome` and most concept overviews in `/building-blocks`.

---

**2. Helpful but not required (for DeFi & protocol pages)**

These will make `/building-blocks/*` and `/protocols/*` much easier:

* Basic personal finance:
  * What interest is
  * What a loan is
  * What “collateral” roughly means
* Trading basics:
  * The idea of buying low / selling high
  * That prices can move quickly and unpredictably
* Crypto basics (even from blog posts or videos):
  * What Bitcoin or Ethereum are
  * That blockchains are shared databases nobody can easily rewrite

If you don’t have these yet, you can still read — just expect to jump back and forth to definitions and examples.

---

**3. For quant/strategy-heavy sections**

To get the most out of `/quant-math`, `/signals`, `/strategies`, and `/simulation`, it helps if you’re at least somewhat comfortable with:

* High-school algebra: solving simple equations, working with fractions and exponents
* Very basic probability:
  * What a random variable is (even informally)
  * The idea of averages and variability
* Basic statistics:
  * Mean, standard deviation, correlation at a conceptual level

> tip **Good enough to start** If words like “variance” or “correlation” feel fuzzy, that’s okay. Start with the intuition and examples; you can loop back to the formal math later.

---

#### Setup Prerequisites (Tools & Accounts)

You can read everything in Arth without touching real money. But for some pages, it helps to have a minimal setup so examples feel concrete.

**Recommended setup for most readers:**

* A modern browser (Chrome, Firefox, Brave, etc.)
* A DeFi-friendly wallet extension:
  * MetaMask, Rabby, or similar
* Access to at least one block explorer:
  * Etherscan, Arbiscan, etc.
* A safe environment to experiment:
  * Testnet funds where possible
  * Or a “play money only” wallet you’re willing to lose

For data and research oriented sections:

* Python 3.10+ installed, or a hosted notebook environment (Colab, Jupyter, etc.)
* Basic familiarity with:
  * Running notebooks
  * Installing packages (e.g., `pip install ...`)
* Optional but helpful:
  * A Dune Analytics account
  * A block explorer account with API keys

> warning **Never use your main wallet for experiments** When you follow examples, use fresh wallets or testnets. Mistakes, scams, and copy–paste errors are common and unforgiving.

---

#### Bridging Prerequisite Gaps

You don’t need to “complete” all prerequisites up front. Instead, treat them as a **map**:

* If a page feels too advanced:
  * Check its metadata `Prerequisites` line
  * Jump to those pages first, then come back
* If the math is heavy:
  * Skim formulas
  * Focus on diagrams, intuition, and examples
  * Bookmark the page and revisit after `/quant-math/` basics

A few common “repair paths”:

* If you’re lost on core concepts → start with:
  * [What Is DeFi](/welcome/what-is-defi)
  * [TradFi to DeFi](/start-here/tradfi-to-defi)
* If risk feels hand-wavy → read:
  * [Risk & Reality Check](/welcome/risk-reality-check)
  * [Risk Types](/risk/types)
* If the math is scary → try:
  * [Returns](/quant-math/returns)
  * [Volatility](/quant-math/volatility)

---

#### See Also

* [How to Navigate](/welcome/how-to-navigate)
* [Reading Paths](/welcome/reading-paths)
* [Risk & Reality Check](/welcome/risk-reality-check)
* [What Is DeFi](/welcome/what-is-defi)
* [TradFi to DeFi](/start-here/tradfi-to-defi)
