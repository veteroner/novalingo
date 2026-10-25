import { isNative } from '@/utils/platform';
import { useMotionPolicy } from '@hooks/useMotionPolicy';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppMotionProvider } from './AppMotionProvider';

vi.mock('@/utils/platform', () => ({ isNative: vi.fn(() => false) }));
const nativeMocks = vi.hoisted(() => ({
  addListener:
    vi.fn<
      (
        event: string,
        listener: (state: { isActive: boolean }) => void,
      ) => Promise<{ remove: () => Promise<void> }>
    >(),
  getState: vi.fn<() => Promise<{ isActive: boolean }>>(),
}));
vi.mock('@capacitor/app', () => ({ App: nativeMocks }));

let hidden = false;
let matches = false;
let mediaChange: (() => void) | undefined;
let nativeChange: ((state: { isActive: boolean }) => void) | undefined;
const removeNative = vi.fn().mockResolvedValue(undefined);
const removeMedia = vi.fn();
const mounted = vi.fn();
const disposed = vi.fn();

function Probe() {
  const policy = useMotionPolicy();
  const [answer, setAnswer] = useState('');
  useEffect(() => {
    mounted();
    return disposed;
  }, []);
  return (
    <>
      <output aria-label="policy">{JSON.stringify(policy)}</output>
      <input
        aria-label="answer"
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
        }}
      />
      <NovaCharacter mood="celebrating" />
    </>
  );
}
function policy() {
  return JSON.parse(screen.getByLabelText('policy').textContent);
}
function visibility(value: boolean) {
  act(() => {
    hidden = value;
    document.dispatchEvent(new Event('visibilitychange'));
  });
}
async function native(value: boolean) {
  await act(async () => {
    nativeChange?.({ isActive: value });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  removeNative.mockResolvedValue(undefined);
  hidden = false;
  matches = false;
  mediaChange = undefined;
  nativeChange = undefined;
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  vi.mocked(window.matchMedia).mockImplementation(
    () =>
      ({
        get matches() {
          return matches;
        },
        addEventListener: (_event: string, listener: () => void) => {
          mediaChange = listener;
        },
        removeEventListener: removeMedia,
      }) as unknown as MediaQueryList,
  );
  vi.mocked(isNative).mockReturnValue(false);
  nativeMocks.addListener.mockImplementation((_event, listener) => {
    nativeChange = listener;
    return Promise.resolve({ remove: removeNative });
  });
  nativeMocks.getState.mockResolvedValue({ isActive: true });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AppMotionProvider', () => {
  it('stops hidden-document decoration and resumes without losing the answer or remounting', () => {
    const { container, unmount } = render(
      <AppMotionProvider>
        <Probe />
      </AppMotionProvider>,
    );
    fireEvent.change(screen.getByLabelText('answer'), { target: { value: 'dog' } });
    expect(policy().canAnimate).toBe(true);
    visibility(true);
    expect(policy()).toEqual({ isActive: false, reducedMotion: false, canAnimate: false });
    expect(container.querySelector('[data-motion-active]')).toHaveAttribute(
      'data-motion-active',
      'false',
    );
    expect(container.querySelector('.nova-character')).toHaveAttribute('data-motion', 'off');
    visibility(false);
    expect(policy().canAnimate).toBe(true);
    expect(screen.getByLabelText('answer')).toHaveValue('dog');
    expect(mounted).toHaveBeenCalledOnce();
    expect(disposed).not.toHaveBeenCalled();
    unmount();
    expect(disposed).toHaveBeenCalledOnce();
    expect(removeMedia).toHaveBeenCalledWith('change', mediaChange);
  });

  it('honors reduced motion on first render and live changes in both directions', () => {
    matches = true;
    const { container } = render(
      <AppMotionProvider>
        <Probe />
      </AppMotionProvider>,
    );
    expect(policy()).toEqual({ isActive: true, reducedMotion: true, canAnimate: false });
    expect(container.querySelector('.nova-character')).toHaveAttribute('data-motion', 'off');
    act(() => {
      matches = false;
      mediaChange?.();
    });
    expect(policy().canAnimate).toBe(true);
    act(() => {
      matches = true;
      mediaChange?.();
    });
    expect(policy().canAnimate).toBe(false);
    expect(container.querySelector('[data-motion-reduced]')).toHaveAttribute(
      'data-motion-reduced',
      'true',
    );
  });

  it('combines native activity with visibility and rejects a stale initial native query', async () => {
    vi.mocked(isNative).mockReturnValue(true);
    let resolveInitial!: (state: { isActive: boolean }) => void;
    nativeMocks.getState.mockReturnValue(
      new Promise((resolve) => {
        resolveInitial = resolve;
      }),
    );
    const { unmount } = render(
      <AppMotionProvider>
        <Probe />
      </AppMotionProvider>,
    );
    await native(false);
    await act(async () => {
      resolveInitial({ isActive: true });
    });
    expect(policy().canAnimate).toBe(false);
    visibility(true);
    await native(true);
    expect(policy().canAnimate).toBe(false);
    visibility(false);
    expect(policy().canAnimate).toBe(true);
    unmount();
    expect(removeNative).toHaveBeenCalledOnce();
  });

  it('uses an inactive initial native state before any event', async () => {
    vi.mocked(isNative).mockReturnValue(true);
    nativeMocks.getState.mockResolvedValue({ isActive: false });
    await act(async () => {
      render(
        <AppMotionProvider>
          <Probe />
        </AppMotionProvider>,
      );
    });
    expect(policy().isActive).toBe(false);
    await native(true);
    expect(policy().canAnimate).toBe(true);
  });

  it('cleans up a listener that resolves after unmount', async () => {
    vi.mocked(isNative).mockReturnValue(true);
    let resolveListener!: (handle: { remove: typeof removeNative }) => void;
    nativeMocks.addListener.mockReturnValue(
      new Promise((resolve) => {
        resolveListener = resolve;
      }),
    );
    const { unmount } = render(
      <AppMotionProvider>
        <Probe />
      </AppMotionProvider>,
    );
    unmount();
    await act(async () => {
      resolveListener({ remove: removeNative });
    });
    expect(removeNative).toHaveBeenCalledOnce();
  });

  it('keeps document/preference controls usable when the native bridge rejects', async () => {
    vi.mocked(isNative).mockReturnValue(true);
    nativeMocks.addListener.mockRejectedValue(new Error('unavailable'));
    nativeMocks.getState.mockRejectedValue(new Error('unavailable'));
    await act(async () => {
      render(
        <AppMotionProvider>
          <Probe />
        </AppMotionProvider>,
      );
    });
    visibility(true);
    expect(policy().canAnimate).toBe(false);
  });
});
