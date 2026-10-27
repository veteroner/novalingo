import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNova3DVisibility } from './useNova3DVisibility';

let callbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[];
const disconnect = vi.fn();
const host = () => ({ current: document.createElement('span') });
const entry = (visible: boolean, width = 160) => [
  { isIntersecting: visible, boundingClientRect: { width, height: 160 } as DOMRectReadOnly },
];
beforeEach(() => {
  callbacks = [];
  vi.clearAllMocks();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (typeof callbacks)[number]) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect = disconnect;
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Nova context visibility', () => {
  it('waits for a visible box, releases offscreen and excludes display:none boxes', () => {
    const ref = host();
    const view = renderHook(() => useNova3DVisibility(ref, true));
    expect(view.result.current).toBe(false);
    act(() => {
      callbacks[0]?.(entry(true, 0));
    });
    expect(view.result.current).toBe(false);
    act(() => {
      callbacks[0]?.(entry(true));
    });
    expect(view.result.current).toBe(true);
    act(() => {
      callbacks[0]?.(entry(false));
    });
    expect(view.result.current).toBe(false);
    act(() => {
      callbacks[0]?.(entry(true));
    });
    expect(view.result.current).toBe(true);
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
  it('hands a freed slot to a waiting visible character and stops inactive characters', () => {
    const a = host(),
      b = host(),
      c = host();
    const first = renderHook(({ enabled }) => useNova3DVisibility(a, enabled), {
      initialProps: { enabled: true },
    });
    const second = renderHook(() => useNova3DVisibility(b, true));
    const third = renderHook(() => useNova3DVisibility(c, true));
    act(() => {
      callbacks.forEach((callback) => {
        callback(entry(true));
      });
    });
    expect(first.result.current).toBe(true);
    expect(second.result.current).toBe(true);
    expect(third.result.current).toBe(false);
    first.rerender({ enabled: false });
    expect(first.result.current).toBe(false);
    expect(third.result.current).toBe(true);
    act(() => {
      callbacks[0]?.(entry(true));
    });
    expect(first.result.current).toBe(false);
  });
});
