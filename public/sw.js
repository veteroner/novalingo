/**
 * NovaLingo Service Worker — Minimal PWA support for pilot
 *
 * Strategy:
 *   - App shell (JS/CSS/HTML) → Cache-First after first load
 *   - Firestore / Auth API calls → Network-Only (pass-through)
 *   - Audio files (TTS cache) → Cache-First with size limit
 */

const CACHE_NAME = 'novalingo-v2';
const AUDIO_CACHE = 'novalingo-audio-v1';
const MAX_AUDIO_ENTRIES = 200; // Limit cached audio files

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pass-through: Firebase, analytics, external APIs
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('firebaseapp.com')
  ) {
    return;
  }

  // Audio files — cache-first with quota management
  if (url.pathname.startsWith('/audio/') || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          // Enforce entry limit: evict oldest entries if over MAX
          const keys = await cache.keys();
          if (keys.length >= MAX_AUDIO_ENTRIES) {
            await cache.delete(keys[0]);
          }
          cache.put(request, response.clone());
        }
        return response;
      }),
    );
    return;
  }

  // Static assets (JS/CSS/images) — stale-while-revalidate
  // Serve from cache immediately (avoids offline crash for lazy-loaded chunks),
  // then update cache in the background for next visit.
  if (url.pathname.startsWith('/assets/') || url.pathname.match(/\.(png|jpg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        // Kick off a background network fetch to keep the cache fresh
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => null); // swallow offline errors for background update

        // Return cached version immediately if available; otherwise wait for network
        return cached ?? (await networkFetch) ?? Response.error();
      }),
    );
    return;
  }

  // Navigation requests — network-first with cache fallback for offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then((r) => r ?? Response.error())),
    );
    return;
  }

  // Default: network only
});
