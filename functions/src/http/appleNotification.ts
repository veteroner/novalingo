/**
 * Apple App Store Server Notifications v2 — Webhook Handler
 *
 * Apple sends a POST request to this endpoint when a subscription event occurs
 * (purchase, renewal, cancellation, expiration, etc.).
 *
 * Configure this URL in App Store Connect:
 *   App → App Store → Subscriptions → App Store Server Notifications
 *   Production URL: https://REGION-PROJECT_ID.cloudfunctions.net/appleNotification
 *
 * SECURITY NOTE:
 *  Apple signs the payload as a JWS (JSON Web Signature). Full signature
 *  verification requires Apple's root certificate chain. For MVP we decode the
 *  payload without verifying the signature. Add signature verification before
 *  processing financial events in production.
 *
 * USER LINKING:
 *  When the client purchases, we pass `applicationUsername = Firebase UID`.
 *  Apple stores this as `appAccountToken` inside the signed transaction info.
 *  We extract it here to update the correct Firestore user document.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { verifyAppleSignedJws } from '../services/subscriptions/appleJws';
import {
  upsertVerifiedSubscription,
  type SubscriptionState,
} from '../services/subscriptions/entitlementService';
import { REGION } from '../utils/admin';

// Apple notification types where the subscription is (or becomes) active
const ACTIVE_NOTIFICATION_TYPES = new Set([
  'SUBSCRIBED',
  'DID_RENEW',
  'OFFER_REDEEMED',
  'GRACE_PERIOD',
]);

// Apple notification types where the subscription ends
const INACTIVE_NOTIFICATION_TYPES = new Set([
  'EXPIRED',
  'REVOKE',
  'GRACE_PERIOD_EXPIRED',
  'REFUND',
]);

interface AppleNotificationPayload {
  notificationType?: string;
  notificationUUID?: string;
  data?: {
    signedTransactionInfo?: string;
  };
}

interface AppleTransactionInfo {
  appAccountToken?: string;
  productId?: string;
  transactionId?: string;
  originalTransactionId?: string;
  expiresDate?: number | string;
  offerType?: number;
}

function mapAppleNotificationType(notificationType: string): SubscriptionState {
  if (ACTIVE_NOTIFICATION_TYPES.has(notificationType)) return 'active';
  if (notificationType === 'OFFER_REDEEMED') return 'trial';
  if (notificationType === 'GRACE_PERIOD') return 'grace';
  if (notificationType === 'DID_FAIL_TO_RENEW') return 'billing_issue';
  if (notificationType === 'REFUND') return 'refunded';
  if (notificationType === 'REVOKE') return 'revoked';
  if (INACTIVE_NOTIFICATION_TYPES.has(notificationType)) return 'expired';
  return 'unknown';
}

export const appleNotification = onRequest({ region: REGION }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const body = req.body as Record<string, unknown>;
  const signedPayload = body.signedPayload;

  if (typeof signedPayload !== 'string') {
    res.status(400).send('Missing or invalid signedPayload');
    return;
  }

  const notification = verifyAppleSignedJws<AppleNotificationPayload>(signedPayload);

  const notificationType = notification.notificationType;
  const data = notification.data;

  if (!notificationType || !data) {
    // Acknowledge unknown notification types gracefully so Apple doesn't retry
    res.status(200).send('OK');
    return;
  }

  // Decode inner JWS → transaction details (contains appAccountToken = Firebase UID)
  const signedTransactionInfo = data.signedTransactionInfo;
  if (!signedTransactionInfo) {
    res.status(200).send('OK');
    return;
  }

  const transactionInfo = verifyAppleSignedJws<AppleTransactionInfo>(signedTransactionInfo);
  const uid = transactionInfo.appAccountToken;

  // Without a UID we can't determine which user to update
  if (!uid) {
    console.warn('appleNotification: missing appAccountToken in transaction', {
      notificationType,
    });
    res.status(200).send('OK');
    return;
  }

  const productId = transactionInfo.productId;
  const externalId = transactionInfo.originalTransactionId ?? transactionInfo.transactionId;

  if (!productId || !externalId) {
    console.warn('appleNotification: missing product or transaction identifiers', {
      notificationType,
      uid,
    });
    res.status(200).send('OK');
    return;
  }

  const expiresAt = transactionInfo.expiresDate ? new Date(transactionInfo.expiresDate) : null;
  const state = mapAppleNotificationType(notificationType);
  await upsertVerifiedSubscription({
    uid,
    platform: 'apple',
    externalId,
    originalTransactionId: transactionInfo.originalTransactionId ?? transactionInfo.transactionId,
    productId,
    state,
    isEntitlementActive: state === 'active' || state === 'trial' || state === 'grace',
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    eventId: notification.notificationUUID ?? null,
    eventType: notificationType,
    raw: {
      notificationType,
      transactionId: transactionInfo.transactionId,
      originalTransactionId: transactionInfo.originalTransactionId,
      offerType: transactionInfo.offerType ?? null,
    },
  });

  res.status(200).send('OK');
});
