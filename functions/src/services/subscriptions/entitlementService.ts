import { db, serverTimestamp } from '../../utils/admin';

export type SubscriptionPlatform = 'apple' | 'google';
export type SubscriptionState =
  | 'active'
  | 'trial'
  | 'grace'
  | 'billing_issue'
  | 'canceled'
  | 'expired'
  | 'revoked'
  | 'refunded'
  | 'paused'
  | 'pending'
  | 'unknown';

export interface VerifiedSubscriptionUpdate {
  uid: string;
  platform: SubscriptionPlatform;
  externalId: string;
  productId: string;
  state: SubscriptionState;
  isEntitlementActive: boolean;
  expiresAt?: Date | null;
  originalTransactionId?: string | null;
  trialEndsAt?: Date | null;
  autoRenewEnabled?: boolean | null;
  eventId?: string | null;
  eventType?: string | null;
  verifiedAt?: Date;
  raw?: Record<string, unknown>;
}

function makeSubscriptionDocumentId(platform: SubscriptionPlatform, externalId: string): string {
  return `${platform}_${Buffer.from(externalId, 'utf8').toString('base64url')}`;
}

function normalizeDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (
    typeof value === 'object' &&
    value &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    const parsed = value.toDate() as Date;
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function computeProjectedStatus(
  state: SubscriptionState,
  expiresAt: Date | null,
  now: Date,
): boolean {
  if (state === 'active' || state === 'trial' || state === 'grace') {
    return !expiresAt || expiresAt.getTime() > now.getTime();
  }
  return false;
}

export async function refreshUserEntitlement(uid: string): Promise<void> {
  const snap = await db.collection(`users/${uid}/subscriptions`).get();
  const now = new Date();

  let bestActive:
    | {
        state: SubscriptionState;
        expiresAt: Date | null;
        platform: SubscriptionPlatform;
        productId: string;
      }
    | undefined;

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const state = (data.state as SubscriptionState | undefined) ?? 'unknown';
    const platform = (data.platform as SubscriptionPlatform | undefined) ?? 'apple';
    const productId = (data.productId as string | undefined) ?? '';
    const expiresAt = normalizeDate(data.expiresAt);
    const isActive = computeProjectedStatus(state, expiresAt, now);

    if (!isActive) continue;

    if (!bestActive) {
      bestActive = { state, expiresAt, platform, productId };
      continue;
    }

    const bestExpiryMs = bestActive.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
    const currentExpiryMs = expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
    if (currentExpiryMs > bestExpiryMs) {
      bestActive = { state, expiresAt, platform, productId };
    }
  }

  await db.doc(`users/${uid}`).set(
    {
      isPremium: Boolean(bestActive),
      premiumExpiresAt: bestActive?.expiresAt ?? null,
      subscriptionState: bestActive?.state ?? 'expired',
      subscriptionPlatform: bestActive?.platform ?? null,
      subscriptionProductId: bestActive?.productId ?? null,
      entitlementUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function upsertVerifiedSubscription(
  update: VerifiedSubscriptionUpdate,
): Promise<void> {
  const docId = makeSubscriptionDocumentId(update.platform, update.externalId);
  const verifiedAt = update.verifiedAt ?? new Date();

  await db.doc(`users/${update.uid}/subscriptions/${docId}`).set(
    {
      uid: update.uid,
      platform: update.platform,
      externalId: update.externalId,
      productId: update.productId,
      state: update.state,
      isEntitlementActive: update.isEntitlementActive,
      expiresAt: update.expiresAt ?? null,
      originalTransactionId: update.originalTransactionId ?? null,
      trialEndsAt: update.trialEndsAt ?? null,
      autoRenewEnabled: update.autoRenewEnabled ?? null,
      lastEventId: update.eventId ?? null,
      lastEventType: update.eventType ?? null,
      lastVerifiedAt: verifiedAt,
      raw: update.raw ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await refreshUserEntitlement(update.uid);
}
