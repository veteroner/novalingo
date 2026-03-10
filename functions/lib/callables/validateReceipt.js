"use strict";
/**
 * validateReceipt
 *
 * Validates a purchase receipt via RevenueCat REST API.
 * Updates Firestore entitlements upon successful validation.
 *
 * Security: Receipt validation is ALWAYS server-side — never trust client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReceipt = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
// RevenueCat API endpoint
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';
// Product → entitlement mapping
const SUBSCRIPTION_PRODUCTS = new Set([
    'novalingo_premium_monthly',
    'novalingo_premium_yearly',
    'novalingo_family_yearly',
]);
const GEM_PRODUCTS = {
    novalingo_gems_100: 100,
    novalingo_gems_500: 550, // 10% bonus
    novalingo_gems_1200: 1440, // 20% bonus
    novalingo_gems_3000: 3900, // 30% bonus
};
exports.validateReceipt = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'validateReceipt', rateLimit_1.RATE_LIMITS.monetary);
    const { platform, receipt, productId } = request.data;
    // Input validation
    if (!platform || !['ios', 'android'].includes(platform)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid platform');
    }
    if (!receipt || typeof receipt !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Receipt is required');
    }
    if (!productId || typeof productId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Product ID is required');
    }
    // Get RevenueCat API key from environment
    const apiKey = process.env.REVENUECAT_API_KEY;
    if (!apiKey) {
        console.error('REVENUECAT_API_KEY not configured');
        throw new https_1.HttpsError('internal', 'Payment service not configured');
    }
    try {
        // Post receipt to RevenueCat for validation
        const fetchBody = {
            app_user_id: uid,
            product_id: productId,
        };
        if (platform === 'ios') {
            fetchBody.fetch_token = receipt;
        }
        else {
            fetchBody.product_id = productId;
            fetchBody.token = receipt;
        }
        const response = await fetch(`${REVENUECAT_API_URL}/receipts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'X-Platform': platform,
            },
            body: JSON.stringify(fetchBody),
        });
        if (!response.ok) {
            console.error('RevenueCat validation failed:', response.status);
            throw new https_1.HttpsError('internal', 'Receipt validation failed');
        }
        const data = await response.json();
        const subscriberInfo = data.subscriber;
        // Check entitlements
        const entitlements = Object.keys(subscriberInfo?.entitlements ?? {});
        const isPremium = entitlements.includes('premium');
        const premiumEntitlement = subscriberInfo?.entitlements?.premium;
        const expiresAt = premiumEntitlement?.expires_date
            ? new Date(premiumEntitlement.expires_date).getTime()
            : null;
        // Update Firestore with entitlement status
        const userRef = admin_1.db.doc(`users/${uid}`);
        const updateData = {
            'subscription.entitlements': entitlements,
            'subscription.updatedAt': (0, admin_1.serverTimestamp)(),
        };
        if (SUBSCRIPTION_PRODUCTS.has(productId)) {
            updateData['subscription.isPremium'] = isPremium;
            updateData['subscription.productId'] = productId;
            updateData['subscription.expiresAt'] = expiresAt;
            // Record purchase
            await admin_1.db.collection(`users/${uid}/purchases`).add({
                type: 'subscription',
                productId,
                platform,
                validatedAt: (0, admin_1.serverTimestamp)(),
                expiresAt,
            });
        }
        else if (productId in GEM_PRODUCTS) {
            // Consumable — grant gems
            const gemsToGrant = GEM_PRODUCTS[productId];
            // Find a child to grant gems to — use the first active child
            const childrenSnap = await admin_1.db
                .collection('children')
                .where('parentUid', '==', uid)
                .limit(1)
                .get();
            if (!childrenSnap.empty) {
                const childRef = childrenSnap.docs[0].ref;
                await childRef.update({
                    'currency.gems': (childrenSnap.docs[0].data().currency?.gems ?? 0) + gemsToGrant,
                    updatedAt: (0, admin_1.serverTimestamp)(),
                });
            }
            // Record purchase
            await admin_1.db.collection(`users/${uid}/purchases`).add({
                type: 'consumable',
                productId,
                platform,
                gemsGranted: gemsToGrant,
                validatedAt: (0, admin_1.serverTimestamp)(),
            });
        }
        await userRef.set(updateData, { merge: true });
        return {
            valid: true,
            entitlements,
            expiresAt,
            productId,
        };
    }
    catch (err) {
        if (err instanceof https_1.HttpsError)
            throw err;
        console.error('Receipt validation error:', err);
        throw new https_1.HttpsError('internal', 'Receipt validation failed');
    }
});
//# sourceMappingURL=validateReceipt.js.map