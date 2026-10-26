/** NovaLingo PWA: a complete versioned shell + previously visited local media.
 * Build replaces the markers below; native packages do not register this worker.
 * Auth/API/cross-origin and non-GET requests are never handled here.
 */
const BUILD_ID = 'development-shell';
const SHELL_PREFIX = 'novalingo-shell-v1-';
const SHELL_CACHE = SHELL_PREFIX + BUILD_ID;
const APP_SHELL_FILES = /* APP_SHELL_FILES */ [];
// Preserve the existing image cache across app updates (and its v3 media).
const CACHE_NAME = 'novalingo-v3';
const AUDIO_CACHE = 'novalingo-audio-v2';
const MAX_AUDIO_ENTRIES = 200;
const PRECACHE_URLS = APP_SHELL_FILES.length ? APP_SHELL_FILES : ['/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  // A failed asset aborts installation; never activate a partly downloaded shell.
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Retain the previous shell for already-open tabs requesting its hashed chunks.
      let previous;
      for (const key of keys
        .filter((key) => key.startsWith(SHELL_PREFIX) && key !== SHELL_CACHE)
        .reverse()) {
        // Failed installs can leave an empty cache; keep the last complete shell.
        if (await (await caches.open(key)).match('/index.html')) {
          previous = key;
          break;
        }
      }
      await Promise.all(
        keys
          .filter((key) => key.startsWith(SHELL_PREFIX) && key !== SHELL_CACHE && key !== previous)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function shellAsset(request) {
  const current = await caches.open(SHELL_CACHE);
  const cached = await current.match(request);
  if (cached) return cached;
  // The request URL includes its hash: it is safe to use the previous version.
  const keys = await caches.keys();
  for (const key of keys.filter((key) => key.startsWith(SHELL_PREFIX) && key !== SHELL_CACHE)) {
    const previous = await (await caches.open(key)).match(request);
    if (previous) return previous;
  }
  return fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    request.headers.get('authorization')
  )
    return;

  if (request.mode === 'navigate') {
    // Always pair this worker's HTML with the fully installed matching chunks.
    event.respondWith(
      caches
        .open(SHELL_CACHE)
        .then(async (cache) => (await cache.match('/index.html')) ?? fetch(request)),
    );
    return;
  }

  if (
    APP_SHELL_FILES.includes(url.pathname) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/fonts/')
  ) {
    event.respondWith(shellAsset(request));
    return;
  }

  if (url.pathname.startsWith('/audio/')) {
    if (request.headers.get('range')) return;
    // Extend lifetime through the cache write and eviction, including on first load.
    const task = caches.open(AUDIO_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.status === 200 && response.type !== 'opaque') {
        try {
          const keys = await cache.keys();
          if (keys.length >= MAX_AUDIO_ENTRIES) await cache.delete(keys[0]);
          await cache.put(request, response.clone());
        } catch {
          /* Storage quota must not prevent audio playback. */
        }
      }
      return response;
    });
    event.waitUntil(task.then(() => undefined).catch(() => {}));
    event.respondWith(task);
    return;
  }

  // Only explicit public media paths; an API URL ending in .png is still private.
  if (
    /^\/(?:nova|story|scenes|icons|images)\//.test(url.pathname) &&
    /\.(png|jpe?g|webp|svg|ico)$/.test(url.pathname)
  ) {
    const cachePromise = caches.open(CACHE_NAME);
    const networkFetch = cachePromise
      .then(async (cache) => {
        const response = await fetch(request);
        if (response.status === 200 && response.type !== 'opaque') {
          await cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => null);
    event.waitUntil(networkFetch.then(() => undefined));
    event.respondWith(
      cachePromise.then(
        async (cache) => (await cache.match(request)) ?? (await networkFetch) ?? Response.error(),
      ),
    );
  }
});
