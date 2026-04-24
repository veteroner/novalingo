"use strict";
/**
 * Register Android Purchase Token
 *
 * Called by the client immediately after a successful Google Play purchase
 * (in the store.when().finished() callback on Android).
 *
 * Writes a {purchaseToken → uid} mapping to Firestore so that the
 * googleNotification webhook can resolve which user to update when
 * Google sends subscription lifecycle events.
 *
 * The purchaseToken collection is separate from users/ so it can have
 * its own Firestore security rules (server-write only via Functions).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAndroidPurchase = void 0;
const https_1 = require("firebase-functions/v2/https");
const entitlementService_1 = require("../services/subscriptions/entitlementService");
const googlePlay_1 = require("../services/subscriptions/googlePlay");
const admin_1 = require("../utils/admin");
exports.registerAndroidPurchase = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { purchaseToken, productId } = request.data;
    if (typeof purchaseToken !== 'string' || purchaseToken.length < 10) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid purchaseToken');
    }
    if (typeof productId !== 'string' || !productId.startsWith('com.novalingo.')) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid productId');
    }
    // Store the mapping — googleNotification webhook reads from this collection
    await admin_1.db.doc(`purchaseTokens/${purchaseToken}`).set({
        uid,
        productId,
        registeredAt: (0, admin_1.serverTimestamp)(),
    });
    const verification = await (0, googlePlay_1.verifyGoogleSubscriptionPurchase)({
        purchaseToken,
        productId,
    });
    await (0, entitlementService_1.upsertVerifiedSubscription)({
        uid: verification.obfuscatedExternalAccountId ?? uid,
        platform: 'google',
        externalId: purchaseToken,
        productId,
        state: verification.state,
        isEntitlementActive: verification.isEntitlementActive,
        expiresAt: verification.expiresAt,
        autoRenewEnabled: verification.autoRenewEnabled,
        eventType: 'register_android_purchase',
        raw: {
            purchaseToken,
            productId,
            publisherState: verification.raw.subscriptionState ?? null,
        },
    });
    return {
        status: verification.isEntitlementActive ? 'active' : verification.state,
        expiresAt: verification.expiresAt?.toISOString() ?? null,
    };
});
//# sourceMappingURL=registerAndroidPurchase.js.map