# Data Pipeline & Historical Replay

Building a robust data pipeline is critical for accurate DeFi simulations. Your results are only as good as your data quality, completeness, and the fidelity of your replay mechanism.

## Data Sources

### On-Chain Data

```typescript
interface BlockData {
  number: number;
  timestamp: number;
  transactions: Transaction[];
  gasUsed: bigint;
  baseFeePerGas: bigint;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  gasPrice: bigint;
  gasUsed: bigint;
  input: string; // calldata
  logs: Log[];
}

class BlockchainDataProvider {
  constructor(private rpcUrl: string) {}

  async getBlock(blockNumber: number): Promise<BlockData> {
    const provider = new ethers.JsonRpcProvider(this.rpcUrl);
    const block = await provider.getBlock(blockNumber, true);
    
    return {
      number: block.number,
      timestamp: block.timestamp,
      transactions: block.prefetchedTransactions.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value,
        gasPrice: tx.gasPrice || 0n,
        gasUsed: 0n, // Need receipt for this
        input: tx.data,
        logs: [], // Need receipt for this
      })),
      gasUsed: block.gasUsed,
      baseFeePerGas: block.baseFeePerGas || 0n,
    };
  }

  async getBlockRange(from: number, to: number): Promise<BlockData[]> {
    const blocks: BlockData[] = [];
    for (let i = from; i <= to; i++) {
      blocks.push(await this.getBlock(i));
    }
    return blocks;
  }
}
```

### DEX Data

```python
import ccxt
import pandas as pd
from typing import List, Dict
import time

class DEXDataProvider:
    def __init__(self, exchange: str = 'binance'):
        self.exchange = getattr(ccxt, exchange)()
        
    def fetch_ohlcv(
        self,
        symbol: str,
        timeframe: str = '1m',
        since: int = None,
        limit: int = 1000
    ) -> pd.DataFrame:
        """Fetch OHLCV data from centralized exchange as proxy for DEX data"""
        ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, since, limit)
        
        df = pd.DataFrame(
            ohlcv,
            columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
        )
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    
    def fetch_orderbook(self, symbol: str, limit: int = 100) -> Dict:
        """Fetch orderbook snapshot"""
        orderbook = self.exchange.fetch_order_book(symbol, limit)
        return {
            'timestamp': orderbook['timestamp'],
            'bids': orderbook['bids'],  # [[price, size], ...]
            'asks': orderbook['asks'],
            'spread': orderbook['asks'][0][0] - orderbook['bids'][0][0]
        }
    
    def fetch_trades(
        self,
        symbol: str,
        since: int = None,
        limit: int = 1000
    ) -> List[Dict]:
        """Fetch recent trades"""
        trades = self.exchange.fetch_trades(symbol, since, limit)
        return [{
            'timestamp': t['timestamp'],
            'price': t['price'],
            'amount': t['amount'],
            'side': t['side'],  # 'buy' or 'sell'
            'cost': t['cost'],  # price * amount
        } for t in trades]
```

### Uniswap V3 Data

```typescript
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';

class UniswapV3DataProvider {
  constructor(private provider: ethers.Provider) {}

  async getPoolState(poolAddress: string): Promise<PoolState> {
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      this.provider
    );

    const [liquidity, slot0] = await Promise.all([
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

    return {
      liquidity: liquidity.toString(),
      sqrtPriceX96: slot0.sqrtPriceX96.toString(),
      tick: slot0.tick,
      observationIndex: slot0.observationIndex,
      observationCardinality: slot0.observationCardinality,
      feeProtocol: slot0.feeProtocol,
      unlocked: slot0.unlocked,
    };
  }

  async getHistoricalSwaps(
    poolAddress: string,
    fromBlock: number,
    toBlock: number
  ): Promise<Swap[]> {
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      this.provider
    );

    const filter = poolContract.filters.Swap();
    const events = await poolContract.queryFilter(filter, fromBlock, toBlock);

    return events.map(event => ({
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      sender: event.args.sender,
      recipient: event.args.recipient,
      amount0: event.args.amount0.toString(),
      amount1: event.args.amount1.toString(),
      sqrtPriceX96: event.args.sqrtPriceX96.toString(),
      liquidity: event.args.liquidity.toString(),
      tick: event.args.tick,
    }));
  }
}
```

## Data Storage & Indexing

### Time-Series Database

```python
import sqlite3
from datetime import datetime
import numpy as np

class TimeSeriesDB:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.create_tables()
    
    def create_tables(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS market_data (
                timestamp INTEGER PRIMARY KEY,
                symbol TEXT,
                open REAL,
                high REAL,
                low REAL,
                close REAL,
                volume REAL
            )
        ''')
        
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER,
                symbol TEXT,
                price REAL,
                amount REAL,
                side TEXT
            )
        ''')
        
        self.conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_market_timestamp 
            ON market_data(timestamp)
        ''')
        
        self.conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_trades_timestamp 
            ON trades(timestamp)
        ''')
        
        self.conn.commit()
    
    def insert_ohlcv(self, data: pd.DataFrame):
        """Insert OHLCV data"""
        data.to_sql('market_data', self.conn, if_exists='append', index=False)
    
    def insert_trades(self, trades: List[Dict]):
        """Insert trade data"""
        self.conn.executemany(
            'INSERT INTO trades (timestamp, symbol, price, amount, side) VALUES (?, ?, ?, ?, ?)',
            [(t['timestamp'], t['symbol'], t['price'], t['amount'], t['side']) for t in trades]
        )
        self.conn.commit()
    
    def query_range(
        self,
        start_time: datetime,
        end_time: datetime,
        symbol: str = None
    ) -> pd.DataFrame:
        """Query data in time range"""
        query = 'SELECT * FROM market_data WHERE timestamp >= ? AND timestamp <= ?'
        params = [int(start_time.timestamp() * 1000), int(end_time.timestamp() * 1000)]
        
        if symbol:
            query += ' AND symbol = ?'
            params.append(symbol)
        
        return pd.read_sql_query(query, self.conn, params=params)
```

## Historical Replay Engine

### Basic Replay

```python
class HistoricalReplay:
    def __init__(self, data_source: TimeSeriesDB):
        self.data_source = data_source
        self.current_time = None
        self.observers = []
    
    def register_observer(self, observer):
        """Register components that need data updates"""
        self.observers.append(observer)
    
    def replay(
        self,
        start_time: datetime,
        end_time: datetime,
        speed: float = 1.0
    ):
        """Replay historical data"""
        data = self.data_source.query_range(start_time, end_time)
        
        for idx, row in data.iterrows():
            self.current_time = row['timestamp']
            
            # Notify all observers
            for observer in self.observers:
                observer.on_data(row)
            
            # Simulate time passage
            if speed < float('inf'):
                time.sleep(1 / speed)
    
    def replay_with_trades(
        self,
        start_time: datetime,
        end_time: datetime
    ):
        """Replay with both candle data and individual trades"""
        candles = self.data_source.query_range(start_time, end_time)
        trades = self.data_source.query_trades(start_time, end_time)
        
        # Merge and sort by timestamp
        events = []
        for _, candle in candles.iterrows():
            events.append(('candle', candle))
        for trade in trades:
            events.append(('trade', trade))
        
        events.sort(key=lambda x: x[1]['timestamp'])
        
        for event_type, data in events:
            for observer in self.observers:
                if event_type == 'candle':
                    observer.on_candle(data)
                else:
                    observer.on_trade(data)
```

### High-Fidelity Replay with Order Book

```python
class OrderBookReplay:
    def __init__(self):
        self.bids = []  # List of [price, size]
        self.asks = []
        self.observers = []
    
    def replay_orderbook_snapshots(
        self,
        snapshots: List[Dict]
    ):
        """Replay orderbook snapshots"""
        for snapshot in snapshots:
            self.bids = snapshot['bids']
            self.asks = snapshot['asks']
            
            # Notify observers of orderbook update
            for observer in self.observers:
                observer.on_orderbook_update({
                    'timestamp': snapshot['timestamp'],
                    'bids': self.bids,
                    'asks': self.asks,
                    'mid_price': self.get_mid_price()
                })
    
    def get_mid_price(self) -> float:
        if not self.bids or not self.asks:
            return 0.0
        return (self.bids[0][0] + self.asks[0][0]) / 2
    
    def simulate_market_impact(
        self,
        size: float,
        side: str
    ) -> float:
        """Calculate average execution price for market order"""
        book = self.asks if side == 'buy' else self.bids
        
        remaining = size
        total_cost = 0.0
        
        for price, available in book:
            if remaining <= 0:
                break
            
            fill_size = min(remaining, available)
            total_cost += fill_size * price
            remaining -= fill_size
        
        if remaining > 0:
            # Not enough liquidity
            return float('inf')
        
        return total_cost / size
```

## Data Validation & Cleaning

```python
class DataValidator:
    @staticmethod
    def validate_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
        """Validate and clean OHLCV data"""
        # Check for missing values
        if df.isnull().any().any():
            print(f"Warning: Found {df.isnull().sum().sum()} missing values")
            df = df.fillna(method='ffill')
        
        # Check for price consistency
        invalid = (
            (df['high'] < df['low']) |
            (df['high'] < df['open']) |
            (df['high'] < df['close']) |
            (df['low'] > df['open']) |
            (df['low'] > df['close'])
        )
        
        if invalid.any():
            print(f"Warning: Found {invalid.sum()} invalid candles")
            df = df[~invalid]
        
        # Check for outliers (price jumps > 50%)
        df['price_change'] = df['close'].pct_change()
        outliers = df['price_change'].abs() > 0.5
        
        if outliers.any():
            print(f"Warning: Found {outliers.sum()} potential outliers")
            # You may want to investigate these manually
        
        # Check for volume anomalies
        volume_mean = df['volume'].mean()
        volume_std = df['volume'].std()
        volume_outliers = df['volume'] > (volume_mean + 3 * volume_std)
        
        if volume_outliers.any():
            print(f"Warning: Found {volume_outliers.sum()} volume outliers")
        
        return df
    
    @staticmethod
    def detect_gaps(df: pd.DataFrame, expected_interval: int = 60000) -> List[tuple]:
        """Detect gaps in time series data"""
        gaps = []
        
        for i in range(1, len(df)):
            time_diff = df.iloc[i]['timestamp'] - df.iloc[i-1]['timestamp']
            if time_diff > expected_interval * 1.5:
                gaps.append((
                    df.iloc[i-1]['timestamp'],
                    df.iloc[i]['timestamp'],
                    time_diff
                ))
        
        return gaps
```

## Complete Pipeline Example

```python
class DeFiDataPipeline:
    def __init__(self):
        self.db = TimeSeriesDB('defi_data.db')
        self.validator = DataValidator()
        self.providers = {
            'dex': DEXDataProvider('binance'),
            'blockchain': BlockchainDataProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
            'uniswap': UniswapV3DataProvider(provider)
        }
    
    async def fetch_and_store(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime
    ):
        """Fetch data from multiple sources and store"""
        print(f"Fetching data for {symbol} from {start_date} to {end_date}")
        
        # Fetch OHLCV data
        ohlcv = self.providers['dex'].fetch_ohlcv(
            symbol,
            since=int(start_date.timestamp() * 1000)
        )
        
        # Validate
        ohlcv = self.validator.validate_ohlcv(ohlcv)
        
        # Store
        self.db.insert_ohlcv(ohlcv)
        
        print(f"Stored {len(ohlcv)} candles")
        
        # Check for gaps
        gaps = self.validator.detect_gaps(ohlcv)
        if gaps:
            print(f"Found {len(gaps)} gaps in data")
            for start, end, duration in gaps:
                print(f"  Gap from {start} to {end} ({duration}ms)")
    
    def create_replay_engine(
        self,
        start_time: datetime,
        end_time: datetime
    ) -> HistoricalReplay:
        """Create a replay engine for the specified time range"""
        replay = HistoricalReplay(self.db)
        return replay

# Usage
async def main():
    pipeline = DeFiDataPipeline()
    
    # Fetch data
    await pipeline.fetch_and_store(
        'ETH/USDT',
        datetime(2024, 1, 1),
        datetime(2024, 12, 31)
    )
    
    # Create replay engine
    replay = pipeline.create_replay_engine(
        datetime(2024, 1, 1),
        datetime(2024, 1, 7)
    )
    
    # Register strategy
    strategy = MyStrategy()
    replay.register_observer(strategy)
    
    # Run simulation
    replay.replay(
        datetime(2024, 1, 1),
        datetime(2024, 1, 7),
        speed=100.0  # 100x speed
    )
```

## Best Practices

1. **Data Quality First**: Spend time validating and cleaning data before simulation
2. **Incremental Updates**: Store data incrementally to avoid refetching
3. **Multiple Sources**: Cross-reference data from multiple sources for accuracy
4. **Handle Gaps**: Decide how to handle missing data (skip, interpolate, or backfill)
5. **Version Control**: Keep track of data versions and transformations
6. **Benchmarking**: Compare your data against known events (e.g., major hacks, price crashes)
7. **Storage Efficiency**: Use compression for large datasets

## Next Steps

- Learn about [Event-Driven Architecture](/building-simulations/event-driven-architecture) for processing data streams
- Explore [Performance Optimization](/building-simulations/performance-optimization) for handling large datasets
- See [Backtesting Framework](/building-simulations/backtesting-framework) for using historical data in backtests
