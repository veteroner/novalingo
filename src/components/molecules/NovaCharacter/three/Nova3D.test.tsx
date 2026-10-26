import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Nova3D from './Nova3D';

const mocks = vi.hoisted(() => ({
  render: vi.fn(),
  dispose: vi.fn(),
  lose: vi.fn(),
  unsubscribe: vi.fn(),
  speaking: undefined as ((active: boolean) => void) | undefined,
}));
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');
  return {
    ...actual,
    WebGLRenderer: class {
      setPixelRatio() {}
      setClearColor() {}
      setSize() {}
      render = mocks.render;
      dispose = mocks.dispose;
      forceContextLoss = mocks.lose;
      info = { render: { calls: 30, triangles: 20000 } };
    },
  };
});
vi.mock('@services/speech/speechService', () => ({
  isSpeakingNow: () => false,
  onSpeakingStateChange: (listener: (active: boolean) => void) => {
    mocks.speaking = listener;
    return mocks.unsubscribe;
  },
}));
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let intersection: (entries: Partial<IntersectionObserverEntry>[]) => void;
const disconnected = vi.fn();
const ready = vi.fn();
const unavailable = vi.fn();
const initial = {
  mood: 'idle' as const,
  stage: 'child' as const,
  canAnimate: true,
  isActive: true,
  onReady: ready,
  onUnavailable: unavailable,
};
beforeEach(() => {
  vi.clearAllMocks();
  frames = new Map();
  nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnected;
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof intersection) {
        intersection = callback;
      }
      observe() {}
      disconnect = disconnected;
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as WebGL2RenderingContext);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 208,
    height: 224,
    left: 0,
    top: 0,
    bottom: 224,
    right: 208,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Nova 3D lifecycle', () => {
  it('pauses in the background and offscreen, resumes once, and disposes on exit', () => {
    const view = render(<Nova3D {...initial} />);
    expect(ready).toHaveBeenCalledWith(true);
    expect(frames.size).toBe(1);
    view.rerender(<Nova3D {...initial} isActive={false} />);
    expect(frames.size).toBe(0);
    const draws = mocks.render.mock.calls.length;
    act(() => {
      mocks.speaking?.(true);
    });
    expect(mocks.render).toHaveBeenCalledTimes(draws);
    view.rerender(<Nova3D {...initial} />);
    expect(frames.size).toBe(1);
    act(() => {
      intersection([{ isIntersecting: false }]);
    });
    expect(frames.size).toBe(0);
    act(() => {
      intersection([{ isIntersecting: true }]);
    });
    expect(frames.size).toBe(1);
    view.unmount();
    expect(frames.size).toBe(0);
    expect(mocks.dispose).toHaveBeenCalledOnce();
    expect(mocks.lose).toHaveBeenCalledOnce();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
    expect(disconnected).toHaveBeenCalledTimes(2);
  });
  it('renders a static expression with motion disabled, then reacts without recreating the context', () => {
    const view = render(<Nova3D {...initial} canAnimate={false} />);
    expect(frames.size).toBe(0);
    const draws = mocks.render.mock.calls.length;
    view.rerender(<Nova3D {...initial} canAnimate={false} mood="thinking" />);
    expect(mocks.render.mock.calls.length).toBeGreaterThan(draws);
    expect(frames.size).toBe(0);
    expect(mocks.dispose).not.toHaveBeenCalled();
    view.rerender(<Nova3D {...initial} />);
    expect(frames.size).toBe(1);
  });
  it('falls back and cancels drawing if the graphics context is lost', () => {
    const view = render(<Nova3D {...initial} />);
    fireEvent(
      view.container.querySelector('canvas')!,
      new Event('webglcontextlost', { cancelable: true }),
    );
    expect(unavailable).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    view.unmount();
    expect(mocks.dispose).toHaveBeenCalledOnce();
  });
  it('keeps the image fallback when WebGL2 is unavailable without leaking a context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const view = render(<Nova3D {...initial} />);
    expect(unavailable).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalledWith(true);
    expect(frames.size).toBe(0);
    expect(view.container.querySelector('canvas')).toBeNull();
    view.unmount();
    expect(mocks.dispose).not.toHaveBeenCalled();
  });
});
