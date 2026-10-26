import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NovaCharacter } from './NovaCharacter';

const graphics = vi.hoisted(() => ({ fail: undefined as (() => void) | undefined }));

vi.mock('./three/Nova3D', () => ({
  default: function MockNova3D({
    onReady,
    onUnavailable,
  }: {
    onReady: (ready: boolean) => void;
    onUnavailable: () => void;
  }) {
    useEffect(() => {
      graphics.fail = onUnavailable;
      onReady(true);
      return () => {
        onReady(false);
      };
    }, [onReady, onUnavailable]);
    return <canvas data-testid="nova-webgl" onError={onUnavailable} />;
  },
}));
let callbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[];
beforeEach(() => {
  callbacks = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (typeof callbacks)[number]) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function visible() {
  act(() => {
    callbacks.forEach((callback) => {
      callback([
        {
          isIntersecting: true,
          boundingClientRect: { width: 160, height: 160 } as DOMRectReadOnly,
        },
      ]);
    });
  });
}

describe('Nova detailed 3D rendering', () => {
  it('upgrades a visible hero while keeping one accessible Nova, then recovers from graphics failure', async () => {
    render(<NovaCharacter size="hero" mood="thinking" />);
    expect(screen.getByRole('img', { name: 'Nova' }).tagName).toBe('IMG');
    visible();
    await screen.findByTestId('nova-webgl');
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Nova' }).tagName).toBe('SPAN');
    });
    expect(screen.getAllByRole('img', { name: 'Nova' })).toHaveLength(1);
    act(() => {
      graphics.fail?.();
    });
    await waitFor(() => {
      expect(screen.queryByTestId('nova-webgl')).toBeNull();
    });
    expect(screen.getByRole('img', { name: 'Nova' })).toHaveAttribute(
      'src',
      '/nova/poses-v3/thinking.webp',
    );
  });
  it('keeps compact avatars on artwork and renders sleeping Nova with authored eyelids', async () => {
    render(
      <>
        <NovaCharacter size="sm" />
        <NovaCharacter size="hero" mood="sleeping" />
        <NovaCharacter size="xl" mood="sleeping" renderMode="3d" />
        <NovaCharacter size="hero" renderMode="image" />
      </>,
    );
    visible();
    await waitFor(() => {
      expect(screen.getAllByTestId('nova-webgl')).toHaveLength(2);
    });
    expect(screen.getAllByRole('img', { name: 'Nova' })).toHaveLength(4);
  });
});
