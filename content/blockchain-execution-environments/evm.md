## EVM (Ethereum Virtual Machine)

The EVM is the dominant general-purpose smart-contract environment. It prioritizes composability,
deterministic execution, and backward compatibility across Ethereum, rollups, and many L2s.

### Gas model and costing

Each opcode has a fixed gas cost calibrated to approximate computation and storage usage. Gas limits cap
per-block work, while base fee + tip auctions determine pricing. Understanding gas refunds, dynamic gas
schedules (EIP-1559, EIP-4844), and the impact of storage writes is critical for contract optimization.

### Storage and state

Contracts persist state in 256-bit storage slots, accessed via SLOAD/SSTORE. Reads are inexpensive, writes are
costly, and clearing storage can trigger refunds. Designing efficient storage layouts and using events for
archival data keeps gas budgets manageable.

### Composability and reentrancy

Contracts can call each other synchronously via message calls, enabling modular protocols and DeFi "money legos".
However, shared execution contexts introduce reentrancy risk, necessitating patterns like checks-effects-interactions
or reentrancy guards.
