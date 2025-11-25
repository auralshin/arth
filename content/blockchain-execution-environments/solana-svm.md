## Solana / SVM

Solana's Sealevel Virtual Machine executes transactions in parallel when account locks do not conflict. High
throughput and low latency make it attractive for order-book style protocols and high-frequency strategies.

### Parallel execution

Transactions declare which accounts they touch. The runtime schedules non-overlapping transactions concurrently,
so developers must design programs with clear account access patterns to maximize concurrency without causing
contention.

### Compute and fee model

Solana charges for compute units rather than per opcode. Priority fees allow users to tip validators for faster
inclusion. Programs must account for compute budgets and may need to split work across multiple instructions to
stay within limits.

### CPIs and program composability

Cross-Program Invocations (CPIs) enable composable interactions similar to Solidity calls but require explicit
account passing. Security reviews focus on account verification, seeds, and signer checks to avoid privilege
escalation.
