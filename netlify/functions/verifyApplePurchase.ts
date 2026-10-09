/**
 * Netlify Function — iOS satın alma / geri yükleme doğrulaması.
 *
 * İstemci (StoreKit 1) `transactionId` ve Firebase ID token'ı gönderir.
 * Abonelik durumu App Store Server API'den sorulur, Apple imzası doğrulanır,
 * abonelik kullanıcıya bağlanır ve `users/{uid}.isPremium` Admin SDK ile yazılır.
 * Spark planında Cloud Functions çalışmadığı için bu iş Netlify'da yapılır.
 */

import { getAllSubscriptionStatuses, AppStoreApiError } from '../lib/appStoreServerApi';
import {
  claimOriginalTransaction,
  OwnershipError,
  stateFromAppleStatus,
  upsertAppleSubscription,
  verifyTransaction,
} from '../lib/appleEntitlement';
import { AppleJwsError } from '../lib/appleJws';
import { adminAuth } from '../lib/firebaseAdmin';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const idToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!idToken) return json(401, { error: 'unauthenticated' });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return json(401, { error: 'unauthenticated' });
  }

  let transactionId: unknown;
  try {
    ({ transactionId } = (await req.json()) as { transactionId?: unknown });
  } catch {
    return json(400, { error: 'invalid_body' });
  }
  if (typeof transactionId !== 'string' || !/^\d{1,32}$/.test(transactionId)) {
    return json(400, { error: 'invalid_transaction_id' });
  }

  try {
    const statuses = await getAllSubscriptionStatuses(transactionId);
    let isPremium = false;
    let matched = 0;

    for (const group of statuses.data ?? []) {
      for (const last of group.lastTransactions ?? []) {
        if (!last.signedTransactionInfo) continue;
        const tx = verifyTransaction(last.signedTransactionInfo);
        await claimOriginalTransaction(tx.originalTransactionId ?? '', uid);
        const state = stateFromAppleStatus(last.status, tx);
        const active = await upsertAppleSubscription(uid, tx, state, 'CLIENT_VERIFY');
        isPremium = isPremium || active;
        matched++;
      }
    }

    if (matched === 0) return json(404, { error: 'subscription_not_found' });
    return json(200, { isPremium });
  } catch (error) {
    if (error instanceof OwnershipError) return json(409, { error: 'owned_by_other_account' });
    if (error instanceof AppleJwsError) return json(400, { error: 'invalid_signature' });
    if (error instanceof AppStoreApiError) {
      console.error('[verifyApplePurchase]', error.message);
      return json(error.status === 404 ? 404 : 502, { error: 'app_store_unavailable' });
    }
    console.error('[verifyApplePurchase] unexpected', error);
    return json(500, { error: 'internal' });
  }
};
