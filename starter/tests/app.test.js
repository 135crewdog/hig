'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app/app.js');

test('today is the UTC date', () => {
  assert.equal(app.todayUtc(), new Date().toISOString().slice(0, 10));
});

test('isIsoDate accepts real dates only', () => {
  assert.equal(app.isIsoDate('2026-10-07'), true);
  assert.equal(app.isIsoDate('2028-02-29'), true);
  assert.equal(app.isIsoDate('2026-02-29'), false);
  assert.equal(app.isIsoDate('2026-13-01'), false);
  assert.equal(app.isIsoDate('07-Oct-26'), false);
  assert.equal(app.isIsoDate(''), false);
});

test('human dates are DD-Mmm-YY', () => {
  assert.equal(app.formatDisplayDate('2026-10-07'), '07-Oct-26');
  assert.equal(app.formatDisplayDate('not a date'), 'not a date');
  assert.equal(app.formatDisplayDate(null), '');
});

test('search matches name or shown date, trimmed and case-insensitive', () => {
  const entries = [{ name: 'Landing', date: '2026-10-07' }, { name: 'Brief', date: '2026-09-01' }];
  assert.deepEqual(app.filterEntries(entries, '  LAND '), [entries[0]]);
  assert.deepEqual(app.filterEntries(entries, 'sep'), [entries[1]]);
  assert.deepEqual(app.filterEntries(entries, ''), entries);
});

test('entry errors name the field and say what to do', () => {
  assert.deepEqual(app.entryError(' ', '2026-10-07'), { field: 'name', message: 'Enter a name.' });
  assert.equal(app.entryError('Landing', '2026-02-30').field, 'date');
  assert.equal(app.entryError('Landing', '2026-10-07'), null);
});

test('the app and the service worker carry the same version', () => {
  const sw = fs.readFileSync(path.join(__dirname, '..', 'app', 'sw.js'), 'utf8');
  const m = /var VERSION = APP \+ '-([^']+)'/.exec(sw);
  assert.ok(m, 'sw.js declares VERSION');
  assert.equal(m[1], app.APP_VERSION);
});

test('the service worker precaches exactly the files that ship', () => {
  const dir = path.join(__dirname, '..', 'app');
  const sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
  const shell = JSON.parse(/var SHELL = (\[[^\]]*\])/.exec(sw)[1].replace(/'/g, '"'));
  const files = fs.readdirSync(dir).filter((f) => f !== 'sw.js').map((f) => './' + f).sort();
  assert.deepEqual(shell.filter((f) => f !== './').sort(), files);
});
