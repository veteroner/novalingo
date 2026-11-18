// @vitest-environment node
/**
 * scripts/lib/subscriptionStatus.mjs — reklam huni raporundaki abonelik sınıflandırması.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

type Status = { test: boolean; status: string };
type Classify = (sub: Record<string, unknown>, now?: Date) => Status;

let classify: Classify;

beforeAll(async () => {
  const url = pathToFileURL(resolve(process.cwd(), 'scripts/lib/subscriptionStatus.mjs')).href;
  const mod = (await import(/* @vite-ignore */ url)) as { classifySubscription: Classify };
  classify = mod.classifySubscription;
});

const now = new Date('2026-11-20T00:00:00Z');
const trialLine = { lineItems: [{ offerDetails: { offerId: 'yearly-trial-7d' } }] };

describe('classifySubscription', () => {
  it('Apple deneme, ücretli ve iade durumlarını ayırır', () => {
    expect(classify({ platform: 'apple', state: 'trial', environment: 'Production' }, now)).toEqual(
      {
        test: false,
        status: 'trial',
      },
    );
    expect(
      classify({ platform: 'apple', state: 'active', environment: 'Production' }, now).status,
    ).toBe('paid');
    expect(
      classify({ platform: 'apple', state: 'revoked', environment: 'Production' }, now).status,
    ).toBe('refunded');
  });

  it('Sandbox ve Google test alımlarını gerçek sayılara katmaz', () => {
    expect(classify({ platform: 'apple', state: 'active', environment: 'Sandbox' }, now).test).toBe(
      true,
    );
    expect(
      classify({ platform: 'google', state: 'active', raw: { testPurchase: {} } }, now).test,
    ).toBe(true);
  });

  it('Google deneme teklifini başlangıçtan sonraki 7 gün deneme, sonra ücretli sayar', () => {
    const inTrial = {
      platform: 'google',
      state: 'active',
      raw: { ...trialLine, startTime: '2026-11-17T00:00:00Z' },
    };
    const afterTrial = {
      platform: 'google',
      state: 'active',
      raw: { ...trialLine, startTime: '2026-11-01T00:00:00Z' },
    };
    expect(classify(inTrial, now).status).toBe('trial');
    expect(classify(afterTrial, now).status).toBe('paid');
  });

  it('iptal edilmiş ama süresi devam edeni bitmişten ayırır', () => {
    expect(
      classify(
        { platform: 'google', state: 'canceled', expiresAt: new Date('2026-12-01'), raw: {} },
        now,
      ).status,
    ).toBe('canceled_active');
    expect(
      classify(
        { platform: 'google', state: 'canceled', expiresAt: new Date('2026-11-01'), raw: {} },
        now,
      ).status,
    ).toBe('ended');
    expect(classify({ platform: 'google', state: 'expired', raw: {} }, now).status).toBe('ended');
  });
});
