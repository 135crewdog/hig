'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app/app.js');

test('today is the date on the device clock, not UTC', () => {
  // 23:30 local on 7 Oct is still 7 Oct, whatever UTC says.
  assert.equal(app.todayLocal(new Date(2026, 9, 7, 23, 30)), '2026-10-07');
  assert.equal(app.todayLocal(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
});

test('isIsoDate accepts real dates only', () => {
  assert.equal(app.isIsoDate('2026-10-07'), true);
  assert.equal(app.isIsoDate('2028-02-29'), true);
  assert.equal(app.isIsoDate('2026-02-29'), false);
  assert.equal(app.isIsoDate('2026-13-01'), false);
  assert.equal(app.isIsoDate('07-Oct-26'), false);
  assert.equal(app.isIsoDate(''), false);
});

test('human dates use the device format and never move a day', () => {
  assert.equal(app.formatDisplayDate('2026-10-07', 'en-US'), 'Oct 7, 2026');
  assert.equal(app.formatDisplayDate('2026-10-07', 'en-GB'), '7 Oct 2026');
  assert.equal(app.formatDisplayDate('not a date'), 'not a date');
  assert.equal(app.formatDisplayDate(null), '');
});

test('search matches the name or the date as shown, trimmed and case-insensitive', () => {
  const entries = [{ name: 'Landing', date: '2026-10-07' }, { name: 'Brief', date: '2026-09-01' }];
  assert.deepEqual(app.filterEntries(entries, '  LAND '), [entries[0]]);
  assert.deepEqual(app.filterEntries(entries, app.formatDisplayDate('2026-09-01')), [entries[1]]);
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
