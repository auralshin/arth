# Performance Optimization for Simulations

DeFi simulations can be computationally intensive, especially when:
- Running Monte Carlo simulations with thousands of paths
- Processing years of high-frequency tick data
- Simulating complex multi-agent systems
- Testing strategies across multiple parameter combinations

This guide covers techniques to make your simulations faster and more efficient.

## Profiling First

Always profile before optimizing. Python's `cProfile` and `line_profiler` are your friends:

```python
import cProfile
import pstats

def profile_simulation():
    profiler = cProfile.Profile()
    profiler.enable()
    
    # Run your simulation
    run_backtest()
    
    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(20)  # Top 20 functions

# Or use decorator
from functools import wraps

def profile(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()
        result = func(*args, **kwargs)
        profiler.disable()
        
        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative')
        stats.print_stats(10)
        
        return result
    return wrapper

@profile
def my_simulation():
    # ... simulation code ...
    pass
```

## Vectorization with NumPy

Replace loops with vectorized operations:

```python
import numpy as np

# BAD: Loop-based calculation
def calculate_returns_slow(prices):
    returns = []
    for i in range(1, len(prices)):
        ret = (prices[i] - prices[i-1]) / prices[i-1]
        returns.append(ret)
    return returns

# GOOD: Vectorized calculation
def calculate_returns_fast(prices):
    return np.diff(prices) / prices[:-1]

# Performance comparison
import time

prices = np.random.randn(100000).cumsum() + 100
start = time.time()
returns_slow = calculate_returns_slow(prices)
print(f"Loop: {time.time() - start:.4f}s")

start = time.time()
returns_fast = calculate_returns_fast(prices)
print(f"Vectorized: {time.time() - start:.4f}s")

# Vectorized is typically 10-100x faster!
```

### Vectorized Backtesting

```python
class VectorizedBacktester:
    def __init__(self, data: np.ndarray):
        self.data = data  # OHLCV data
        self.positions = np.zeros(len(data))
        self.signals = np.zeros(len(data))
    
    def sma_crossover(self, short_window: int, long_window: int):
        """Calculate SMA crossover signals vectorized"""
        prices = self.data[:, 3]  # Close prices
        
        # Calculate SMAs
        short_sma = np.convolve(prices, np.ones(short_window)/short_window, mode='valid')
        long_sma = np.convolve(prices, np.ones(long_window)/long_window, mode='valid')
        
        # Align arrays
        offset = long_window - 1
        short_sma = short_sma[offset:]
        
        # Generate signals
        signals = np.zeros(len(prices))
        signals[long_window-1:] = np.where(short_sma > long_sma, 1, -1)
        
        return signals
    
    def calculate_returns(self, signals: np.ndarray):
        """Calculate strategy returns"""
        prices = self.data[:, 3]
        market_returns = np.diff(prices) / prices[:-1]
        
        # Shift signals by 1 (can't trade on same bar)
        strategy_returns = signals[:-1] * market_returns
        
        return {
            'total_return': np.prod(1 + strategy_returns) - 1,
            'sharpe': np.mean(strategy_returns) / np.std(strategy_returns) * np.sqrt(252),
            'max_drawdown': self._max_drawdown(strategy_returns)
        }
    
    def _max_drawdown(self, returns: np.ndarray):
        """Calculate maximum drawdown"""
        cumulative = np.cumprod(1 + returns)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max
        return np.min(drawdown)
```

## Parallel Processing

### Multiprocessing for CPU-Bound Tasks

```python
from multiprocessing import Pool, cpu_count
import numpy as np

def run_single_simulation(params):
    """Run a single simulation with given parameters"""
    seed, strategy_params = params
    np.random.seed(seed)
    
    # Run simulation
    result = backtest_strategy(strategy_params)
    return result

def parallel_monte_carlo(n_simulations: int, strategy_params: dict):
    """Run Monte Carlo simulations in parallel"""
    # Create parameter sets
    params = [(i, strategy_params) for i in range(n_simulations)]
    
    # Run in parallel
    with Pool(cpu_count() - 1) as pool:
        results = pool.map(run_single_simulation, params)
    
    return results

# Usage
results = parallel_monte_carlo(1000, {'sma_short': 10, 'sma_long': 50})
avg_return = np.mean([r['return'] for r in results])
print(f"Average return across {len(results)} simulations: {avg_return:.2%}")
```

### Parameter Optimization

```python
from itertools import product

def optimize_parameters_parallel():
    """Optimize strategy parameters in parallel"""
    # Parameter grid
    short_windows = range(5, 50, 5)
    long_windows = range(50, 200, 10)
    
    # Create all combinations
    param_combinations = list(product(short_windows, long_windows))
    param_combinations = [
        (short, long) for short, long in param_combinations if short < long
    ]
    
    print(f"Testing {len(param_combinations)} parameter combinations")
    
    # Run in parallel
    with Pool(cpu_count() - 1) as pool:
        results = pool.starmap(test_strategy, param_combinations)
    
    # Find best
    best_idx = np.argmax([r['sharpe'] for r in results])
    best_params = param_combinations[best_idx]
    best_result = results[best_idx]
    
    return best_params, best_result

def test_strategy(short_window: int, long_window: int):
    """Test a single parameter combination"""
    backtester = VectorizedBacktester(load_data())
    signals = backtester.sma_crossover(short_window, long_window)
    return backtester.calculate_returns(signals)
```

## Numba JIT Compilation

For hot loops, use Numba to compile Python to machine code:

```python
from numba import jit, prange
import numpy as np

@jit(nopython=True)
def calculate_ema_fast(prices, window):
    """Calculate EMA with Numba acceleration"""
    alpha = 2 / (window + 1)
    ema = np.empty_like(prices)
    ema[0] = prices[0]
    
    for i in range(1, len(prices)):
        ema[i] = alpha * prices[i] + (1 - alpha) * ema[i-1]
    
    return ema

@jit(nopython=True, parallel=True)
def monte_carlo_paths(S0, mu, sigma, T, dt, n_paths):
    """Generate Monte Carlo paths with Numba"""
    n_steps = int(T / dt)
    paths = np.zeros((n_paths, n_steps + 1))
    paths[:, 0] = S0
    
    for i in prange(n_paths):
        for j in range(1, n_steps + 1):
            dW = np.random.normal(0, np.sqrt(dt))
            paths[i, j] = paths[i, j-1] * np.exp(
                (mu - 0.5 * sigma**2) * dt + sigma * dW
            )
    
    return paths

# Performance comparison
import time

prices = np.random.randn(1000000).cumsum() + 100

start = time.time()
ema_slow = calculate_ema_slow(prices, 20)
print(f"Python: {time.time() - start:.4f}s")

start = time.time()
ema_fast = calculate_ema_fast(prices, 20)
print(f"Numba: {time.time() - start:.4f}s")

# Numba is typically 50-100x faster!
```

## Efficient Data Structures

### Using Pandas Efficiently

```python
import pandas as pd

# BAD: Iterating over DataFrame rows
def calculate_signals_slow(df):
    signals = []
    for i in range(len(df)):
        if df.iloc[i]['sma_short'] > df.iloc[i]['sma_long']:
            signals.append(1)
        else:
            signals.append(-1)
    return signals

# GOOD: Vectorized operations
def calculate_signals_fast(df):
    return np.where(df['sma_short'] > df['sma_long'], 1, -1)

# GOOD: Use .loc for setting values
df.loc[df['sma_short'] > df['sma_long'], 'signal'] = 1
df.loc[df['sma_short'] <= df['sma_long'], 'signal'] = -1
```

### Categorical Data

```python
# Convert string columns to categorical to save memory
df['symbol'] = df['symbol'].astype('category')
df['side'] = df['side'].astype('category')

# Check memory usage
print(df.memory_usage(deep=True))
```

## Caching & Memoization

```python
from functools import lru_cache
import hashlib
import pickle

@lru_cache(maxsize=128)
def expensive_calculation(param1, param2):
    """Cache results of expensive calculations"""
    # ... expensive computation ...
    return result

# For unhashable arguments, use manual caching
class CachedBacktester:
    def __init__(self):
        self.cache = {}
    
    def _hash_params(self, params: dict) -> str:
        """Create hash of parameters"""
        param_str = str(sorted(params.items()))
        return hashlib.md5(param_str.encode()).hexdigest()
    
    def run_backtest(self, params: dict):
        """Run backtest with caching"""
        cache_key = self._hash_params(params)
        
        if cache_key in self.cache:
            print("Cache hit!")
            return self.cache[cache_key]
        
        print("Cache miss, running backtest...")
        result = self._run_backtest_impl(params)
        self.cache[cache_key] = result
        
        return result
    
    def save_cache(self, filename: str):
        """Save cache to disk"""
        with open(filename, 'wb') as f:
            pickle.dump(self.cache, f)
    
    def load_cache(self, filename: str):
        """Load cache from disk"""
        with open(filename, 'rb') as f:
            self.cache = pickle.load(f)
```

## Memory Optimization

### Chunked Processing

```python
def process_large_dataset_chunked(filename: str, chunksize: int = 10000):
    """Process large CSV file in chunks"""
    results = []
    
    for chunk in pd.read_csv(filename, chunksize=chunksize):
        # Process chunk
        chunk_result = process_chunk(chunk)
        results.append(chunk_result)
    
    return pd.concat(results)

def process_chunk(chunk: pd.DataFrame):
    """Process a single chunk"""
    # Calculate metrics on chunk
    chunk['returns'] = chunk['close'].pct_change()
    chunk['sma'] = chunk['close'].rolling(20).mean()
    return chunk[['timestamp', 'returns', 'sma']]
```

### Data Type Optimization

```python
def optimize_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    """Reduce memory usage by optimizing data types"""
    for col in df.columns:
        col_type = df[col].dtype
        
        if col_type != object:
            c_min = df[col].min()
            c_max = df[col].max()
            
            if str(col_type)[:3] == 'int':
                if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                    df[col] = df[col].astype(np.int8)
                elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                    df[col] = df[col].astype(np.int16)
                elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                    df[col] = df[col].astype(np.int32)
            
            elif str(col_type)[:5] == 'float':
                if c_min > np.finfo(np.float32).min and c_max < np.finfo(np.float32).max:
                    df[col] = df[col].astype(np.float32)
    
    return df

# Before
print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

# After
df = optimize_dtypes(df)
print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
```

## GPU Acceleration with CuPy

For large-scale simulations, use GPU:

```python
import cupy as cp

# Replace NumPy arrays with CuPy arrays
def monte_carlo_gpu(S0, mu, sigma, T, dt, n_paths):
    """Monte Carlo simulation on GPU"""
    n_steps = int(T / dt)
    
    # Create arrays on GPU
    paths = cp.zeros((n_paths, n_steps + 1))
    paths[:, 0] = S0
    
    # Generate random numbers on GPU
    dW = cp.random.normal(0, cp.sqrt(dt), size=(n_paths, n_steps))
    
    # Vectorized path generation
    for j in range(1, n_steps + 1):
        paths[:, j] = paths[:, j-1] * cp.exp(
            (mu - 0.5 * sigma**2) * dt + sigma * dW[:, j-1]
        )
    
    # Transfer back to CPU if needed
    return cp.asnumpy(paths)

# Usage
paths = monte_carlo_gpu(100, 0.05, 0.2, 1.0, 1/252, 10000)
```

## Complete Optimized Backtest Example

```python
class OptimizedBacktester:
    def __init__(self, data: np.ndarray):
        self.data = data
        self.cache = {}
    
    @profile
    def run(self, params: dict) -> dict:
        """Run optimized backtest"""
        # Check cache
        cache_key = self._hash_params(params)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Calculate indicators (vectorized)
        signals = self._calculate_signals_vectorized(params)
        
        # Calculate returns (vectorized)
        metrics = self._calculate_metrics_vectorized(signals)
        
        # Cache result
        self.cache[cache_key] = metrics
        
        return metrics
    
    def _calculate_signals_vectorized(self, params: dict) -> np.ndarray:
        """Generate trading signals using vectorized operations"""
        prices = self.data[:, 3]  # Close prices
        
        short_window = params['short_window']
        long_window = params['long_window']
        
        # Use Numba-accelerated SMA calculation
        short_sma = self._sma_numba(prices, short_window)
        long_sma = self._sma_numba(prices, long_window)
        
        return np.where(short_sma > long_sma, 1, -1)
    
    @staticmethod
    @jit(nopython=True)
    def _sma_numba(prices, window):
        """Numba-accelerated SMA calculation"""
        sma = np.empty_like(prices)
        sma[:window] = np.nan
        
        for i in range(window, len(prices)):
            sma[i] = np.mean(prices[i-window:i])
        
        return sma
    
    def _calculate_metrics_vectorized(self, signals: np.ndarray) -> dict:
        """Calculate performance metrics"""
        prices = self.data[:, 3]
        returns = np.diff(prices) / prices[:-1]
        strategy_returns = signals[:-1] * returns
        
        # Vectorized metrics
        cumulative = np.cumprod(1 + strategy_returns)
        
        return {
            'total_return': cumulative[-1] - 1,
            'sharpe': np.mean(strategy_returns) / np.std(strategy_returns) * np.sqrt(252),
            'max_drawdown': self._max_drawdown_numba(cumulative),
            'win_rate': np.sum(strategy_returns > 0) / len(strategy_returns)
        }
    
    @staticmethod
    @jit(nopython=True)
    def _max_drawdown_numba(cumulative):
        """Numba-accelerated max drawdown"""
        max_dd = 0.0
        peak = cumulative[0]
        
        for value in cumulative:
            if value > peak:
                peak = value
            dd = (peak - value) / peak
            if dd > max_dd:
                max_dd = dd
        
        return max_dd
    
    def _hash_params(self, params: dict) -> str:
        import hashlib
        param_str = str(sorted(params.items()))
        return hashlib.md5(param_str.encode()).hexdigest()

# Performance comparison
import time

data = np.random.randn(100000, 5)
params = {'short_window': 20, 'long_window': 50}

# Unoptimized
start = time.time()
result1 = slow_backtester.run(params)
print(f"Unoptimized: {time.time() - start:.4f}s")

# Optimized
start = time.time()
result2 = OptimizedBacktester(data).run(params)
print(f"Optimized: {time.time() - start:.4f}s")

# Typical speedup: 10-100x
```

## Best Practices

1. **Profile First**: Don't optimize prematurely - measure where time is spent
2. **Vectorize**: Use NumPy/Pandas vectorized operations instead of loops
3. **Use Numba**: Compile hot loops with Numba for near-C performance
4. **Parallel Processing**: Use multiprocessing for embarrassingly parallel tasks
5. **Cache Results**: Don't recompute the same calculations
6. **Optimize Data Types**: Use appropriate data types to save memory
7. **Chunk Large Datasets**: Process data in manageable chunks
8. **GPU When Needed**: For truly large-scale simulations, use GPU acceleration

## Benchmarking Results

Typical speedups you can expect:

| Optimization | Speedup |
|--------------|---------|
| Vectorization (NumPy) | 10-100x |
| Numba JIT | 50-100x |
| Multiprocessing | Nx (N = cores) |
| GPU (CuPy) | 100-1000x |
| Caching | ∞ (instant) |
| Data type optimization | 2-5x memory reduction |

## Next Steps

- Learn about [Event-Driven Architecture](/building-simulations/event-driven-architecture) for efficient event processing
- Explore [Data Pipeline & Replay](/building-simulations/data-pipeline-replay) for optimized data handling
- See [Backtesting Framework](/building-simulations/backtesting-framework) for putting it all together
