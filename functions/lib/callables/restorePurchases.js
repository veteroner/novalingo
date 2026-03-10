"use strict";
/**
 * restorePurchases
 *
 * Restores purchases for a user by querying RevenueCat subscriber info.
 * Used when a user switches devices or reinstalls the app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.restorePurchases = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';
exports.restorePurchases = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'restorePurchases', rateLimit_1.RATE_LIMITS.monetary);
    const { platform } = request.data;
    if (!platform || !['ios', 'android'].includes(platform)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid platform');
    }
    const apiKey = process.env.REVENUECAT_API_KEY;
    if (!apiKey) {
        console.error('REVENUECAT_API_KEY not configured');
        throw new https_1.HttpsError('internal', 'Payment service not configured');
    }
    try {
        // Get subscriber info from RevenueCat
        const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${encodeURIComponent(uid)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) {
                // No subscriber record — user never purchased
                return {
                    entitlements: [],
                    isPremium: false,
                    expiresAt: null,
                };
            }
            console.error('RevenueCat restore failed:', response.status);
            throw new https_1.HttpsError('internal', 'Restore failed');
        }
        const data = await response.json();
        const subscriberInfo = data.subscriber;
        // Extract active entitlements
        const activeEntitlements = Object.entries(subscriberInfo?.entitlements ?? {})
            .filter(([, value]) => {
            const ent = value;
            if (!ent.expires_date)
                return true; // lifetime
            return new Date(ent.expires_date).getTime() > Date.now();
        })
            .map(([key]) => key);
        const isPremium = activeEntitlements.includes('premium');
        const premiumEntitlement = subscriberInfo?.entitlements?.premium;
        const expiresAt = premiumEntitlement?.expires_date
            ? new Date(premiumEntitlement.expires_date).getTime()
            : null;
        // Update Firestore with restored entitlements
        await admin_1.db.doc(`users/${uid}`).set({
            subscription: {
                isPremium,
                entitlements: activeEntitlements,
                expiresAt,
                restoredAt: (0, admin_1.serverTimestamp)(),
                updatedAt: (0, admin_1.serverTimestamp)(),
            },
        }, { merge: true });
        return {
            entitlements: activeEntitlements,
            isPremium,
            expiresAt,
        };
    }
    catch (err) {
        if (err instanceof https_1.HttpsError)
            throw err;
        console.error('Restore purchases error:', err);
        throw new https_1.HttpsError('internal', 'Failed to restore purchases');
    }
});
//# sourceMappingURL=restorePurchases.js.map