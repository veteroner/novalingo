"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleNotification = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
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
/**
 * Base64url-decode the payload portion of a JWS token.
 * Does NOT verify the signature (MVP-acceptable; add verification for production).
 */
function decodeJWSPayload(jws) {
    try {
        const parts = jws.split('.');
        if (parts.length !== 3)
            return null;
        // Node Buffer supports 'base64url' since v16
        return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    }
    catch {
        return null;
    }
}
exports.appleNotification = (0, https_1.onRequest)({ region: admin_1.REGION }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const body = req.body;
    const signedPayload = body.signedPayload;
    if (typeof signedPayload !== 'string') {
        res.status(400).send('Missing or invalid signedPayload');
        return;
    }
    // Decode outer JWS → notification envelope
    const notification = decodeJWSPayload(signedPayload);
    if (!notification) {
        res.status(400).send('Invalid signedPayload');
        return;
    }
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
    const transactionInfo = decodeJWSPayload(signedTransactionInfo);
    const uid = transactionInfo?.appAccountToken;
    // Without a UID we can't determine which user to update
    if (!uid) {
        console.warn('appleNotification: missing appAccountToken in transaction', {
            notificationType,
        });
        res.status(200).send('OK');
        return;
    }
    const isPremium = ACTIVE_NOTIFICATION_TYPES.has(notificationType);
    const isInactive = INACTIVE_NOTIFICATION_TYPES.has(notificationType);
    if (isPremium) {
        await admin_1.db.doc(`users/${uid}`).update({ isPremium: true });
    }
    else if (isInactive) {
        await admin_1.db.doc(`users/${uid}`).update({
            isPremium: false,
            premiumExpiresAt: new Date(),
        });
    }
    // Other notification types (e.g. DID_CHANGE_RENEWAL_STATUS) need no Firestore action
    res.status(200).send('OK');
});
//# sourceMappingURL=appleNotification.js.map