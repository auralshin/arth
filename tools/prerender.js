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

// Routes to prerender, parsed from app-routing.module.ts at run time.
// Derived rather than hardcoded: a manual list silently goes stale when routes
// change, which yields a prerendered site and search index for pages that no
// longer exist while omitting every new one.
const ROUTES = (() => {
  const routingFile = path.join(__dirname, '..', 'src', 'app', 'app-routing.module.ts');
  const source = require('fs').readFileSync(routingFile, 'utf8');
  const found = [...source.matchAll(/path:\s*'([^']*)'/g)]
    .map((m) => m[1])
    .filter((r) => r !== '**');
  return [...new Set(found)];
})();

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
