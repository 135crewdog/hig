/*
 * Starter app. Plain JS, no build step, no dependencies.
 *
 * The pure helpers at the top have no DOM and are unit-tested in Node
 * (tests/app.test.js). Everything that touches the page is inside the
 * block guarded by `typeof document !== 'undefined'`. Dates are stored as
 * 'YYYY-MM-DD' strings in the device's own time zone and shown in the device's
 * own date format.
 */
'use strict';

var APP_VERSION = '2026.10.14.2';
var STORAGE = { settings: 'starter.settings', entries: 'starter.entries' };
var THEMES = ['auto', 'light', 'dark'];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Today's date on the device's clock and time zone. (An app that runs on Zulu uses toISOString().slice(0, 10).) */
function todayLocal(now) {
  var d = now || new Date();
  function two(n) { return (n < 10 ? '0' : '') + n; }
  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
}

function isIsoDate(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return false;
  var y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1) return false;
  var leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return d <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
}

/** 'YYYY-MM-DD' in the device's own date format ('Oct 7, 2026' in the US). Anything else is returned as is. */
function formatDisplayDate(iso, locale) {
  if (!isIsoDate(iso)) return iso == null ? '' : String(iso);
  var p = iso.split('-');
  // The calendar date itself, read and written in UTC so no time zone can move it a day.
  var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])));
  return d.toLocaleDateString(locale, { dateStyle: 'medium', timeZone: 'UTC' });
}

/** Entries whose name or date contains the query, trimmed and case-insensitive. */
function filterEntries(entries, query) {
  var q = String(query || '').trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(function (e) {
    return e.name.toLowerCase().indexOf(q) !== -1 || formatDisplayDate(e.date).toLowerCase().indexOf(q) !== -1;
  });
}

/** The field to fix and the fix, as an instruction, or null when the entry is fine. */
function entryError(name, date) {
  if (!String(name || '').trim()) return { field: 'name', message: 'Enter a name.' };
  if (!isIsoDate(date)) return { field: 'date', message: 'Choose a date.' };
  return null;
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

if (typeof document !== 'undefined') {
  (function () {
    function load(key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    }
    /** True when the write landed. A full or blocked store returns false and the caller decides. */
    function save(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (err) { return false; }
    }
    function $(id) { return document.getElementById(id); }
    function el(tag, cls, text) {
      var node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text != null) node.textContent = text;
      return node;
    }

    var TABS = ['add', 'list'];
    var settings = load(STORAGE.settings, { theme: 'auto' });
    if (THEMES.indexOf(settings.theme) === -1) settings.theme = 'auto';
    var entries = load(STORAGE.entries, []);
    var ui = { tab: 'add', query: '', settingsOpen: false, dateTouched: false };
    var toastTimer = null;

    // ---- theme ----

    var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function applyTheme() {
      var root = document.documentElement;
      root.setAttribute('data-theme', settings.theme);
      root.classList.toggle('system-dark', !!(darkQuery && darkQuery.matches));
      // The status bar matches the header.
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--elev').trim() || '#ffffff');
    }
    if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', applyTheme);

    // ---- rendering ----

    function render() {
      $('view-main').classList.toggle('hidden', ui.settingsOpen);
      $('screen-settings').classList.toggle('hidden', !ui.settingsOpen);
      renderTabs();
      renderList();
      $('theme').value = settings.theme;
      $('version').textContent = 'Version ' + APP_VERSION;
    }

    function renderTabs() {
      document.querySelectorAll('.seg-tabs button').forEach(function (b) {
        b.setAttribute('aria-selected', b.dataset.tab === ui.tab ? 'true' : 'false');
      });
      TABS.forEach(function (t) { $('screen-' + t).classList.toggle('hidden', t !== ui.tab); });
    }

    function renderList() {
      var list = $('entries');
      var shown = filterEntries(entries, ui.query);
      list.textContent = '';
      shown.forEach(function (e) {
        var row = el('li', 'row');
        var label = el('div', 'label');
        label.appendChild(el('div', 'name', e.name));
        label.appendChild(el('div', 'sub', formatDisplayDate(e.date)));
        row.appendChild(label);
        list.appendChild(row);
      });
      list.classList.toggle('hidden', shown.length === 0);
      $('empty').textContent = entries.length ? 'No entries match.' : 'No entries yet. Add one on the Add screen.';
      $('empty').classList.toggle('hidden', shown.length > 0);
    }

    function toast(text) {
      var t = $('toast');
      t.textContent = text;
      t.classList.remove('hidden');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.classList.add('hidden'); }, 2500);
    }

    function changeTab(name) {
      if (TABS.indexOf(name) === -1 || name === ui.tab) return;
      ui.tab = name;
      renderTabs();
      window.scrollTo(0, 0);
    }

    function setFieldError(input, message) {
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      var out = $(input.id + '-error');
      if (out) out.textContent = message;
    }

    // ---- events ----

    var seg = document.querySelector('.seg-tabs');
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]');
      if (b) changeTab(b.dataset.tab);
    });
    seg.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var i = TABS.indexOf(ui.tab) + (e.key === 'ArrowRight' ? 1 : -1);
      if (i < 0 || i >= TABS.length) return;
      changeTab(TABS[i]);
      seg.querySelector('button[data-tab="' + TABS[i] + '"]').focus();
    });

    // A horizontal swipe does what the segmented control does. Horizontal movement must dominate.
    var touch = { x: null, y: null, ex: null, ey: null };
    var panels = $('panels');
    panels.addEventListener('touchstart', function (e) {
      touch.ex = touch.ey = null;
      touch.x = e.targetTouches[0].clientX;
      touch.y = e.targetTouches[0].clientY;
    }, { passive: true });
    panels.addEventListener('touchmove', function (e) {
      touch.ex = e.targetTouches[0].clientX;
      touch.ey = e.targetTouches[0].clientY;
    }, { passive: true });
    panels.addEventListener('touchend', function () {
      if (touch.x == null || touch.ex == null) return;
      var dx = touch.x - touch.ex;
      var dy = Math.abs(touch.y - touch.ey);
      if (dy > Math.abs(dx) * 0.75) return;
      var i = TABS.indexOf(ui.tab);
      if (dx > 50 && i < TABS.length - 1) changeTab(TABS[i + 1]);
      if (dx < -50 && i > 0) changeTab(TABS[i - 1]);
    });

    $('date').addEventListener('change', function () {
      ui.dateTouched = true;
      setFieldError($('date'), '');
      render();
    });
    $('name').addEventListener('input', function () { setFieldError($('name'), ''); });

    $('add-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('name').value.trim();
      var date = $('date').value;
      var error = entryError(name, date);
      if (error) {
        setFieldError($(error.field), error.message);
        return;
      }
      var next = [{ name: name, date: date }].concat(entries);
      if (!save(STORAGE.entries, next)) {
        // Nothing is reported as saved that was not; the typed entry stays on screen.
        toast('Could not save on this device: storage is full or blocked.');
        return;
      }
      entries = next;
      $('name').value = '';
      render();
      toast('Entry saved');
    });

    $('search').addEventListener('input', function (e) {
      ui.query = e.target.value;
      renderList();
    });

    $('settings-btn').addEventListener('click', function () { ui.settingsOpen = true; render(); window.scrollTo(0, 0); });
    $('done-btn').addEventListener('click', function () { ui.settingsOpen = false; render(); });

    $('theme').addEventListener('change', function (e) {
      settings.theme = e.target.value;
      save(STORAGE.settings, settings);
      applyTheme();
    });

    $('clear-btn').addEventListener('click', function () {
      if (!window.confirm('Remove every entry from this device? Your settings are kept.')) return;
      try { localStorage.removeItem(STORAGE.entries); } catch (err) { /* nothing stored */ }
      entries = [];
      render();
      toast('Local data cleared');
    });

    // Another tab changed something: follow it.
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE.entries) { entries = load(STORAGE.entries, []); renderList(); }
      if (e.key === STORAGE.settings) { settings = load(STORAGE.settings, { theme: 'auto' }); applyTheme(); render(); }
    });

    // An untouched date moves on when the app comes back on a new day.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && !ui.dateTouched && $('date').value !== todayLocal()) {
        $('date').value = todayLocal();
        render();
      }
    });

    // ---- start ----

    applyTheme();
    $('date').value = todayLocal();
    render();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* the app still works without it */ });
    }
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APP_VERSION: APP_VERSION,
    STORAGE: STORAGE,
    todayLocal: todayLocal,
    isIsoDate: isIsoDate,
    formatDisplayDate: formatDisplayDate,
    filterEntries: filterEntries,
    entryError: entryError
  };
}
