/* ==========================================================
   LANDMARK VERSION 1.0
   Project : Thawfeeq & Shini Wedding
   Purpose : Stable editable baseline before redesign
   Do not delete this marker.
   ========================================================== */

/* =============================================================
   Service worker — offline support for the wedding invitation.
   Bump CACHE_VERSION whenever you change site files so returning
   guests receive the update on their next visit.
   ============================================================= */
const CACHE_VERSION = 'v8';
const SHELL_CACHE = 'wedding-shell-' + CACHE_VERSION;
const ASSET_CACHE = 'wedding-assets-' + CACHE_VERSION;
const FONT_CACHE  = 'wedding-fonts-' + CACHE_VERSION;
const KEEP = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE];

/* Files cached immediately so the invitation opens without a network. */
const PRECACHE = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'favicon.png',
  'assets/gold-divider.svg',
  'assets/mosque-silhouette.png',
  'assets/logo-gold.png',
  'assets/logo-ivory.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'images/hero/hero-couple-main.webp',
  'images/qr/engagement-location.png',
  'images/qr/wedding-location.png',
  'images/qr/reception-location.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => KEEP.indexOf(key) === -1).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* Google Fonts — cache after first use */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  /* Never cache anything else off-site (e.g. the RSVP endpoint) */
  if (url.origin !== self.location.origin) return;

  /* Pages — network first so edits appear straight away, cache as backup */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('index.html', copy));
          return response;
        })
        .catch(() => caches.match('index.html').then((cached) => cached || caches.match('./')))
    );
    return;
  }

  /* Everything else — serve from cache, refresh in the background */
  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});
