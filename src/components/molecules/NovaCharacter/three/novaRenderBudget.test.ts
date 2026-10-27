import { describe, expect, it, vi } from 'vitest';
import { acquireNovaContext, releaseNovaContext, onNovaContextAvailable } from './novaRenderBudget';

describe('Nova GPU budget', () => {
  it('limits concurrent contexts and lets a waiting card take a released slot', () => {
    const a = Symbol(),
      b = Symbol(),
      c = Symbol();
    expect(acquireNovaContext(a)).toBe(true);
    expect(acquireNovaContext(a)).toBe(true);
    expect(acquireNovaContext(b)).toBe(true);
    expect(acquireNovaContext(c)).toBe(false);
    const available = vi.fn();
    const unsubscribe = onNovaContextAvailable(available);
    releaseNovaContext(a);
    expect(available).toHaveBeenCalledOnce();
    expect(acquireNovaContext(c)).toBe(true);
    releaseNovaContext(a);
    expect(available).toHaveBeenCalledOnce();
    unsubscribe();
    releaseNovaContext(b);
    releaseNovaContext(c);
    expect(available).toHaveBeenCalledOnce();
  });
});
