## MEV Taxonomy & Examples

Miner/Maximal Extractable Value (MEV) covers any profit derived from reordering, inserting, or censoring
transactions. Understanding canonical patterns helps quantify opportunity size and detect potentially harmful
behavior.

### Arbitrage

Arbitrageurs exploit price gaps across AMMs, centralized exchanges, and lending markets. Bundles atomically
trade across venues, ensuring profit if the sequence executes. Profitability depends on gas costs, slippage,
and competition from other searchers.

### Sandwich attacks

Sandwiches place a buy before a victim swap and a sell after, capturing slippage. Mitigations include private
order flow, slippage limits, and off-chain RFQ systems. Quantifying expected profit requires modeling pool
depth, victim trade size, and gas bidding wars.

### Liquidations and forced trades

Under-collateralized loans trigger liquidators to repay debt in exchange for collateral at a discount.
Competition is fierce; protocols design Dutch auctions or sealed-bid systems to maximize recovered value while
keeping incentives aligned.

### Advanced patterns

Backrunning oracle updates, time-bandit attacks on previous blocks, and NFT sniping expand MEV beyond simple
swaps. Each requires specialized infrastructure, including mempool monitoring and customized simulators for
predicting post-trade state.
