#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the source file
let sourceContent = fs.readFileSync('a.txt', 'utf8');

// Remove markdown code fence if present
sourceContent = sourceContent.replace(/^```markdown\n/, '').replace(/\n```\s*$/, '');

// Define file mappings: title pattern -> file path
const fileMapping = {
  // Quant Math files
  'Random Variables': 'content/quant-math/random-variables.md',
  'Expectation & Variance': 'content/quant-math/expectation-variance.md',
  'Covariance': 'content/quant-math/covariance.md',
  'LLN & CLT': 'content/quant-math/lln-clt.md',
  'Sampling': 'content/quant-math/sampling.md',
  'Returns': 'content/quant-math/returns.md',
  'Volatility': 'content/quant-math/volatility.md',
  'Autocorrelation': 'content/quant-math/autocorrelation.md',
  'Stationarity': 'content/quant-math/stationarity.md',
  'Rolling Windows': 'content/quant-math/rolling-windows.md',
  'Sharpe Ratio': 'content/quant-math/sharpe.md',
  'Sortino Ratio': 'content/quant-math/sortino.md',
  'Drawdown': 'content/quant-math/drawdown.md',
  'VaR & CVaR': 'content/quant-math/var-cvar.md',
  'Kelly Criterion': 'content/quant-math/kelly.md',
  'Optimization': 'content/quant-math/optimization.md',
  'Mean-Variance': 'content/quant-math/mean-variance.md',
  'Position Sizing': 'content/quant-math/position-sizing.md',
  'Rebalancing': 'content/quant-math/rebalancing.md',
  'Random Walks': 'content/quant-math/random-walks.md',
  'Geometric Brownian Motion': 'content/quant-math/gbm.md',
  'Mean Reversion': 'content/quant-math/mean-reversion.md',
  'Jump Processes': 'content/quant-math/jumps.md',
  
  // Microstructure files
  'Orderbooks vs AMMs': 'content/microstructure/orderbooks-vs-amms.md',
  'Slippage': 'content/microstructure/slippage.md',
  'Fees & Routing': 'content/microstructure/fees-routing.md',
  'Gas & Mempool': 'content/microstructure/gas-mempool.md',
  'MEV Formally': 'content/microstructure/mev-formal.md',
  'On-Chain vs Off-Chain': 'content/microstructure/onchain-offchain.md',
  'Latency Risk': 'content/microstructure/latency-risk.md',
  
  // Transaction Ordering & MEV files
  'Transaction Ordering & MEV': 'content/transaction-ordering-mev/index.md',
  'How Blocks Form': 'content/transaction-ordering-mev/how-blocks-form.md',
  'MEV Beyond EVMs': 'content/transaction-ordering-mev/mev-beyond-evms.md',
  'MEV Taxonomy': 'content/transaction-ordering-mev/mev-taxonomy.md',
  'Mitigation & Defenses': 'content/transaction-ordering-mev/mitigation-and-defenses.md',
  'Quantitative Impacts': 'content/transaction-ordering-mev/quantitative-impacts.md',
  'Statistical Modeling': 'content/transaction-ordering-mev/statistical-modeling.md'
};

// Extract sections from the source content
function extractSections(content) {
  const sections = {};
  
  // Split by ### headers (main sections)
  const parts = content.split(/\n###\s+/);
  
  for (let i = 1; i < parts.length; i++) {
    const section = parts[i];
    const lines = section.split('\n');
    const title = lines[0].trim();
    
    // Find the end of this section (next --- separator at end or end of content)
    let endIndex = section.lastIndexOf('\n---\n');
    if (endIndex === -1) {
      endIndex = section.length;
    } else {
      endIndex += 5; // Include the --- separator
    }
    
    const sectionContent = '### ' + section.substring(0, endIndex).trim();
    sections[title] = sectionContent;
  }
  
  return sections;
}

// Main execution
console.log('Extracting sections from a.txt...');
const sections = extractSections(sourceContent);

console.log(`Found ${Object.keys(sections).length} sections\n`);

let updatedCount = 0;
let errorCount = 0;

// Update each file
for (const [title, filePath] of Object.entries(fileMapping)) {
  if (sections[title]) {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      fs.writeFileSync(fullPath, sections[title] + '\n', 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      updatedCount++;
    } catch (error) {
      console.error(`✗ Error updating ${filePath}:`, error.message);
      errorCount++;
    }
  } else {
    console.warn(`⚠ No content found for: ${title}`);
    errorCount++;
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Summary:`);
console.log(`  Successfully updated: ${updatedCount} files`);
console.log(`  Errors/Warnings: ${errorCount}`);
console.log(`${'='.repeat(50)}`);
