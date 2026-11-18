/**
 * Firestore `users/{uid}/subscriptions/*` dokümanını reklam raporu için sınıflandırır.
 * Saf fonksiyon: Firestore'a erişmez; `scripts/ad-funnel-report.mjs` ve testler kullanır.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** Play'deki yıllık 7 günlük ücretsiz deneme teklifinin kimliği (docs/play/pricing-and-offers.md). */
export const TRIAL_OFFER_IDS = new Set(['yearly-trial-7d']);
export const TRIAL_DAYS = 7;

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'number' || typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Abonelik dokümanını sınıflandırır.
 * @returns {{ test: boolean, status: 'trial' | 'paid' | 'canceled_active' | 'ended' | 'refunded' | 'other' }}
 */
export function classifySubscription(sub, now = new Date()) {
  const raw = sub.raw ?? {};
  const test =
    (sub.platform === 'apple' && String(sub.environment ?? '').toLowerCase() === 'sandbox') ||
    (sub.platform === 'google' && raw.testPurchase != null);

  const state = sub.state ?? 'unknown';
  if (state === 'refunded' || state === 'revoked') return { test, status: 'refunded' };

  // Google deneme bilgisini durumda değil teklif kimliğinde tutar.
  const lineItems = Array.isArray(raw.lineItems) ? raw.lineItems : [];
  const googleTrialOffer = lineItems.some((li) => TRIAL_OFFER_IDS.has(li?.offerDetails?.offerId));
  const startTime = toDate(raw.startTime);
  const googleInTrial =
    sub.platform === 'google' &&
    googleTrialOffer &&
    startTime != null &&
    now.getTime() < startTime.getTime() + TRIAL_DAYS * DAY_MS;

  if (state === 'trial' || (googleInTrial && ['active', 'canceled', 'grace'].includes(state))) {
    return { test, status: 'trial' };
  }
  if (state === 'active' || state === 'grace') return { test, status: 'paid' };
  if (state === 'canceled') {
    const expiresAt = toDate(sub.expiresAt);
    return { test, status: expiresAt && expiresAt > now ? 'canceled_active' : 'ended' };
  }
  if (state === 'expired') return { test, status: 'ended' };
  return { test, status: 'other' };
}

