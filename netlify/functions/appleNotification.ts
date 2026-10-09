/**
 * Netlify Function — App Store Server Notifications V2.
 *
 * App Store Connect → App Information → App Store Server Notifications'a
 * (üretim ve sandbox) şu adres girilir:
 *   https://novalingo.teknovagroup.com/.netlify/functions/appleNotification
 *
 * Yenileme, iptal, iade ve süre bitişlerini `users/{uid}` projeksiyonuna yansıtır.
 * Kullanıcı, ilk doğrulamada yazılan `appleTransactions/{originalTransactionId}`
 * eşlemesinden bulunur. Yük Apple sertifika zinciriyle doğrulanır.
 */

import {
  findOwner,
  OwnershipError,
  upsertAppleSubscription,
  verifyTransaction,
  type SubscriptionState,
} from '../lib/appleEntitlement';
import { APPLE_BUNDLE_ID } from '../lib/appStoreServerApi';
import { AppleJwsError, verifyAppleSignedJws } from '../lib/appleJws';

interface NotificationPayload {
  notificationType?: string;
  subtype?: string;
  data?: {
    bundleId?: string;
    signedTransactionInfo?: string;
  };
}

/** Bildirim türünden durum; bilinmeyen/bilgilendirme türleri null (değişiklik yok). */
function stateFromNotification(
  type: string,
  subtype: string | undefined,
): SubscriptionState | null {
  switch (type) {
    case 'SUBSCRIBED':
    case 'DID_RENEW':
    case 'OFFER_REDEEMED':
      return 'active';
    case 'DID_FAIL_TO_RENEW':
      return subtype === 'GRACE_PERIOD' ? 'grace' : 'billing_issue';
    case 'GRACE_PERIOD_EXPIRED':
    case 'EXPIRED':
      return 'expired';
    case 'REFUND':
    case 'REVOKE':
      return 'revoked';
    // Otomatik yenilemenin kapatılması dönem sonuna kadar erişimi bozmaz.
    case 'DID_CHANGE_RENEWAL_STATUS':
    case 'DID_CHANGE_RENEWAL_PREF':
    case 'RENEWAL_EXTENDED':
      return 'active';
    default:
      return null;
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });

  try {
    const { signedPayload } = (await req.json()) as { signedPayload?: string };
    if (!signedPayload) return new Response('missing_payload', { status: 400 });

    const payload = verifyAppleSignedJws<NotificationPayload>(signedPayload);
    if (payload.data?.bundleId !== APPLE_BUNDLE_ID) return new Response('ignored', { status: 200 });

    const type = payload.notificationType ?? '';
    const state = stateFromNotification(type, payload.subtype);
    const signedTx = payload.data.signedTransactionInfo;
    if (!state || !signedTx) return new Response('ignored', { status: 200 });

    const tx = verifyTransaction(signedTx);
    const uid = await findOwner(tx.originalTransactionId ?? '');
    // Eşleme yoksa uygulama henüz doğrulamamıştır; ilk doğrulama durumu yazar.
    if (!uid) return new Response('no_owner', { status: 200 });

    await upsertAppleSubscription(uid, tx, state, type);
    return new Response('ok', { status: 200 });
  } catch (error) {
    if (error instanceof AppleJwsError || error instanceof OwnershipError) {
      return new Response('invalid', { status: 400 });
    }
    console.error('[appleNotification]', error);
    // 5xx → Apple bildirimi daha sonra yeniden dener.
    return new Response('error', { status: 500 });
  }
};
