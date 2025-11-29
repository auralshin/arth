### Code Examples

> info **Metadata** Level: All | Prerequisites: None | Tags: contributing, code, standards

Code examples in Arth documentation serve to illustrate concepts, demonstrate implementations, and provide practical references for developers. This page defines standards for writing, formatting, and integrating code examples across all documentation pages.

---

#### When to Include Code

**Use Code Examples For:**
- Demonstrating smart contract patterns (liquidity pool implementations, AMM logic)
- Showing simulation or analysis scripts (Python for data analysis, backtesting)
- Illustrating integration patterns (web3 library usage, protocol interactions)
- Explaining complex algorithms (routing, pricing, optimization)

**Avoid Code When:**
- Concepts can be explained clearly in prose
- Abstract mathematical models are more appropriate
- Code would be overly verbose without adding clarity
- The topic is purely economic or game-theoretic

---

#### Language-Specific Standards

**Solidity (Smart Contracts)**
- Use recent compiler version syntax (`pragma solidity ^0.8.0` or newer)
- Include SPDX license identifier: `// SPDX-License-Identifier: MIT`
- Add NatSpec comments for functions and contracts
- Keep examples minimal: focus on the concept, not boilerplate
- Highlight security considerations in comments

Example:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice Constant product AMM pool
contract SimpleAMM {
    uint256 public reserveX;
    uint256 public reserveY;
    
    /// @notice Swap exact X tokens for Y tokens
    /// @param amountXIn Amount of X tokens to swap
    /// @return amountYOut Amount of Y tokens received
    function swapXForY(uint256 amountXIn) external returns (uint256 amountYOut) {
        // Calculate output using constant product formula: x * y = k
        uint256 k = reserveX * reserveY;
        uint256 newReserveX = reserveX + amountXIn;
        uint256 newReserveY = k / newReserveX;
        amountYOut = reserveY - newReserveY;
        
        // Update reserves
        reserveX = newReserveX;
        reserveY = newReserveY;
    }
}
```

**Python (Data Analysis, Simulation)**
- Use Python 3.8+ syntax
- Import standard libraries before third-party libraries
- Include docstrings for functions
- Use type hints where helpful
- Keep examples executable: avoid undefined variables

Example:
```python
import numpy as np
import pandas as pd

def calculate_impermanent_loss(price_ratio: float) -> float:
    """
    Calculate impermanent loss for a constant product AMM.
    
    Args:
        price_ratio: Final price divided by initial price
    
    Returns:
        Impermanent loss as a decimal (e.g., 0.05 = 5% loss)
    """
    # Constant product formula: loss = 2*sqrt(r) / (1 + r) - 1
    return 2 * np.sqrt(price_ratio) / (1 + price_ratio) - 1

# Example usage
price_change = 2.0  # Price doubled
loss = calculate_impermanent_loss(price_change)
print(f"Impermanent loss: {loss:.2%}")  # Output: -5.72%
```

**TypeScript/JavaScript (Web3 Integration)**
- Use TypeScript when type safety aids understanding
- Include imports for external libraries (ethers.js, web3.js)
- Use async/await for asynchronous operations
- Handle errors and edge cases

Example:
```typescript
import { ethers } from 'ethers';

// Query Uniswap V2 pool reserves
async function getPoolReserves(
  poolAddress: string,
  provider: ethers.Provider
): Promise<{ reserve0: bigint; reserve1: bigint }> {
  const poolAbi = ['function getReserves() view returns (uint112, uint112, uint32)'];
  const pool = new ethers.Contract(poolAddress, poolAbi, provider);
  
  const [reserve0, reserve1] = await pool.getReserves();
  return { reserve0, reserve1 };
}
```

---

#### Code Formatting

**Block Structure**
- Always specify language: ` ```solidity`, ` ```python`, ` ```typescript`
- Use 2-space or 4-space indentation consistently
- Keep lines under 100 characters when possible
- Add blank lines between logical sections

**Comments**
- Explain *why*, not *what* (code shows what)
- Highlight non-obvious logic or edge cases
- Note security implications or risks
- Keep comments concise and technical

**Variable Naming**
- Use descriptive names: `reserveX` not `r1`, `priceImpact` not `pi`
- Follow language conventions: camelCase for JS/TS, snake_case for Python
- Match terminology in prose (if text says "liquidity," use `liquidity` not `L`)

---

#### Context and Completeness

**Provide Context**
Introduce code examples with a sentence explaining what they demonstrate:

*"The following Solidity function implements a constant product swap with fee deduction:"*

**Complete vs Snippet**
- **Complete examples**: Can be copy-pasted and run (tests, simulations)
- **Snippets**: Illustrative fragments focusing on a single concept
- Indicate which type: "This snippet shows..." or "Complete implementation:"

**Dependencies**
If code requires external libraries, mention them:

*"This example uses `ethers.js` to interact with Uniswap contracts."*

---

#### Pseudo-code

For high-level algorithms or when language-agnostic explanation is clearer:

```text
function calculateOptimalTrade(poolReserves, targetPrice):
    // Binary search for optimal trade size
    low = 0
    high = maxTradeSize
    
    while high - low > tolerance:
        mid = (low + high) / 2
        simulatedPrice = simulateSwap(poolReserves, mid)
        
        if simulatedPrice < targetPrice:
            low = mid
        else:
            high = mid
    
    return mid
```

Use pseudo-code when:
- The concept applies across multiple languages
- Syntax details would distract from the algorithm
- You're describing high-level architecture

---

#### Testing and Verification

**Before Including Code:**
1. **Test it**: Ensure code compiles/runs without errors
2. **Verify logic**: Check that outputs match expected behavior
3. **Security review**: For smart contracts, note any simplifications or missing safety checks
4. **Simplify**: Remove unnecessary complexity while maintaining correctness

**Disclaimers**
For simplified examples, add a note:

*"Note: This example omits slippage protection, reentrancy guards, and access control for clarity. Production code must include these safety mechanisms."*

---

#### Integration with Documentation

**Placement**
- Place code after explaining the concept in prose
- Reference code in surrounding text: "As shown in the implementation above..."
- Use multiple smaller examples rather than one large block

**Explanations**
- Walk through complex logic in prose after showing code
- Highlight key lines or decisions
- Connect code back to mathematical formulas or economic models

---

#### See Also

* [Style Guide](/contributing/style) – General formatting standards
* [New Page](/contributing/new-page) – Page template with code examples
* [Content Guidelines](/contributing/content-guidelines) – Overall writing standards
