// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const worker = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

type FetchEvent = {
  request: Request;
  respondWith: (response: Promise<Response>) => void;
  waitUntil: (task: Promise<unknown>) => void;
};

function startWorker(cached?: Response, write?: () => Promise<void>) {
  const listeners = new Map<string, (event: FetchEvent) => void>();
  const cache = {
    match: vi.fn().mockResolvedValue(cached),
    put: vi.fn().mockImplementation(async () => {
      if (write) await write();
    }),
  };
  const fetch = vi.fn();
  runInNewContext(worker, {
    self: {
      addEventListener: (type: string, listener: (event: FetchEvent) => void) =>
        listeners.set(type, listener),
    },
    caches: { open: vi.fn().mockResolvedValue(cache) },
    fetch,
    URL,
    Response,
  });
  function request(path: string) {
    let response: Promise<Response> | undefined;
    const tasks: Promise<unknown>[] = [];
    const event: FetchEvent = {
      request: new Request(`https://novalingo.test${path}`),
      respondWith: (promise) => {
        response = promise;
      },
      waitUntil: (promise) => {
        tasks.push(promise);
      },
    };
    listeners.get('fetch')?.(event);
    if (!response) throw new Error('Image request bypassed the service worker');
    return { response, tasks, event };
  }
  return { fetch, cache, request };
}

describe('WebP offline media cache', () => {
  it('caches a successfully loaded Nova pose for subsequent offline use', async () => {
    const worker = startWorker();
    worker.fetch.mockResolvedValue(new Response('nova-webp'));
    const { response, tasks, event } = worker.request('/nova/poses-v3/thinking.webp');
    expect(await (await response).text()).toBe('nova-webp');
    await Promise.all(tasks);
    expect(worker.cache.put).toHaveBeenCalledOnce();
    const [request, stored] = worker.cache.put.mock.calls[0] as [Request, Response];
    expect(request).toBe(event.request);
    expect(await stored.text()).toBe('nova-webp');
  });

  it('serves a previously read story illustration when the network is unavailable', async () => {
    const worker = startWorker(new Response('cached-story'));
    worker.fetch.mockRejectedValue(new TypeError('Network unavailable'));
    const { response, tasks } = worker.request(
      '/story/interiors-v3/story-w1-nova-farm/page-1.webp',
    );
    expect(await (await response).text()).toBe('cached-story');
    await Promise.all(tasks);
    expect(worker.cache.put).not.toHaveBeenCalled();
  });

  it('keeps the cache write alive while immediately returning an existing image', async () => {
    let finishWrite: (() => void) | undefined;
    const writing = new Promise<void>((resolve) => {
      finishWrite = resolve;
    });
    const worker = startWorker(new Response('cached-pose'), () => writing);
    worker.fetch.mockResolvedValue(new Response('updated-pose'));
    const { response, tasks } = worker.request('/nova/poses-v3/sleeping.webp');
    // Lifetime must be extended synchronously within the original fetch callback.
    expect(tasks).toHaveLength(1);
    expect(await (await response).text()).toBe('cached-pose');
    expect(tasks).toHaveLength(1);
    expect(worker.cache.put).toHaveBeenCalledOnce();
    finishWrite?.();
    await Promise.all(tasks);
  });
});
