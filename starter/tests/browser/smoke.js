'use strict';
/*
 * Browser smoke test. Needs Playwright with Chromium (a development tool, not an app
 * dependency): `node tests/browser/smoke.js`. Serves app/ and drives it at a phone size:
 * add an entry, a field error, a failed save, search, tab keys, tap target sizes on every screen,
 * Settings and the theme, Auto on a dark device, Clear, and an offline reload from the service
 * worker's cache.
 * It runs in Chromium, so it can't see how iPhone Safari draws native controls (a select's
 * height, a date field's width), the status bar, or the real date picker: those are checked on
 * an iPhone before a pull request is merged.
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
  // Every visible control and link on the screen is at least 44px in both directions (as Chromium draws it).
  const checkTargets = async (screen) => {
    const small = await page.evaluate(() => [...document.querySelectorAll('a, button, select, input')]
      .filter((n) => n.offsetParent)
      .map((n) => ({ id: n.id || n.textContent.trim(), r: n.getBoundingClientRect() }))
      .filter((x) => x.r.width < 44 || x.r.height < 44).map((x) => x.id));
    assert.deepEqual(small, [], 'tap targets under 44px on ' + screen);
  };

  try {
    // A fixed clock, so the test never depends on today's date.
    await page.clock.setFixedTime(new Date(2026, 9, 7, 12, 0));
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    assert.equal(await page.inputValue('#date'), '2026-10-07', 'the date defaults to today on the device clock');
    await shot('add');

    // A missing name is an inline instruction, and nothing is saved.
    await page.click('button[type="submit"]');
    assert.equal(await page.textContent('#name-error'), 'Enter a name.');
    assert.equal(await page.getAttribute('#name', 'aria-invalid'), 'true');

    await page.fill('#name', 'Landing');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#toast:not(:empty)');
    assert.equal(await page.textContent('#toast'), 'Entry saved');
    assert.equal(await page.inputValue('#name'), '', 'the field clears after a save');
    await page.fill('#name', 'Brief');
    await page.click('button[type="submit"]');

    await page.click('button[data-tab="list"]');
    assert.equal(await page.isVisible('#screen-list'), true);
    assert.equal(await page.locator('#entries .row').count(), 2);
    await shot('list');
    await checkTargets('List');
    await page.fill('#search', 'land');
    assert.equal(await page.locator('#entries .row').count(), 1);
    await page.fill('#search', 'zzz');
    assert.equal(await page.textContent('#empty'), 'No entries match.');
    await page.fill('#search', '');

    // Arrow keys move between tabs from the focused one, and the tab list is one stop in the tab order.
    assert.equal(await page.getAttribute('button[data-tab="add"]', 'tabindex'), '-1', 'an unselected tab is out of the tab order');
    await page.focus('button[data-tab="list"]');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.isVisible('#screen-add'), true);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.tab), 'add');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.isVisible('#screen-list'), true);
    await page.click('button[data-tab="add"]');

    // A long unbroken name wraps instead of widening the page.
    await page.fill('#name', 'x'.repeat(120));
    await page.click('button[type="submit"]');
    await page.click('button[data-tab="list"]');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'no horizontal scroll');
    await page.click('button[data-tab="add"]');

    await checkTargets('Entry');

    // A save the device refuses keeps the entry on screen and says why, in a banner, not a toast.
    await page.evaluate(() => { window.__setItem = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
    await page.fill('#name', 'Kept');
    await page.click('button[type="submit"]');
    assert.match(await page.textContent('#add-error'), /^Could not save on this device/);
    assert.equal(await page.inputValue('#name'), 'Kept', 'the typed entry stays');
    await page.evaluate(() => { Storage.prototype.setItem = window.__setItem; });
    await page.fill('#name', '');

    // Settings opens from the gear and closes with Done; the theme applies at once.
    await page.click('#settings-btn');
    assert.equal(await page.isVisible('#screen-settings'), true);
    assert.equal(await page.isVisible('#view-main'), false);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'done-btn', 'focus moves to Settings');
    await checkTargets('Settings');
    await page.selectOption('#theme', 'dark');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
    assert.equal(await page.getAttribute('meta[name="theme-color"]', 'content'), '#1c1c1e', 'theme-color follows the header');
    await shot('settings-dark');
    await page.selectOption('#theme', 'auto');
    assert.match(await page.textContent('#version'), new RegExp(app.APP_VERSION.replace(/\./g, '\\.')));
    assert.match(await page.getAttribute('a.link', 'href'), /^mailto:/, 'a feedback link, required for a broad app');
    await page.click('#done-btn');
    assert.equal(await page.isVisible('#view-main'), true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'settings-btn', 'focus returns to the gear');

    // Auto follows a dark device in CSS alone, so the first paint is already dark.
    await page.emulateMedia({ colorScheme: 'dark' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(0, 0, 0)');
    // theme-color follows once the browser's change event reaches app.js, a moment later.
    await page.waitForFunction(() => document.querySelector('meta[name="theme-color"]').content === '#1c1c1e');
    await page.emulateMedia({ colorScheme: 'light' });

    // The page opens offline from the worker's cache, entries included.
    server.down = true;
    await page.reload();
    await page.click('button[data-tab="list"]');
    assert.equal(await page.locator('#entries .row').count(), 3, 'offline reload keeps the app and its data');
    server.down = false;

    // Clear asks first and removes the entries.
    await page.click('#settings-btn');
    page.once('dialog', (d) => d.accept());
    await page.click('#clear-btn');
    await page.click('#done-btn');
    assert.equal(await page.textContent('#empty'), 'No entries yet. Add one on the Entry screen.');

    assert.deepEqual(errors, [], 'no page errors');
    console.log('smoke test passed');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
