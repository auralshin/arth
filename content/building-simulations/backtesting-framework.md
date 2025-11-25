### Backtesting Framework

Learn how to build a robust backtesting framework for testing DeFi trading strategies against historical data.

#### Core Components

**1. Data Pipeline**
```python
class DataPipeline:
    def __init__(self, data_source):
        self.data_source = data_source
        self.cache = {}
    
    def fetch_historical_data(self, pair, start_date, end_date):
        """Fetch OHLCV and on-chain data"""
        pass
    
    def preprocess(self, data):
        """Clean and normalize data"""
        pass
```

**2. Event System**
```typescript
interface MarketEvent {
    timestamp: number;
    type: 'trade' | 'quote' | 'liquidation';
    data: any;
}

class EventBus {
    private subscribers = new Map();
    
    subscribe(eventType: string, handler: Function) {
        // Add subscriber
    }
    
    publish(event: MarketEvent) {
        // Notify subscribers
    }
}
```

**3. Strategy Interface**
```python
from abc import ABC, abstractmethod

class Strategy(ABC):
    @abstractmethod
    def on_data(self, event):
        """Process market data"""
        pass
    
    @abstractmethod
    def generate_signals(self):
        """Generate trading signals"""
        pass
    
    @abstractmethod
    def execute_orders(self, signals):
        """Execute trades"""
        pass
```

#### Building the Backtester

```python
class Backtester:
    def __init__(self, strategy, initial_capital=10000):
        self.strategy = strategy
        self.portfolio = Portfolio(initial_capital)
        self.event_bus = EventBus()
        
    def run(self, data, start_date, end_date):
        """Run backtest over historical data"""
        events = self.prepare_events(data, start_date, end_date)
        
        for event in events:
            # Process event
            self.strategy.on_data(event)
            
            # Generate signals
            signals = self.strategy.generate_signals()
            
            # Execute orders
            orders = self.strategy.execute_orders(signals)
            
            # Update portfolio
            self.portfolio.process_orders(orders, event)
        
        return self.calculate_metrics()
    
    def calculate_metrics(self):
        """Calculate performance metrics"""
        return {
            'total_return': self.portfolio.total_return(),
            'sharpe_ratio': self.portfolio.sharpe_ratio(),
            'max_drawdown': self.portfolio.max_drawdown(),
            'win_rate': self.portfolio.win_rate()
        }
```

#### Handling DeFi-Specific Concerns

**Gas Costs**:
```python
class GasModel:
    def estimate_gas(self, tx_type, network_congestion):
        base_gas = GAS_COSTS[tx_type]
        multiplier = 1 + (network_congestion / 100)
        return base_gas * multiplier * self.gas_price
```

**Slippage**:
```python
def calculate_slippage(order_size, liquidity_depth):
    """Price impact based on AMM curve"""
    k = liquidity_depth['x'] * liquidity_depth['y']
    new_y = k / (liquidity_depth['x'] + order_size)
    price_impact = (liquidity_depth['y'] - new_y) / order_size
    return price_impact
```

**MEV Impact**:
```python
class MEVModel:
    def simulate_sandwich_attack(self, user_trade):
        """Model sandwich attack probability and impact"""
        if user_trade.size > SANDWICH_THRESHOLD:
            frontrun_amount = user_trade.size * 0.1
            profit = self.calculate_mev_profit(frontrun_amount, user_trade)
            return user_trade.adjust_for_mev(profit)
        return user_trade
```

#### Complete Example

```python
class SimpleAMMStrategy(Strategy):
    def __init__(self, pair, threshold=0.02):
        self.pair = pair
        self.threshold = threshold
        self.position = None
    
    def on_data(self, event):
        self.current_price = event.price
        self.liquidity = event.liquidity
    
    def generate_signals(self):
        # Simple mean reversion
        if self.current_price > self.moving_average * (1 + self.threshold):
            return 'SELL'
        elif self.current_price < self.moving_average * (1 - self.threshold):
            return 'BUY'
        return 'HOLD'
    
    def execute_orders(self, signal):
        if signal == 'BUY' and not self.position:
            return Order('BUY', self.pair, self.calculate_size())
        elif signal == 'SELL' and self.position:
            return Order('SELL', self.pair, self.position.size)
        return None

# Run backtest
strategy = SimpleAMMStrategy('ETH-USDC')
backtester = Backtester(strategy, initial_capital=10000)
results = backtester.run(historical_data, '2024-01-01', '2024-12-31')

print(f"Total Return: {results['total_return']:.2%}")
print(f"Sharpe Ratio: {results['sharpe_ratio']:.2f}")
print(f"Max Drawdown: {results['max_drawdown']:.2%}")
```

#### Best Practices

1. **Avoid Look-Ahead Bias**: Only use data available at simulation time
2. **Model Transaction Costs**: Include gas, slippage, and MEV
3. **Realistic Order Execution**: Account for block times and confirmation delays
4. **Proper Train/Test Split**: Validate strategies on out-of-sample data
5. **Walk-Forward Analysis**: Test strategy adaptation over time

#### Next Steps

- Implement agent-based simulations for multi-player scenarios
- Build event-driven architecture for real-time testing
- Optimize performance for large-scale backtests
