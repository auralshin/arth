## Move VM (Aptos, Sui)

Move introduces resource-oriented programming to encode assets as linear types. This design offers strong safety
guarantees and deterministic state transitions that simplify auditing and simulation.

### Resource safety

Assets cannot be accidentally duplicated or destroyed because the type system enforces single ownership.
Developers design modules that publish, transfer, or mutate resources explicitly, reducing entire classes of
bugs seen with ERC-20 approvals.

### Capabilities and access control

Modules expose capabilities that grant privileged actions. Sharing capabilities governs who can mint, burn, or
modify resources. Audits focus on ensuring capabilities are distributed safely and revoked when needed.

### Deterministic replay

Execution semantics guarantee deterministic replay, which is valuable for simulation and backtesting. VM upgrades
maintain strict compatibility, though global storage layout changes require migration tooling.
