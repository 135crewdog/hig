/* Service worker: caches the app so it opens offline.
 * Bump VERSION (and APP_VERSION in app.js) on every change to any file in app/, or devices keep the old copy.
 * Requests to other origins (APIs) are never intercepted. */
var APP = 'starter';
// '/' can't appear in an app name, so no other app's caches can share this prefix.
var VERSION = APP + '/2026.10.14.5';
var SHELL = ['./', './index.html', './app.js', './style.css', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (event) {
  // Past the browser's HTTP cache, like every fetch below, so the install never saves a copy left from before the deploy.
  event.waitUntil(caches.open(VERSION).then(function (cache) {
    return cache.addAll(SHELL.map(function (url) { return new Request(url, { cache: 'no-cache' }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      // Only this app's own old caches: every app on this origin shares cache storage.
      return Promise.all(keys.filter(function (k) { return k.indexOf(APP + '/') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Network first for every file, past the browser's HTTP cache, so a new page and its new
  // script arrive together. The cached copy serves when offline.
  event.respondWith(
    caches.open(VERSION).then(function (cache) {
      return fetch(req, { cache: 'no-cache' }).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () {
        return cache.match(req, { ignoreSearch: true }).then(function (cached) {
          if (cached || req.mode !== 'navigate') return cached;
          // Only the app's own address falls back to the app; any other page says it is offline.
          var scopePath = new URL(self.registration.scope).pathname;
          if (url.pathname === scopePath || url.pathname === scopePath + 'index.html') return cache.match('./');
          return new Response('Offline. This page has not been saved on this device yet; open it again with a connection.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        });
      });
    })
  );
});
