### Building a Simple Backtester

> info **Metadata** Level: Intermediate | Prerequisites: Event-Driven Backtesting, Returns | Tags: backtesting, engineering, accounting, architecture, simulation

Most people's first backtester is a loop that multiplies a signal by a return. It works, briefly, and then quietly becomes wrong the moment the strategy holds more than one instrument, uses leverage, pays financing, or is asked how much cash it had on a Tuesday. The fix is not more code. It is deciding, before any code, that the simulator has a **balance sheet** — cash and positions — and that every profit figure it reports is derived from that balance sheet rather than asserted alongside it.

A backtester is best understood as five replaceable parts joined by an event loop. Separating them is not architectural fussiness. It is how you make the flattering assumptions *visible*: when the fill model is its own object, "we assumed we always got the close, for free" becomes a class with a name that someone can object to, instead of a multiplication buried in a loop.

---

#### The Five Components

<table>
  <tbody>
    <tr><td><strong>Component</strong></td><td><strong>Responsibility</strong></td><td><strong>The assumption it hides</strong></td></tr>
    <tr><td>Data feed</td><td>Emits time-ordered events; exposes a point-in-time view</td><td>That you knew each datum when its timestamp says</td></tr>
    <tr><td>Strategy</td><td>Turns events into target positions or order intents</td><td>That the rule was fully specified in advance</td></tr>
    <tr><td>Execution model</td><td>Turns intents into fills at a price, a time and a cost</td><td>That anyone would have traded with you, at that price</td></tr>
    <tr><td>Portfolio</td><td>Holds cash and positions; enforces the accounting identity</td><td>That financing, borrow and margin are free or ignorable</td></tr>
    <tr><td>Recorder</td><td>Logs equity, exposure, turnover and every fill</td><td>Nothing — this is the only component that should hide nothing</td></tr>
  </tbody>
</table>

The recorder deserves more attention than it usually gets. A backtest that emits only a return series cannot answer the questions that decide whether the result is real: how much did it trade, how concentrated was it, when was it levered, what fraction of the profit came from the best five days. Instrument first, optimise later.

---

#### Formal Definition

The portfolio enforces one identity at every timestamp:

```text
equity_t  =  cash_t  +  SUM_i [ qty_i,t * mark_i,t ]
```

and cash evolves only through explicit, itemised events:

```text
cash_t  =  cash_(t-1)  -  SUM_i [ dq_i,t * fill_i,t ]  -  fees_t  -  financing_t  +  income_t
```

where:

- `qty_i,t` is the signed quantity of instrument `i` held at `t` (negative for a short)
- `mark_i,t` is the valuation price, which is *not* necessarily a price you could trade at
- `dq_i,t` is the quantity traded at `t`, signed the same way
- `fill_i,t` is the price the execution model assigned to that trade
- `fees_t` covers commission, exchange fees, taxes and, on-chain, gas
- `financing_t` covers margin interest, stock borrow and, for perpetuals, funding
- `income_t` covers dividends, coupons and rebates

Period return is computed from equity, never from a signal:

```text
R_t  =  equity_t / equity_(t-1)  -  1
```

> info **Make the identity a test** Recompute `equity_t` from scratch at every step and assert it matches the incremental figure to within floating-point tolerance. Nearly every accounting bug — a sign error on a short, a double-counted fee — trips this assertion on the bar it happens, not three months later in a performance review.

---

#### Worked Example

A single-instrument run over four bars. Starting cash is 100,000 and commission is 5 bps of traded notional, charged on both sides.

<table>
  <tbody>
    <tr><td><strong>Bar</strong></td><td><strong>Price</strong></td><td><strong>Action</strong></td><td><strong>Cash</strong></td><td><strong>Position</strong></td><td><strong>Equity</strong></td></tr>
    <tr><td>0</td><td>—</td><td>—</td><td>100,000.00</td><td>0</td><td>100,000.00</td></tr>
    <tr><td>1</td><td>100.00</td><td>Buy 500</td><td>49,975.00</td><td>500</td><td>99,975.00</td></tr>
    <tr><td>2</td><td>102.00</td><td>Hold</td><td>49,975.00</td><td>500</td><td>100,975.00</td></tr>
    <tr><td>3</td><td>101.00</td><td>Sell 500</td><td>100,449.75</td><td>0</td><td>100,449.75</td></tr>
    <tr><td>4</td><td>99.00</td><td>Flat</td><td>100,449.75</td><td>0</td><td>100,449.75</td></tr>
  </tbody>
</table>

Step by step:

1. **Bar 1 purchase**: notional `500 * 100.00 = 50,000.00`; commission `50,000.00 * 0.0005 = 25.00`; cash falls to `100,000.00 - 50,000.00 - 25.00 = 49,975.00`
2. **Bar 1 equity**: `49,975.00 + 500 * 100.00 = 99,975.00`. Equity drops on entry by exactly the commission — correct, and a useful sanity check
3. **Bar 2 mark**: `49,975.00 + 500 * 102.00 = 100,975.00`. No trade, so cash is untouched
4. **Bar 3 sale**: proceeds `500 * 101.00 = 50,500.00`; commission `50,500.00 * 0.0005 = 25.25`; cash rises to `49,975.00 + 50,500.00 - 25.25 = 100,449.75`
5. **Bar 4**: flat, so bar-4's price move is irrelevant. Equity is unchanged

Reconciliation: gross trading profit was `500 * (101.00 - 100.00) = 500.00`, total commission `25.00 + 25.25 = 50.25`, so net is `449.75` — matching the equity change exactly. Total return is `449.75 / 100,000 = 0.4498%`.

Note bar 4. A backtester built on signals rather than a balance sheet frequently books the bar-4 move against a stale position, because nothing forces the position to be zero. The identity above makes that impossible.

---

#### Point-in-Time Access and the Two-Timestamp Rule

The single most valuable structural decision is that the strategy never receives the dataset. It receives an accessor bound to the engine clock. Every record carries two timestamps: `event_time`, when the thing happened, and `knowledge_time`, when it could first have been observed. Replay is ordered by `knowledge_time`.

For a trade print the two coincide. For a quarterly earnings figure they are weeks apart, and for a *restated* earnings figure they can be a year apart. An index membership change is announced before it takes effect, so a strategy may legitimately know about a forthcoming addition — but only from the announcement, not from the effective date. Encoding these as separate columns turns a subtle research question into a boring lookup. See [Data Preparation for Backtests](/simulation/data-prep).

---

#### In Practice Across Asset Classes

**Daily equities.** The portfolio must handle splits, dividends, spin-offs and borrow. A short position accrues a borrow fee and pays the dividend away; omitting either turns a mediocre short book into a good one on paper. See [Short Selling](/markets/short-selling).

**Futures.** Positions are margined, not purchased, so `cash` and `notional` decouple. The portfolio tracks variation margin daily and the mark is the settlement price, which may differ from the last trade. Rolls are trades and must be charged as such.

**FX.** Every position is a pair of currencies, so the portfolio needs a base-currency convention and a valuation rate. Carry accrues through the tom-next swap rather than through anything resembling a coupon.

**Fixed income.** Accrued interest sits between clean and dirty price, and the mark is frequently a model output. Marking a position at a price no dealer would quote is a real and common source of imaginary profit.

**On-chain.** Gas is a fee that depends on network state rather than on trade size, which inverts the usual cost structure: small trades are penalised disproportionately. Positions may also be non-fungible, as with a concentrated liquidity range. See [Simulating LP Returns](/simulation/lp-returns).

---

#### Assumptions and Failure Modes

- **The mark is achievable.** Assumes you could liquidate at the valuation price. False for illiquid instruments, for size, and at any time near a close or auction. Equity curves built on unachievable marks are smooth for the wrong reason.
- **Costs are complete.** Assumes commission covers it. Broken by omitted borrow, financing, funding, exchange fees, taxes and gas. Each omission is a small, permanent, one-directional gift.
- **Fills happen at the intended price.** Assumes the execution model is right. It is the least verifiable component and deserves the harshest defaults. See [Orderbook Simulation](/simulation/orderbook).
- **Cash is unconstrained.** Assumes you can always fund the position. Broken by margin requirements, settlement lags and negative cash balances the simulator silently permits. Assert on it.
- **Determinism.** Assumes reruns produce identical output. Broken by unseeded randomness, dictionary ordering, parallel reduction order and wall-clock reads. Without determinism you cannot debug a discrepancy. See [Reproducible Research](/data-tooling/reproducible).
- **Sizing is exact.** Assumes fractional quantities. Broken by lot sizes, tick sizes and minimum notionals — which bind hardest on the small positions a diversified backtest is full of.

> warning **A backtester with no bugs is not the same as a backtester with no assumptions** Passing the accounting identity proves the arithmetic is consistent. It says nothing about whether the fill prices, marks and costs feeding that arithmetic describe a world you could have traded in.

---

#### Code

A portfolio object that makes the accounting identity checkable on every bar.

```python
class Portfolio:
    """Cash-and-positions ledger. Every profit figure derives from here."""

    def __init__(self, starting_cash, commission_rate=0.0005):
        self.cash = starting_cash
        self.positions = {}                     # symbol -> signed quantity
        self.commission_rate = commission_rate
        self.realised_costs = 0.0

    def trade(self, symbol, quantity, fill_price):
        """Signed quantity: positive buys, negative sells.

        Commission is charged on absolute notional so a short entry
        costs the same as a long entry, as it does at a real broker.
        """
        notional = quantity * fill_price
        commission = abs(notional) * self.commission_rate
        self.cash -= notional + commission
        self.realised_costs += commission
        self.positions[symbol] = self.positions.get(symbol, 0) + quantity

    def equity(self, marks):
        return self.cash + sum(qty * marks[sym] for sym, qty in self.positions.items())

    def gross_exposure(self, marks):
        # Reported alongside equity: a return series alone cannot
        # distinguish a good strategy from a levered mediocre one.
        return sum(abs(qty * marks[sym]) for sym, qty in self.positions.items())


book = Portfolio(100_000)
book.trade("XYZ", 500, 100.00)
assert round(book.equity({"XYZ": 100.00}), 2) == 99_975.00
book.trade("XYZ", -500, 101.00)
assert round(book.equity({"XYZ": 99.00}), 2) == 100_449.75
```

---

#### See Also

* [Event-Driven Backtesting Basics](/simulation/event-driven)
* [Data Preparation for Backtests](/simulation/data-prep)
* [Performance Metrics for Backtests](/simulation/metrics)
* [Backtesting Framework](/building-simulations/backtesting-framework)
* [Backtesting in Python](/simulation/python)
* [Transaction Cost Analysis](/execution/transaction-cost-analysis)

---
