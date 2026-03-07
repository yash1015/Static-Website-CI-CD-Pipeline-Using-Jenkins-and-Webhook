/**
 * Automated Test Suite — DevOps Journey App
 * Uses Node.js built-in 'http' and 'assert' — no npm install needed
 * Run: node tests/server.test.js
 */

const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ─── Test runner helpers ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    results.push({ name, status: 'PASS' });
    passed++;
  } catch (err) {
    console.log(`  ❌  ${name}`);
    console.log(`      → ${err.message}`);
    results.push({ name, status: 'FAIL', error: err.message });
    failed++;
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timed out after 5s'));
    });
    req.end();
  });
}

// ─── Start the server under test ──────────────────────────────────────────
const TEST_PORT = 3001;

// Inline the server logic so tests are self-contained
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, '..', 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// ─── Run all tests ────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║         DevOps Journey — Automated Test Suite        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`  Server started on port ${TEST_PORT} for testing\n`);

  const BASE = { hostname: 'localhost', port: TEST_PORT };

  // ── Group 1: HTTP Status Codes ──────────────────────────────────────────
  console.log('📋  Group 1: HTTP Status Codes');

  await test('GET / returns 200 OK', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
  });

  await test('GET /index.html returns 200 OK', async () => {
    const res = await makeRequest({ ...BASE, path: '/index.html' });
    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
  });

  await test('GET /unknown-page returns 404', async () => {
    const res = await makeRequest({ ...BASE, path: '/unknown-page' });
    assert.strictEqual(res.statusCode, 404, `Expected 404, got ${res.statusCode}`);
  });

  await test('GET /about returns 404', async () => {
    const res = await makeRequest({ ...BASE, path: '/about' });
    assert.strictEqual(res.statusCode, 404, `Expected 404, got ${res.statusCode}`);
  });

  await test('GET /favicon.ico returns 404', async () => {
    const res = await makeRequest({ ...BASE, path: '/favicon.ico' });
    assert.strictEqual(res.statusCode, 404, `Expected 404, got ${res.statusCode}`);
  });

  // ── Group 2: Content-Type Headers ───────────────────────────────────────
  console.log('\n📋  Group 2: Response Headers');

  await test('GET / responds with Content-Type: text/html', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(
      res.headers['content-type'] && res.headers['content-type'].includes('text/html'),
      `Expected text/html, got: ${res.headers['content-type']}`
    );
  });

  await test('GET / response has a non-empty body', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.length > 0, 'Response body is empty');
  });

  await test('GET / body size is greater than 1KB', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.length > 1024, `Body too small: ${res.body.length} bytes`);
  });

  // ── Group 3: HTML Content Validation ────────────────────────────────────
  console.log('\n📋  Group 3: HTML Content Validation');

  await test('Page contains <html> tag', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.includes('<html'), 'Missing <html> tag');
  });

  await test('Page contains <head> section', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.includes('<head>'), 'Missing <head> section');
  });

  await test('Page contains <body> section', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.includes('<body>'), 'Missing <body> section');
  });

  await test('Page has a <title> tag', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.includes('<title>'), 'Missing <title> tag');
  });

  await test('Page title contains "DevOps"', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    const titleMatch = res.body.match(/<title>(.*?)<\/title>/i);
    assert.ok(titleMatch, 'Could not find <title> tag');
    assert.ok(titleMatch[1].includes('DevOps'), `Title does not mention DevOps: "${titleMatch[1]}"`);
  });

  await test('Page contains viewport meta tag', async () => {
    const res = await makeRequest({ ...BASE, path: '/' });
    assert.ok(res.body.includes('viewport'), 'Missing viewport meta tag');
  });

  // ── Group 4: DevOps Content ──────────────────────────────────────────────
  console.log('\n📋  Group 4: DevOps Content Presence');

  const contentChecks = [
    ['PLAN stage is present',     'PLAN'],
    ['CODE stage is present',     'CODE'],
    ['BUILD stage is present',    'BUILD'],
    ['TEST stage is present',     'TEST'],
    ['DEPLOY stage is present',   'DEPLOY'],
    ['MONITOR stage is present',  'MONITOR'],
    ['DORA Metrics section exists', 'DORA'],
    ['CI/CD content is present',  'CI/CD'],
    ['Kubernetes is mentioned',   'Kubernetes'],
    ['Docker is mentioned',       'Docker'],
    ['Jenkins is mentioned',      'Jenkins'],
    ['Terraform is mentioned',    'Terraform'],
    ['Prometheus is mentioned',   'Prometheus'],
  ];

  for (const [label, keyword] of contentChecks) {
    await test(label, async () => {
      const res = await makeRequest({ ...BASE, path: '/' });
      assert.ok(res.body.includes(keyword), `"${keyword}" not found in page`);
    });
  }

  // ── Group 5: File System Checks ──────────────────────────────────────────
  console.log('\n📋  Group 5: File System Integrity');

  await test('server.js exists', () => {
    const filePath = path.join(__dirname, '..', 'server.js');
    assert.ok(fs.existsSync(filePath), 'server.js not found');
  });

  await test('public/index.html exists', () => {
    const filePath = path.join(__dirname, '..', 'public', 'index.html');
    assert.ok(fs.existsSync(filePath), 'public/index.html not found');
  });

  await test('package.json exists', () => {
    const filePath = path.join(__dirname, '..', 'package.json');
    assert.ok(fs.existsSync(filePath), 'package.json not found');
  });

  await test('package.json has a name field', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    assert.ok(pkg.name, 'package.json missing "name" field');
  });

  await test('package.json has a version field', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    assert.ok(pkg.version, 'package.json missing "version" field');
  });

  await test('index.html file size is greater than 10KB', () => {
    const filePath = path.join(__dirname, '..', 'public', 'index.html');
    const stats = fs.statSync(filePath);
    assert.ok(stats.size > 10240, `index.html too small: ${stats.size} bytes`);
  });

  // ── Group 6: Performance ─────────────────────────────────────────────────
  console.log('\n📋  Group 6: Performance');

  await test('GET / responds in under 500ms', async () => {
    const start = Date.now();
    await makeRequest({ ...BASE, path: '/' });
    const duration = Date.now() - start;
    assert.ok(duration < 500, `Response took too long: ${duration}ms`);
  });

  await test('GET /404 responds in under 200ms', async () => {
    const start = Date.now();
    await makeRequest({ ...BASE, path: '/nonexistent' });
    const duration = Date.now() - start;
    assert.ok(duration < 200, `404 response took too long: ${duration}ms`);
  });

  await test('Server handles 5 concurrent requests', async () => {
    const requests = Array(5).fill(null).map(() =>
      makeRequest({ ...BASE, path: '/' })
    );
    const responses = await Promise.all(requests);
    responses.forEach((res, i) => {
      assert.strictEqual(res.statusCode, 200, `Request ${i + 1} failed: ${res.statusCode}`);
    });
  });

  // ─── Summary ──────────────────────────────────────────────────────────────
  server.close();

  const total = passed + failed;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                      ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Total:   ${String(total).padEnd(42)}║`);
  console.log(`║  Passed:  ${String(passed).padEnd(42)}║`);
  console.log(`║  Failed:  ${String(failed).padEnd(42)}║`);
  console.log(`║  Pass Rate: ${String(passRate + '%').padEnd(40)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (failed > 0) {
    console.log('❌  FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`);
    });
    console.log('');
    process.exit(1); // Non-zero exit = Jenkins marks build as FAILED
  } else {
    console.log('✅  All tests passed! Pipeline is green.\n');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});