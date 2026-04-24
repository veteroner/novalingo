"use strict";
/**
 * Google Play Real-Time Developer Notifications (RTDN) — Webhook Handler
 *
 * Google sends Pub/Sub push messages to this endpoint when a subscription event occurs.
 *
 * Setup in Google Play Console:
 *  Development tools → Services & APIs → Real-time developer notifications
 *  Topic: projects/PROJECT_ID/topics/TOPIC_NAME
 *  Push subscription endpoint URL: https://REGION-PROJECT_ID.cloudfunctions.net/googleNotification
 *
 * USER LINKING:
 *  When the client purchases, we pass `applicationUsername = Firebase UID`.
 *  Google stores this as `obfuscatedExternalAccountId` in the purchase data.
 *  We also write a Firestore mapping (purchaseToken → uid) from the client via
 *  the `registerAndroidPurchase` callable so we can resolve the user here.
 *
 * Google subscriptionNotification types:
 *  1  SUBSCRIPTION_RECOVERED
 *  2  SUBSCRIPTION_RENEWED
 *  3  SUBSCRIPTION_CANCELED
 *  4  SUBSCRIPTION_PURCHASED
 *  5  SUBSCRIPTION_ON_HOLD
 *  6  SUBSCRIPTION_IN_GRACE_PERIOD
 *  7  SUBSCRIPTION_RESTARTED
 *  10 SUBSCRIPTION_REVOKED
 *  20 SUBSCRIPTION_EXPIRED
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleNotification = void 0;
const https_1 = require("firebase-functions/v2/https");
const entitlementService_1 = require("../services/subscriptions/entitlementService");
const googlePlay_1 = require("../services/subscriptions/googlePlay");
const admin_1 = require("../utils/admin");
const ACTIVE_TYPES = new Set([1, 2, 4, 6, 7]); // recovered, renewed, purchased, grace, restarted
const INACTIVE_TYPES = new Set([3, 5, 10, 20]); // canceled, on-hold, revoked, expired
function mapGoogleNotificationType(notificationType) {
    if (ACTIVE_TYPES.has(notificationType))
        return notificationType === 6 ? 'grace' : 'active';
    if (notificationType === 5)
        return 'billing_issue';
    if (notificationType === 10)
        return 'revoked';
    if (INACTIVE_TYPES.has(notificationType))
        return 'expired';
    return 'unknown';
}
exports.googleNotification = (0, https_1.onRequest)({ region: admin_1.REGION }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const body = req.body;
    const message = body.message;
    if (!message?.data) {
        // Malformed Pub/Sub message — acknowledge to avoid retry loop
        res.status(200).send('OK');
        return;
    }
    let notificationData;
    try {
        const decoded = Buffer.from(message.data, 'base64').toString('utf8');
        notificationData = JSON.parse(decoded);
    }
    catch {
        console.error('googleNotification: failed to decode Pub/Sub message');
        res.status(200).send('OK');
        return;
    }
    const sub = notificationData.subscriptionNotification;
    if (!sub) {
        // Could be a testNotification or oneTimeProductNotification — ignore
        res.status(200).send('OK');
        return;
    }
    const { notificationType, purchaseToken } = sub;
    if (!purchaseToken || notificationType === undefined) {
        res.status(200).send('OK');
        return;
    }
    // Look up the Firebase UID from the purchase token mapping written by the client
    // (via the registerAndroidPurchase callable when the purchase completed).
    const mappingSnap = await admin_1.db.doc(`purchaseTokens/${purchaseToken}`).get();
    const uid = mappingSnap.exists ? mappingSnap.data()?.uid : undefined;
    if (!uid) {
        // Token not registered yet — the client may not have called registerAndroidPurchase
        // (e.g. first-launch race condition). Log and move on; webhook may re-deliver.
        console.warn('googleNotification: no uid found for purchaseToken', {
            purchaseToken: purchaseToken.slice(0, 12) + '…', // don't log full token
            notificationType,
        });
        res.status(200).send('OK');
        return;
    }
    const productId = sub.subscriptionId;
    if (!productId) {
        res.status(200).send('OK');
        return;
    }
    const verification = await (0, googlePlay_1.verifyGoogleSubscriptionPurchase)({
        purchaseToken,
        productId,
    });
    await (0, entitlementService_1.upsertVerifiedSubscription)({
        uid: uid ?? verification.obfuscatedExternalAccountId ?? '',
        platform: 'google',
        externalId: purchaseToken,
        productId,
        state: verification.state === 'unknown'
            ? mapGoogleNotificationType(notificationType)
            : verification.state,
        isEntitlementActive: verification.isEntitlementActive,
        expiresAt: verification.expiresAt,
        autoRenewEnabled: verification.autoRenewEnabled,
        eventId: message.messageId ?? null,
        eventType: String(notificationType),
        raw: {
            packageName: notificationData.packageName ?? null,
            purchaseToken,
            notificationType,
            publisherState: verification.raw.subscriptionState ?? null,
        },
    });
    res.status(200).send('OK');
});
//# sourceMappingURL=googleNotification.js.map