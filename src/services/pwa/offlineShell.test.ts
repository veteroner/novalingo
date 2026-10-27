// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const template = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');
const shellFiles = [
  '/index.html',
  '/manifest.json',
  '/assets/entry-current.js',
  '/assets/lazy-current.js',
];

function worker(options: { failInstall?: boolean; quota?: boolean } = {}) {
  const cachesByName = new Map<string, Map<string, Response>>();
  const listeners = new Map<string, (event: any) => void>();
  const network = new Map<string, Response>(
    shellFiles.map((url) => [
      url,
      new Response(
        url === '/index.html' ? '<script src="/assets/entry-current.js"></script>' : `code:${url}`,
      ),
    ]),
  );
  let offline = false;
  const fetch = vi.fn(async (request: Request | string) => {
    const path = typeof request === 'string' ? request : new URL(request.url).pathname;
    if (offline || !network.has(path)) throw new TypeError('network unavailable');
    return network.get(path)!.clone();
  });
  function cache(name: string) {
    let entries = cachesByName.get(name);
    if (!entries) {
      entries = new Map();
      cachesByName.set(name, entries);
    }
    const current = entries;
    return {
      match: async (request: Request | string) =>
        current.get(typeof request === 'string' ? request : new URL(request.url).pathname)?.clone(),
      keys: async () =>
        [...current.keys()].map((path) => new Request(`https://novalingo.test${path}`)),
      delete: async (request: Request) => current.delete(new URL(request.url).pathname),
      put: async (request: Request, response: Response) => {
        if (options.quota) throw new Error('quota');
        current.set(new URL(request.url).pathname, response);
      },
      addAll: async (urls: string[]) => {
        const downloaded = await Promise.all(
          urls.map(async (url) => {
            if (options.failInstall && url.includes('lazy')) throw new Error('failed chunk');
            return [url, await fetch(url)] as const;
          }),
        );
        for (const [url, response] of downloaded) current.set(url, response);
      },
    };
  }
  const skipWaiting = vi.fn();
  const claim = vi.fn();
  const deleteCache = vi.fn(async (name: string) => cachesByName.delete(name));
  runInNewContext(
    template
      .replace("'development-shell'", "'current'")
      .replace('/* APP_SHELL_FILES */ []', JSON.stringify(shellFiles)),
    {
      self: {
        location: { origin: 'https://novalingo.test' },
        addEventListener: (event: string, listener: (event: any) => void) =>
          listeners.set(event, listener),
        skipWaiting,
        clients: { claim },
      },
      caches: {
        open: async (name: string) => cache(name),
        keys: async () => [...cachesByName.keys()],
        delete: deleteCache,
      },
      fetch,
      Response,
      URL,
    },
  );
  async function lifecycle(type: string) {
    const tasks: Promise<unknown>[] = [];
    listeners.get(type)!({ waitUntil: (task: Promise<unknown>) => tasks.push(task) });
    await Promise.all(tasks);
  }
  function request(path: string, init: RequestInit & { navigate?: boolean } = {}) {
    const request = new Request(
      path.startsWith('http') ? path : `https://novalingo.test${path}`,
      init,
    );
    if (init.navigate) Object.defineProperty(request, 'mode', { value: 'navigate' });
    let response: Promise<Response> | undefined;
    const tasks: Promise<unknown>[] = [];
    listeners.get('fetch')!({
      request,
      waitUntil: (task: Promise<unknown>) => tasks.push(task),
      respondWith: (value: Promise<Response>) => {
        response = value;
      },
    });
    return { response, tasks };
  }
  return {
    cachesByName,
    network,
    fetch,
    cache,
    deleteCache,
    skipWaiting,
    claim,
    lifecycle,
    request,
    goOffline: () => {
      offline = true;
    },
  };
}

describe('versioned offline shell', () => {
  it('cold-opens a deep route and a never-visited lazy screen after the first successful install', async () => {
    const w = worker();
    await w.lifecycle('install');
    expect(w.skipWaiting).toHaveBeenCalledOnce();
    w.goOffline();
    expect(await (await w.request('/world/w12', { navigate: true }).response!).text()).toContain(
      '/assets/entry-current.js',
    );
    expect(await (await w.request('/assets/lazy-current.js').response!).text()).toBe(
      'code:/assets/lazy-current.js',
    );
  });
  it('serves the precached manifest offline', async () => {
    const w = worker();
    await w.lifecycle('install');
    w.goOffline();
    expect(await (await w.request('/manifest.json').response!).text()).toBe('code:/manifest.json');
  });
  it('does not activate an incomplete shell or replace the old installation after an asset failure', async () => {
    const w = worker({ failInstall: true });
    w.cachesByName.set(
      'novalingo-shell-v1-previous',
      new Map([['/index.html', new Response('old-shell')]]),
    );
    await expect(w.lifecycle('install')).rejects.toThrow('failed chunk');
    expect(w.skipWaiting).not.toHaveBeenCalled();
    expect(w.cachesByName.get('novalingo-shell-v1-previous')!.has('/index.html')).toBe(true);
    expect(w.cachesByName.get('novalingo-shell-v1-current')!.size).toBe(0);
  });
  it('keeps one previous shell, visited media/audio and unrelated caches on activation', async () => {
    const w = worker();
    for (const key of [
      'other-app-cache',
      'novalingo-v3',
      'novalingo-audio-v2',
      'novalingo-shell-v1-ancient',
      'novalingo-shell-v1-previous',
      'novalingo-shell-v1-failed-install',
    ])
      w.cachesByName.set(key, new Map());
    w.cachesByName.get('novalingo-shell-v1-previous')!.set('/index.html', new Response('previous'));
    await w.lifecycle('install');
    await w.lifecycle('activate');
    expect(w.deleteCache).toHaveBeenCalledTimes(2);
    expect(w.deleteCache).toHaveBeenCalledWith('novalingo-shell-v1-ancient');
    expect(w.deleteCache).toHaveBeenCalledWith('novalingo-shell-v1-failed-install');
    expect(w.cachesByName.has('novalingo-shell-v1-previous')).toBe(true);
    expect(w.claim).toHaveBeenCalledOnce();
  });
  it('serves the previous open tab’s hashed chunk offline without mixing HTML versions', async () => {
    const w = worker();
    w.cachesByName.set(
      'novalingo-shell-v1-previous',
      new Map([
        ['/index.html', new Response('old-html')],
        ['/assets/old-hash.js', new Response('old-code')],
      ]),
    );
    await w.lifecycle('install');
    w.goOffline();
    expect(await (await w.request('/assets/old-hash.js').response!).text()).toBe('old-code');
    expect(await (await w.request('/home', { navigate: true }).response!).text()).not.toBe(
      'old-html',
    );
  });
  it.each([
    ['/api/avatar.png', {}],
    ['/account', { method: 'POST' }],
    ['https://external.test/story/private.webp', {}],
    ['/story/private.webp', { headers: { authorization: 'Bearer private' } }],
    ['/.netlify/functions/verifyApplePurchase', {}],
    ['/audio/tts/example.mp3', { headers: { range: 'bytes=0-100' } }],
  ] as const)(
    'does not intercept private, cross-origin, mutation or partial request %s',
    (path, init) => {
      const w = worker();
      expect(w.request(path, init).response).toBeUndefined();
    },
  );
  it('preserves visited world art offline and returns failure for missing art without inventing a scene', async () => {
    const w = worker();
    w.cachesByName.set(
      'novalingo-v3',
      new Map([['/scenes/worlds-v1/w6.webp', new Response('galaxy')]]),
    );
    w.goOffline();
    const visited = w.request('/scenes/worlds-v1/w6.webp');
    expect(await (await visited.response!).text()).toBe('galaxy');
    await Promise.all(visited.tasks);
    const missing = w.request('/scenes/worlds-v1/w12.webp');
    expect((await missing.response!).type).toBe('error');
    await Promise.all(missing.tasks);
  });
  it('keeps an audio cache write alive and tolerates quota without preventing playback', async () => {
    const w = worker({ quota: true });
    w.network.set('/audio/test.mp3', new Response('audio'));
    const audio = w.request('/audio/test.mp3');
    expect(audio.tasks).toHaveLength(1);
    expect(await (await audio.response!).text()).toBe('audio');
    await Promise.all(audio.tasks);
  });
});
