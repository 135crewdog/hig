'use strict';
/*
 * Browser smoke test. Needs Playwright with Chromium (a development tool, not an app
 * dependency): `node tests/browser/smoke.js`. Serves app/ and drives it at a phone size:
 * add an entry, a field error, search, the swipe, Settings and the theme, Clear, and an
 * offline reload from the service worker's cache.
 * Pass a directory as the first argument to save a screenshot of each screen there.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const app = require('../../app/app.js');

const APP_DIR = path.join(__dirname, '..', '..', 'app');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serveApp() {
  // While server.down is true every request is dropped, so the service worker's own fetch fails
  // the way it does with no network (a context's offline mode does not reach the worker).
  const server = http.createServer((req, res) => {
    if (server.down) { req.destroy(); return; }
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(APP_DIR, p);
    if (!file.startsWith(APP_DIR) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  server.down = false;
  return server;
}

async function main() {
  const { chromium } = require('playwright');
  const server = serveApp();
  const port = await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
  const url = `http://127.0.0.1:${port}/`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const shots = process.argv[2];
  const shot = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, name + '.png'), fullPage: true }); };

  try {
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    assert.equal(await page.inputValue('#date'), app.todayUtc(), 'the date defaults to the Zulu date');
    assert.equal(await page.textContent('#date-display'), app.formatDisplayDate(app.todayUtc()));
    await shot('add');

    // A missing name is an inline instruction, and nothing is saved.
    await page.click('button[type="submit"]');
    assert.equal(await page.textContent('#name-error'), 'Enter a name.');
    assert.equal(await page.getAttribute('#name', 'aria-invalid'), 'true');

    await page.fill('#name', 'Landing');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#toast:not(.hidden)');
    assert.equal(await page.textContent('#toast'), 'Entry saved');
    assert.equal(await page.inputValue('#name'), '', 'the field clears after a save');
    await page.fill('#name', 'Brief');
    await page.click('button[type="submit"]');

    await page.click('button[data-tab="list"]');
    assert.equal(await page.isVisible('#screen-list'), true);
    assert.equal(await page.locator('#entries .row').count(), 2);
    await shot('list');
    await page.fill('#search', 'land');
    assert.equal(await page.locator('#entries .row').count(), 1);
    await page.fill('#search', 'zzz');
    assert.equal(await page.textContent('#empty'), 'No entries match.');
    await page.fill('#search', '');

    // Arrow keys move between tabs, as on any tab list.
    await page.focus('button[data-tab="list"]');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.isVisible('#screen-add'), true);

    // Every control is at least 44px in both directions.
    const small = await page.evaluate(() => [...document.querySelectorAll('button, select, input')]
      .filter((n) => n.offsetParent && n.type !== 'date')
      .map((n) => ({ id: n.id || n.textContent.trim(), r: n.getBoundingClientRect() }))
      .filter((x) => x.r.width < 44 || x.r.height < 44).map((x) => x.id));
    assert.deepEqual(small, [], 'tap targets under 44px');

    // Settings opens from the gear and closes with Done; the theme applies at once.
    await page.click('#settings-btn');
    assert.equal(await page.isVisible('#screen-settings'), true);
    assert.equal(await page.isVisible('#view-main'), false);
    await page.selectOption('#theme', 'dark');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
    assert.equal(await page.getAttribute('meta[name="theme-color"]', 'content'), '#1c1c1e', 'the status bar follows the header');
    await shot('settings-dark');
    await page.selectOption('#theme', 'auto');
    assert.match(await page.textContent('#version'), new RegExp(app.APP_VERSION.replace(/\./g, '\\.')));
    await page.click('#done-btn');
    assert.equal(await page.isVisible('#view-main'), true);

    // The page opens offline from the worker's cache, entries included.
    server.down = true;
    await page.reload();
    await page.click('button[data-tab="list"]');
    assert.equal(await page.locator('#entries .row').count(), 2, 'offline reload keeps the app and its data');
    server.down = false;

    // Clear asks first and removes the entries.
    await page.click('#settings-btn');
    page.once('dialog', (d) => d.accept());
    await page.click('#clear-btn');
    await page.click('#done-btn');
    assert.equal(await page.textContent('#empty'), 'No entries yet. Add one on the Add screen.');

    assert.deepEqual(errors, [], 'no page errors');
    console.log('smoke test passed');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
