/**
 * Apple aboneliğini Firestore'a yansıtır (Admin SDK).
 *
 * Yetki otoritesi `users/{uid}/subscriptions/*`; `users.isPremium` bunun
 * projeksiyonudur (`functions/src/services/subscriptions/entitlementService.ts`
 * ile aynı alanlar). `appleTransactions/{originalTransactionId}` bir aboneliği
 * tek bir Firebase kullanıcısına bağlar — istemci bu koleksiyona erişemez.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { APPLE_BUNDLE_ID } from './appStoreServerApi';
import { verifyAppleSignedJws } from './appleJws';
import { adminDb } from './firebaseAdmin';

export const KNOWN_PRODUCT_IDS = new Set(['com.novalingo.app.monthly', 'com.novalingo.app.yearly']);

export type SubscriptionState =
  | 'active'
  | 'trial'
  | 'grace'
  | 'billing_issue'
  | 'expired'
  | 'revoked'
  | 'unknown';

export interface AppleTransactionInfo {
  bundleId?: string;
  productId?: string;
  transactionId?: string;
  originalTransactionId?: string;
  expiresDate?: number;
  revocationDate?: number;
  /** 1: tanıtım fiyatı / ücretsiz deneme */
  offerType?: number;
  offerDiscountType?: string;
  environment?: string;
}

export class OwnershipError extends Error {}

/** Apple abonelik durum kodunu (1–5) uygulama durumuna çevirir. */
export function stateFromAppleStatus(status: number | undefined, tx: AppleTransactionInfo) {
  const isTrial = tx.offerType === 1 && tx.offerDiscountType === 'FREE_TRIAL';
  switch (status) {
    case 1:
      return isTrial ? 'trial' : 'active';
    case 4:
      return 'grace';
    case 3:
      return 'billing_issue';
    case 2:
      return 'expired';
    case 5:
      return 'revoked';
    default:
      return 'unknown';
  }
}

function isEntitlementActive(state: SubscriptionState, expiresAt: Date | null): boolean {
  if (state !== 'active' && state !== 'trial' && state !== 'grace') return false;
  return !expiresAt || expiresAt.getTime() > Date.now();
}

/** İmzalı işlemi doğrular; paket kimliği veya ürün bizim değilse reddeder. */
export function verifyTransaction(signedTransactionInfo: string): AppleTransactionInfo {
  const tx = verifyAppleSignedJws<AppleTransactionInfo>(signedTransactionInfo);
  if (tx.bundleId !== APPLE_BUNDLE_ID) throw new OwnershipError('Bundle ID mismatch');
  if (!tx.productId || !KNOWN_PRODUCT_IDS.has(tx.productId)) {
    throw new OwnershipError('Unknown product');
  }
  if (!tx.originalTransactionId) throw new OwnershipError('Missing originalTransactionId');
  return tx;
}

/**
 * Aboneliği kullanıcıya bağlar. Aynı abonelik başka bir hesaba bağlıysa ve o
 * hesap hâlâ varsa reddedilir; silinmiş hesaptan yeni hesaba devredilebilir.
 */
export async function claimOriginalTransaction(
  originalTransactionId: string,
  uid: string,
): Promise<void> {
  const db = adminDb();
  const ref = db.doc(`appleTransactions/${originalTransactionId}`);
  await db.runTransaction(async (trx) => {
    const snap = await trx.get(ref);
    const owner = snap.exists ? (snap.get('uid') as string | undefined) : undefined;
    if (owner && owner !== uid) {
      const ownerDoc = await trx.get(db.doc(`users/${owner}`));
      if (ownerDoc.exists) {
        throw new OwnershipError('Subscription is linked to another account');
      }
    }
    trx.set(ref, { uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

export async function findOwner(originalTransactionId: string): Promise<string | null> {
  const snap = await adminDb().doc(`appleTransactions/${originalTransactionId}`).get();
  return snap.exists ? ((snap.get('uid') as string | undefined) ?? null) : null;
}

/** Abonelik kaydını yazar ve `users/{uid}` premium projeksiyonunu tazeler. */
export async function upsertAppleSubscription(
  uid: string,
  tx: AppleTransactionInfo,
  state: SubscriptionState,
  eventType: string,
): Promise<boolean> {
  const db = adminDb();
  const originalTransactionId = tx.originalTransactionId ?? '';
  const expiresAt = tx.expiresDate ? new Date(tx.expiresDate) : null;
  const effectiveState: SubscriptionState = tx.revocationDate ? 'revoked' : state;
  const active = isEntitlementActive(effectiveState, expiresAt);
  const docId = `apple_${Buffer.from(originalTransactionId, 'utf8').toString('base64url')}`;

  await db.doc(`users/${uid}/subscriptions/${docId}`).set(
    {
      uid,
      platform: 'apple',
      externalId: originalTransactionId,
      originalTransactionId,
      productId: tx.productId ?? null,
      state: effectiveState,
      isEntitlementActive: active,
      expiresAt,
      environment: tx.environment ?? null,
      lastEventType: eventType,
      lastVerifiedAt: new Date(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await refreshUserEntitlement(uid);
  return active;
}

/** Tüm abonelik kayıtlarından en uzun süreli aktif olanı `users/{uid}`'a yansıtır. */
async function refreshUserEntitlement(uid: string): Promise<void> {
  const db = adminDb();
  const snap = await db.collection(`users/${uid}/subscriptions`).get();
  let best: { state: string; expiresAt: Date | null; platform: string; productId: string } | null =
    null;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.isEntitlementActive) continue;
    const expiresAt =
      data.expiresAt && typeof data.expiresAt.toDate === 'function'
        ? (data.expiresAt.toDate() as Date)
        : null;
    if (expiresAt && expiresAt.getTime() <= Date.now()) continue;
    const candidate = {
      state: String(data.state),
      expiresAt,
      platform: String(data.platform),
      productId: String(data.productId ?? ''),
    };
    const bestMs = best?.expiresAt?.getTime() ?? -1;
    const candMs = expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
    if (!best || candMs > bestMs) best = candidate;
  }

  await db.doc(`users/${uid}`).set(
    {
      isPremium: Boolean(best),
      premiumExpiresAt: best?.expiresAt ?? null,
      subscriptionState: best?.state ?? 'expired',
      subscriptionPlatform: best?.platform ?? null,
      subscriptionProductId: best?.productId ?? null,
      entitlementUpdatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
