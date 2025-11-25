# Event-Driven Architecture for Simulations

Building robust DeFi simulations requires a flexible architecture that can handle complex interactions between components. Event-driven architecture (EDA) provides a powerful pattern for organizing simulation logic, enabling:

- **Decoupled Components**: Modules communicate through events rather than direct calls
- **Temporal Ordering**: Events can be queued and processed in chronological order
- **Auditability**: Every action creates a traceable event record
- **Extensibility**: New components can subscribe to existing events without modifying core logic

## Core Concepts

### Event Types

```typescript
enum EventType {
  MARKET_DATA = 'market_data',
  TRADE_SIGNAL = 'trade_signal',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_FILLED = 'order_filled',
  POSITION_UPDATED = 'position_updated',
  LIQUIDATION = 'liquidation',
  MEV_OPPORTUNITY = 'mev_opportunity',
  BLOCK_MINED = 'block_mined',
}

interface SimulationEvent {
  id: string;
  type: EventType;
  timestamp: number;
  data: any;
  metadata?: {
    source: string;
    priority: number;
    blockNumber?: number;
  };
}
```

### Event Bus

The event bus is the central nervous system of your simulation:

```typescript
class EventBus {
  private subscribers: Map<EventType, Set<EventHandler>> = new Map();
  private eventQueue: PriorityQueue<SimulationEvent> = new PriorityQueue();
  private eventHistory: SimulationEvent[] = [];

  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: EventType, handler: EventHandler): void {
    this.subscribers.get(eventType)?.delete(handler);
  }

  publish(event: SimulationEvent): void {
    this.eventQueue.enqueue(event, event.metadata?.priority || 0);
    this.eventHistory.push(event);
  }

  async processNext(): Promise<boolean> {
    const event = this.eventQueue.dequeue();
    if (!event) return false;

    const handlers = this.subscribers.get(event.type) || new Set();
    await Promise.all(
      Array.from(handlers).map(handler => handler(event))
    );

    return true;
  }

  async processAll(): Promise<void> {
    while (await this.processNext()) {
      // Continue processing
    }
  }

  getHistory(filter?: EventType): SimulationEvent[] {
    if (!filter) return this.eventHistory;
    return this.eventHistory.filter(e => e.type === filter);
  }
}
```

## Simulation Components as Event Producers/Consumers

### Market Data Provider

```typescript
class MarketDataProvider {
  constructor(private eventBus: EventBus) {}

  async loadHistoricalData(pair: string, from: Date, to: Date): Promise<void> {
    const candles = await fetchOHLCV(pair, from, to);
    
    for (const candle of candles) {
      this.eventBus.publish({
        id: `market_${candle.timestamp}`,
        type: EventType.MARKET_DATA,
        timestamp: candle.timestamp,
        data: {
          pair,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        },
        metadata: {
          source: 'historical_data',
          priority: 1,
        },
      });
    }
  }
}
```

### Strategy Engine

```typescript
class StrategyEngine {
  constructor(
    private eventBus: EventBus,
    private strategy: TradingStrategy
  ) {
    // Subscribe to market data
    this.eventBus.subscribe(EventType.MARKET_DATA, this.onMarketData.bind(this));
  }

  private async onMarketData(event: SimulationEvent): Promise<void> {
    const signal = this.strategy.evaluate(event.data);
    
    if (signal) {
      this.eventBus.publish({
        id: `signal_${event.timestamp}`,
        type: EventType.TRADE_SIGNAL,
        timestamp: event.timestamp,
        data: signal,
        metadata: {
          source: 'strategy_engine',
          priority: 2,
        },
      });
    }
  }
}
```

### Order Execution Engine

```typescript
class OrderExecutionEngine {
  constructor(
    private eventBus: EventBus,
    private exchange: SimulatedExchange
  ) {
    this.eventBus.subscribe(EventType.TRADE_SIGNAL, this.onTradeSignal.bind(this));
  }

  private async onTradeSignal(event: SimulationEvent): Promise<void> {
    const { action, size, price } = event.data;
    
    // Submit order
    const orderId = await this.exchange.submitOrder({
      action,
      size,
      price,
      timestamp: event.timestamp,
    });

    this.eventBus.publish({
      id: `order_${orderId}`,
      type: EventType.ORDER_SUBMITTED,
      timestamp: event.timestamp,
      data: { orderId, action, size, price },
      metadata: {
        source: 'execution_engine',
        priority: 3,
      },
    });

    // Simulate fill (in real scenario, this would come from exchange)
    const fillPrice = this.simulateFill(price, action);
    
    this.eventBus.publish({
      id: `fill_${orderId}`,
      type: EventType.ORDER_FILLED,
      timestamp: event.timestamp + 1, // Next block
      data: { orderId, fillPrice, size, action },
      metadata: {
        source: 'execution_engine',
        priority: 4,
      },
    });
  }

  private simulateFill(price: number, action: 'buy' | 'sell'): number {
    // Add slippage
    const slippage = 0.001; // 0.1%
    return action === 'buy' 
      ? price * (1 + slippage) 
      : price * (1 - slippage);
  }
}
```

## Advanced Patterns

### Event Replay for Debugging

```typescript
class EventReplayer {
  constructor(private eventBus: EventBus) {}

  replay(events: SimulationEvent[]): void {
    // Clear current state
    this.eventBus.clear();
    
    // Republish events in order
    events.sort((a, b) => a.timestamp - b.timestamp);
    events.forEach(event => this.eventBus.publish(event));
  }

  replayFrom(timestamp: number): void {
    const history = this.eventBus.getHistory();
    const futureEvents = history.filter(e => e.timestamp >= timestamp);
    this.replay(futureEvents);
  }
}
```

### Conditional Event Processing

```typescript
class ConditionalProcessor {
  constructor(private eventBus: EventBus) {
    this.eventBus.subscribe(EventType.ORDER_FILLED, this.checkLiquidation.bind(this));
  }

  private async checkLiquidation(event: SimulationEvent): Promise<void> {
    const position = this.getPosition();
    const currentPrice = this.getCurrentPrice();
    
    if (this.isLiquidatable(position, currentPrice)) {
      this.eventBus.publish({
        id: `liquidation_${event.timestamp}`,
        type: EventType.LIQUIDATION,
        timestamp: event.timestamp,
        data: {
          position,
          liquidationPrice: currentPrice,
          loss: this.calculateLoss(position, currentPrice),
        },
        metadata: {
          source: 'risk_manager',
          priority: 10, // High priority
        },
      });
    }
  }
}
```

### Event Aggregation

```typescript
class EventAggregator {
  private buffer: Map<EventType, SimulationEvent[]> = new Map();
  
  constructor(
    private eventBus: EventBus,
    private windowSize: number
  ) {}

  aggregate(eventType: EventType, aggregator: (events: SimulationEvent[]) => any): void {
    this.eventBus.subscribe(eventType, (event) => {
      if (!this.buffer.has(eventType)) {
        this.buffer.set(eventType, []);
      }
      
      const events = this.buffer.get(eventType)!;
      events.push(event);
      
      // Keep only last N events
      if (events.length > this.windowSize) {
        events.shift();
      }
      
      // Publish aggregated event
      const aggregated = aggregator(events);
      this.eventBus.publish({
        id: `aggregated_${eventType}_${event.timestamp}`,
        type: EventType.MARKET_DATA, // or custom type
        timestamp: event.timestamp,
        data: aggregated,
        metadata: {
          source: 'aggregator',
          priority: 0,
        },
      });
    });
  }
}

// Usage
const aggregator = new EventAggregator(eventBus, 100);
aggregator.aggregate(EventType.MARKET_DATA, (events) => {
  const prices = events.map(e => e.data.close);
  return {
    sma: average(prices),
    std: standardDeviation(prices),
    volume: sum(events.map(e => e.data.volume)),
  };
});
```

## Block-Based Event Processing

For blockchain simulations, organize events by block:

```typescript
class BlockProcessor {
  private pendingTransactions: SimulationEvent[] = [];
  
  constructor(
    private eventBus: EventBus,
    private blockTime: number = 12000 // 12 seconds
  ) {}

  submitTransaction(event: SimulationEvent): void {
    this.pendingTransactions.push(event);
  }

  async mineBlock(blockNumber: number, timestamp: number): Promise<void> {
    // Sort by priority (gas price)
    this.pendingTransactions.sort((a, b) => 
      (b.metadata?.priority || 0) - (a.metadata?.priority || 0)
    );

    // Process transactions in order
    for (const tx of this.pendingTransactions) {
      await this.eventBus.processNext();
    }

    // Emit block mined event
    this.eventBus.publish({
      id: `block_${blockNumber}`,
      type: EventType.BLOCK_MINED,
      timestamp,
      data: {
        blockNumber,
        transactionCount: this.pendingTransactions.length,
        timestamp,
      },
      metadata: {
        source: 'blockchain',
        priority: 0,
      },
    });

    this.pendingTransactions = [];
  }
}
```

## Complete Example: Event-Driven Backtest

```typescript
async function runEventDrivenBacktest() {
  // Initialize
  const eventBus = new EventBus();
  const marketData = new MarketDataProvider(eventBus);
  const strategy = new MomentumStrategy();
  const engine = new StrategyEngine(eventBus, strategy);
  const executor = new OrderExecutionEngine(eventBus, new SimulatedExchange());
  
  // Load data (this will publish events)
  await marketData.loadHistoricalData(
    'ETH/USD',
    new Date('2024-01-01'),
    new Date('2024-12-31')
  );
  
  // Process all events
  await eventBus.processAll();
  
  // Analyze results
  const fills = eventBus.getHistory(EventType.ORDER_FILLED);
  const pnl = calculatePnL(fills);
  
  console.log(`Total trades: ${fills.length}`);
  console.log(`Final P&L: $${pnl.toFixed(2)}`);
  
  // Export event log for debugging
  fs.writeFileSync('event_log.json', JSON.stringify(eventBus.getHistory(), null, 2));
}
```

## Best Practices

1. **Event Ordering**: Use priority queues to ensure events are processed in the correct order
2. **Idempotency**: Make event handlers idempotent to allow safe replay
3. **Event Versioning**: Include version in event metadata to handle schema changes
4. **Error Handling**: Catch errors in handlers to prevent entire simulation from crashing
5. **Performance**: Batch similar events when possible
6. **Testing**: Use event replay to test specific scenarios
7. **Observability**: Log events to external systems for monitoring

## Next Steps

- Learn about [Data Pipeline & Replay](/building-simulations/data-pipeline-replay) for handling historical data
- Explore [Performance Optimization](/building-simulations/performance-optimization) techniques
- See [Backtesting Framework](/building-simulations/backtesting-framework) for practical implementation
