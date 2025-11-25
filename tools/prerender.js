/**
 * Prerender script for generating static HTML from Angular SPA
 * This script serves the built Angular app, crawls all routes, and saves static HTML files
 */

const puppeteer = require('puppeteer');
const http = require('http');
const handler = require('serve-handler');
const fs = require('fs').promises;
const path = require('path');
const net = require('net');

// Configuration
const CONFIG = {
  distDir: path.join(__dirname, '..', 'dist'),
  outputDir: path.join(__dirname, '..', 'dist', 'static'),
  renderDelay: 1500, // Wait for content to render
  preferredPort: Number(process.env.PRERENDER_PORT || 4567),
};

// Routes to prerender - extracted from app-routing.module.ts
const ROUTES = [
  '',
  'landscape-of-defi',
  'landscape-of-defi/evolution-of-finance',
  'landscape-of-defi/architecture-of-defi',
  'landscape-of-defi/economic-premises',
  'landscape-of-defi/core-math-tools',
  'landscape-of-defi/metrics-and-analytics-stack',
  'landscape-of-defi/risk-surfaces',
  'defi-vs-traditional-finance',
  'defi-vs-traditional-finance/market-microstructure',
  'defi-vs-traditional-finance/risk-distribution',
  'defi-vs-traditional-finance/pricing-and-settlement',
  'defi-vs-traditional-finance/leverage-and-collateralization',
  'defi-vs-traditional-finance/liquidity-models',
  'defi-vs-traditional-finance/data-transparency',
  'defi-vs-traditional-finance/regulation-and-custody',
  'transaction-ordering-mev',
  'transaction-ordering-mev/how-blocks-form',
  'transaction-ordering-mev/mev-taxonomy',
  'transaction-ordering-mev/mitigation-and-defenses',
  'transaction-ordering-mev/quantitative-impacts',
  'transaction-ordering-mev/mev-beyond-evms',
  'transaction-ordering-mev/statistical-modeling',
  'blockchain-execution-environments',
  'blockchain-execution-environments/evm',
  'blockchain-execution-environments/solana-svm',
  'blockchain-execution-environments/move-vm',
  'blockchain-execution-environments/comparative-benchmarks',
  'blockchain-execution-environments/quant-engineering',
  'trading-foundations',
  'trading-foundations/spot-trading',
  'trading-foundations/perpetual-futures',
  'trading-foundations/market-making',
  'lending-borrowing',
  'lending-borrowing/interest-rate-models',
  'lending-borrowing/collateral-math',
  'lending-borrowing/dynamic-apy',
  'lending-borrowing/stability-and-systemic-risk',
  'lending-borrowing/credit-delegation',
  'staking-restaking-yield',
  'staking-restaking-yield/proof-of-stake-math',
  'staking-restaking-yield/restaking-models',
  'staking-restaking-yield/liquid-staking-derivatives',
  'staking-restaking-yield/restaking-economics',
  'staking-restaking-yield/yield-decomposition',
  'staking-restaking-yield/validator-economics',
  'quantitative-defi-modeling',
  'quantitative-defi-modeling/deterministic-simulation-engines',
  'quantitative-defi-modeling/pnl-metrics',
  'quantitative-defi-modeling/portfolio-optimization',
  'quantitative-defi-modeling/scenario-testing',
  'quantitative-defi-modeling/agent-based-modeling',
  'quantitative-defi-modeling/oracle-design',
  'advanced-topics',
  'math-primer',
  'tooling-simulation-ecosystem',
  'meta-modules-capstone',
];

// Create HTTP server to serve the dist folder
function createServer() {
  return http.createServer((request, response) => {
    return handler(request, response, {
      public: CONFIG.distDir,
      cleanUrls: false,
      rewrites: [{ source: '/**', destination: '/index.html' }],
    });
  });
}

// Save HTML content to file
async function saveHtml(route, html) {
  const routePath = route === '' ? 'index' : route;
  const filePath = path.join(CONFIG.outputDir, `${routePath}.html`);
  const dirPath = path.dirname(filePath);

  // Ensure directory exists
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
  console.log(`✓ Saved: ${routePath}.html`);
}

async function findAvailablePort(preferredPort) {
  const isPortFree = (port) =>
    new Promise((resolve, reject) => {
      const tester = net
        .createServer()
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            resolve(false);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          tester
            .once('close', () => resolve(true))
            .close();
        })
        .listen(port, '0.0.0.0');
    });

  const maxAttempts = 5;
  let port = preferredPort;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (await isPortFree(port)) {
      return port;
    }
    port += 1;
  }

  return new Promise((resolve, reject) => {
    const fallbackServer = net.createServer();
    fallbackServer.once('error', reject);
    fallbackServer.listen(0, '0.0.0.0', () => {
      const availablePort = fallbackServer.address().port;
      fallbackServer.close(() => resolve(availablePort));
    });
  });
}

async function startServer(server, preferredPort) {
  const port = await findAvailablePort(preferredPort);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', resolve);
  });
  return port;
}

// Prerender a single route
async function prerenderRoute(browser, route, baseUrl) {
  let page;
  try {
    page = await browser.newPage();
    const url = `${baseUrl}/${route}`;

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, CONFIG.renderDelay));

    const html = await page.content();
    await saveHtml(route, html);
  } catch (error) {
    console.error(`✗ Failed to prerender ${route}:`, error.message);
    throw error; // Re-throw to trigger restart
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
}

// Main prerender function
async function prerender() {
  console.log('🚀 Starting prerender...\n');

  // Create output directory
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  // Start server
  const server = createServer();
  const port = await startServer(server, CONFIG.preferredPort);
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Server running at ${baseUrl}\n`);

  let browser;
  let successCount = 0;
  let failCount = 0;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log(`📄 Prerendering ${ROUTES.length} routes...\n`);

    // Prerender all routes with browser restart on crash
    for (const route of ROUTES) {
      try {
        await prerenderRoute(browser, route, baseUrl);
        successCount++;
      } catch (error) {
        failCount++;
        console.log('🔄 Restarting browser...\n');

        // Close crashed browser
        try {
          await browser.close();
        } catch (e) {
          // Ignore
        }

        // Relaunch browser
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }
    }
  } finally {
    // Cleanup
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore
      }
    }
    server.close();
  }

  console.log(`\n✅ Prerendering complete!`);
  console.log(`   ✓ Success: ${successCount} pages`);
  console.log(`   ✗ Failed: ${failCount} pages`);
  console.log(`   📁 Static files saved to: ${CONFIG.outputDir}`);
}

// Run
prerender().catch((error) => {
  console.error('❌ Prerender failed:', error);
  process.exit(1);
});
