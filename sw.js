/* sw.js — the service worker. It copies every game file into the phone's cache
   the first time the app loads online, then serves them from there, so the game
   works with no internet at all.

   TO UPDATE THE GAME LATER: change the version number below. Phones will then
   download the new files and throw away the old copies. */
const CACHE = 'offgrid-lite-v1';

const FILES = [
  './',
  'index.html',
  'style.css',
  'data.js',
  'storage.js',
  'game.js',
  'ui.js',
  'play.js',
  'app.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).catch(function () {
        // Offline and not cached: for page loads, show the game anyway.
        if (req.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      });
    })
  );
});
