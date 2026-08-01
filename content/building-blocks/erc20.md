### ERC-20

> info **Metadata** Level: Beginner-Intermediate | Prerequisites: Tokens 101, What "On-Chain" Means | Tags: erc-20, token-standards, approvals, decimals, integration-risk, defi

**ERC-20** is the interface that made composable on-chain finance possible. It specifies six functions and two events, and any contract implementing them can be listed on a decentralised exchange, accepted as collateral, wrapped, bridged, or aggregated without a single line of bespoke integration code. Almost every fungible asset on an EVM chain — stablecoins, governance tokens, wrapped assets, pool shares, receipt tokens — is an ERC-20.

The standard's power comes from how little it says. It defines a ledger and a delegation mechanism and stops there, so implementations are free to add fees, rebase balances, block addresses, or return nothing at all. Integrations break on exactly those freedoms. This page covers the interface, the semantics that are easy to get wrong — allowances, decimals, the difference between pushing and pulling tokens — and the non-standard behaviours that account for most integration failures. For the wider landscape of standards across ecosystems, see [Token Standards](/building-blocks/token-standards).

---

#### The Interface

```solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

Three further functions are conventional but **optional** in the specification, which matters more than it sounds:

```solidity
function name()     external view returns (string memory);
function symbol()   external view returns (string memory);
function decimals() external view returns (uint8);
```

<table>
  <tbody>
    <tr><td><strong>Member</strong></td><td><strong>What it does</strong></td><td><strong>What to watch</strong></td></tr>
    <tr><td><code>totalSupply()</code></td><td>Total units in existence, in base units.</td><td>Changes silently on mint and burn unless the implementation emits events.</td></tr>
    <tr><td><code>balanceOf(account)</code></td><td>An address's balance, in base units.</td><td>Authoritative. Never cache it; a rebasing token changes it with no transfer.</td></tr>
    <tr><td><code>transfer(to, amount)</code></td><td>Moves tokens from the caller to another address.</td><td>Only the owner can call it. A contract cannot react to being paid this way.</td></tr>
    <tr><td><code>approve(spender, amount)</code></td><td>Sets an absolute spending allowance for another address.</td><td>Overwrites; it does not add. This is the source of the approval race below.</td></tr>
    <tr><td><code>allowance(owner, spender)</code></td><td>Remaining amount the spender may pull.</td><td>Persists indefinitely until changed. It is a live position, not a transient permission.</td></tr>
    <tr><td><code>transferFrom(from, to, amount)</code></td><td>Pulls tokens using an existing allowance and debits it.</td><td>The mechanism every router, vault, and lending market depends on.</td></tr>
    <tr><td><code>Transfer</code> event</td><td>Emitted on every movement, including mint and burn.</td><td>The canonical source for indexers, and only as reliable as the implementation.</td></tr>
    <tr><td><code>Approval</code> event</td><td>Emitted when an allowance is set.</td><td>Not reliably emitted when an allowance is decremented by a pull.</td></tr>
  </tbody>
</table>

---

#### Allowances and the Approval Race

`approve` writes an absolute value with no way to make the write conditional on what it replaces. That single design choice produces a well-known race.

An illustrative sequence. Alice has approved a spender for 100 units and now wants to reduce the allowance to 40.

1. Alice broadcasts `approve(spender, 40)`. It sits in the public mempool, fully readable.
2. The spender sees it and submits `transferFrom(alice, spender, 100)` with a higher priority fee, so it is ordered first. The old allowance of 100 is consumed.
3. Alice's transaction lands. The allowance is now 40.
4. The spender calls `transferFrom(alice, spender, 40)`.
5. **Total moved: 140** — neither the old limit nor the new one.

Nothing here is a bug in any single contract. It is the interaction of an absolute-value write with a public, reorderable transaction queue. See [Gas and the Mempool](/microstructure/gas-mempool) for why the pending transaction was visible in the first place.

The mitigations, and what each one actually buys:

- **Set to zero, then set the new value.** This is the remedy the standard itself recommends. Be precise about why it works: it does *not* make the update atomic, and a spender can still take 100 before the zeroing and 40 after. What it buys is that the two steps are sequential and observable, so Alice can check the allowance and her balance between them and simply decline to send the second transaction.
- **Relative updates.** Functions that increase or decrease an allowance by a delta rather than overwriting it remove the race entirely, because the write depends on the current value. They are a widely deployed extension, not part of the standard, so an integration cannot assume they exist.
- **Signature-based approval (ERC-2612 permit).** The owner signs an off-chain message containing a spender, an amount, a nonce, and a deadline. A contract can consume that signature and pull the tokens in the *same* transaction, so no allowance persists between transactions and there is no window to race. This is the cleanest fix and requires the token to implement it.
- **Approve exactly what is needed, each time.** Correct and expensive: an extra transaction and its gas on every interaction.

> warning **An unlimited approval is a permanent grant** Approving the maximum representable value is common because many implementations skip decrementing the allowance at that value, saving a storage write. The consequence is that the grant never expires. If the approved contract is later upgraded or compromised, the full balance is reachable. Treat live approvals as an inventory to audit and revoke.

---

#### Decimals and Unit Handling

ERC-20 balances are integers in **base units**. `decimals()` is presentational metadata that tells a user interface where to put the point:

```text
display_amount = raw_amount / 10^decimals
```

It is optional, unenforced, and not standardised at 18. Stablecoins commonly use 6, wrapped bitcoin representations commonly use 8, and nothing prevents 0 or 24. A contract never sees decimals during a transfer; only your arithmetic does.

**Worked example.** A pool holds two tokens with different decimals. All figures illustrative.

<table>
  <tbody>
    <tr><td><strong>Quantity</strong></td><td><strong>Value</strong></td></tr>
    <tr><td>Quote token raw balance</td><td>1,500,000,000,000 with 6 decimals</td></tr>
    <tr><td>Base token raw balance</td><td>500,000,000,000,000,000,000 with 18 decimals</td></tr>
  </tbody>
</table>

1. **Human amounts**: `1,500,000,000,000 / 10^6 = 1,500,000` quote and `500,000,000,000,000,000,000 / 10^18 = 500` base
2. **Correct price**: `1,500,000 / 500 = 3,000` quote per base
3. **Naive ratio of raw integers**: `1.5e12 / 5e20 = 3e-9`
4. **Error factor**: `10^12`, exactly the difference in decimals

The general adjustment, computed without ever leaving integers:

```text
price = raw_quote * 10^(base_decimals - quote_decimals) / raw_base
      = 1.5e12 * 10^12 / 5e20 = 3,000
```

Four rules that prevent nearly all unit bugs.

- **Query `decimals()`; never assume 18.** Treat a revert as unknown rather than as a default, because the function is optional and some tokens omit it.
- **Keep base units in an integer type.** Double-precision floating point loses exactness above `2^53`, which an 18-decimal balance passes at about 0.009 tokens.
- **Multiply before dividing, and choose the rounding direction deliberately.** Integer division truncates, so the order of operations changes the answer. When issuing shares or computing repayments, rounding must favour the protocol; a rounding error that favours the caller is an extractable edge repeated at scale.

---

#### transfer Versus transferFrom

The distinction is about who initiates, and it shapes every integration.

`transfer(to, amount)` debits `msg.sender`. Only the token owner can call it, and plain ERC-20 has **no receive hook** — the recipient contract is not notified and cannot react. A contract therefore cannot be paid by a bare `transfer` in any useful way.

`transferFrom(from, to, amount)` debits `from` and decrements `allowance(from, msg.sender)`. This is how a contract pulls tokens it does not own, and it is why almost every interaction with a decentralised exchange, vault, or lending market begins with an approval. The canonical sequence:

1. The user calls `approve(router, amount)` on the token.
2. The user calls the router's own function.
3. The router calls `transferFrom(user, pool, amount)` and sends the output back with `transfer`.

There is a second pattern worth knowing because pool contracts use it. Instead of pulling, the caller **pushes** tokens with `transfer` and then invokes a function that measures the contract's own balance change. This is why a constant-product pool's swap function reads `balanceOf(address(this))` rather than trusting an argument: the balance is the only claim the pool can verify. It also means a bare transfer to a pool with no follow-up call is an irrecoverable donation. See [Swaps and DEXs](/building-blocks/swaps-dexs).

---

#### Non-Standard Implementations

The specification constrains signatures, not behaviour. Every row below exists in deployed tokens and every one has broken real integrations.

<table>
  <tbody>
    <tr><td><strong>Deviation</strong></td><td><strong>Behaviour</strong></td><td><strong>What breaks</strong></td></tr>
    <tr><td>Missing return value</td><td>Declares <code>transfer</code> as returning nothing.</td><td>A caller expecting a boolean reverts while decoding empty return data, so the token is unusable through a strict interface.</td></tr>
    <tr><td>Returns false on failure</td><td>Fails silently instead of reverting.</td><td>A caller that ignores the return value credits a transfer that never happened.</td></tr>
    <tr><td>Fee on transfer</td><td>The recipient receives less than the amount sent.</td><td>Any accounting that credits the requested amount over-credits. Pool invariants and vault share issuance both break.</td></tr>
    <tr><td>Rebasing supply</td><td>Balances change with no <code>Transfer</code> event.</td><td>Cached balances drift, share accounting silently misprices, and indexers reconstructing balances from logs are simply wrong.</td></tr>
    <tr><td>Blocklist or pause</td><td>Transfers revert for specific addresses or globally.</td><td>Paths that must succeed — liquidation, withdrawal, settlement — can become unrunnable at the worst moment.</td></tr>
    <tr><td>Upgradeable proxy</td><td>The code behind the address can be replaced.</td><td>An audit describes today's behaviour only. Every property above can be introduced later.</td></tr>
    <tr><td>Multiple entry points</td><td>Two addresses forward to one balance ledger.</td><td>Any allowlist or accounting keyed on a single address is incomplete.</td></tr>
    <tr><td>Approve requires zero first</td><td>Reverts on a non-zero to non-zero allowance change.</td><td>An integration that resets an allowance without zeroing it fails outright.</td></tr>
    <tr><td>Transfer callbacks</td><td>Hook-bearing tokens call the recipient during a transfer.</td><td>A token movement becomes an external call, opening a reentrancy path where none was expected.</td></tr>
  </tbody>
</table>

Two defensive patterns cover most of these. **Tolerate the ABI**: call with a low-level call and treat empty return data as success, which is what the widely used safe-transfer wrappers do. **Trust only the balance**: measure `balanceOf` before and after, and credit the delta rather than the requested amount. The second is the general answer to fee-on-transfer and to a good deal else, because it replaces an assumption with a measurement.

---

#### Assumptions and Failure Modes

- **Assumes the interface implies the behaviour.** It does not. A conforming signature says nothing about fees, rebases, pauses, or hooks, and the standard has no way to advertise them.
- **Assumes the amount sent is the amount received.** Only true without transfer fees. Measure the delta whenever the token is not one you control.
- **Assumes balances only change on transfer.** Rebasing and elastic-supply designs violate this and defeat both caching and log-based reconstruction.
- **Assumes the code is fixed and the allowance transient.** Behind a proxy the code is not fixed, so a token's risk profile is a governance question as much as a technical one; and an allowance is a persistent, unbounded-in-time grant to a contract address that may itself change. See [Smart Contract Risk](/risk/smart-contract).
- **Assumes 18 decimals.** Widespread and wrong, and the resulting errors are factors of a million or more rather than rounding.
- **Assumes the symbol identifies the asset.** Symbols are unenforced strings and are freely duplicated. Only the contract address identifies a token, and bridged assets routinely produce several distinct addresses with the same symbol. See [Bridges](/building-blocks/bridges) and [Tokens and Addresses](/start-here/tokens-addresses).
- **Assumes transfers always succeed.** A blocklist, a pause, or an out-of-gas condition can make a required transfer fail, so any path that must complete needs a defined behaviour when it does not.

---

#### Code

```solidity
// Pull tokens and credit only what actually arrived.
// Tolerates implementations that return no data, and is correct
// for fee-on-transfer tokens because it measures rather than assumes.
function pullExact(IERC20 token, address from, uint256 amount)
    internal
    returns (uint256 received)
{
    uint256 balanceBefore = token.balanceOf(address(this));

    (bool ok, bytes memory data) = address(token).call(
        abi.encodeCall(IERC20.transferFrom, (from, address(this), amount))
    );
    require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer failed");

    received = token.balanceOf(address(this)) - balanceBefore;
}
```

```typescript
// Price of one base token in quote tokens, from raw on-chain reserves.
// Base units stay in BigInt throughout: a double loses exactness above 2^53,
// which an 18-decimal balance passes at about 0.009 tokens.
const priceFromReserves = (
  rawQuote: bigint,
  rawBase: bigint,
  quoteDecimals: number,
  baseDecimals: number,
  precision = 8,
): number => {
  const scale = 10n ** BigInt(precision);
  const scaled =
    (rawQuote * 10n ** BigInt(baseDecimals) * scale) /
    (rawBase * 10n ** BigInt(quoteDecimals));
  return Number(scaled) / Number(scale);
};
```

---

#### See Also

* [Token Standards](/building-blocks/token-standards)
* [Tokens 101](/building-blocks/tokens-101)
* [Tokens and Addresses](/start-here/tokens-addresses)
* [Swaps and DEXs](/building-blocks/swaps-dexs)
* [Smart Contract Risk](/risk/smart-contract)
* [Gas and the Mempool](/microstructure/gas-mempool)
* [Event Logs](/data-tooling/event-logs)

---
