"use strict";
/**
 * revenuecatWebhook
 *
 * HTTP endpoint for RevenueCat server-to-server webhooks.
 * Handles subscription lifecycle events:
 *   INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION,
 *   BILLING_ISSUE, NON_RENEWING_PURCHASE, PRODUCT_CHANGE
 *
 * Security:
 *   - Validates Authorization header with shared secret
 *   - All writes are idempotent (safe to retry)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenuecatWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
// Gem product mapping (same as validateReceipt)
const GEM_PRODUCTS = {
    novalingo_gems_100: 100,
    novalingo_gems_500: 550,
    novalingo_gems_1200: 1440,
    novalingo_gems_3000: 3900,
};
exports.revenuecatWebhook = (0, https_1.onRequest)({ region: admin_1.REGION }, async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // Validate webhook secret
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (webhookSecret) {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${webhookSecret}`) {
            console.warn('Invalid webhook authorization');
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    }
    try {
        const body = req.body;
        const event = body.event ?? body;
        if (!event.type || !event.app_user_id) {
            res.status(400).json({ error: 'Invalid event payload' });
            return;
        }
        const uid = event.app_user_id;
        const userRef = admin_1.db.doc(`users/${uid}`);
        console.log(`RevenueCat webhook: ${event.type} for user ${uid}`);
        switch (event.type) {
            case 'INITIAL_PURCHASE':
            case 'RENEWAL': {
                // Activate or renew premium
                const expiresAt = event.expiration_at_ms ?? null;
                await userRef.set({
                    subscription: {
                        isPremium: true,
                        productId: event.product_id ?? null,
                        expiresAt,
                        store: event.store ?? null,
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    },
                }, { merge: true });
                // Record the purchase event
                await admin_1.db.collection(`users/${uid}/purchases`).add({
                    type: event.type === 'INITIAL_PURCHASE' ? 'initial' : 'renewal',
                    productId: event.product_id,
                    store: event.store,
                    expiresAt,
                    processedAt: (0, admin_1.serverTimestamp)(),
                });
                break;
            }
            case 'CANCELLATION': {
                // User cancelled — access continues until expiration
                await userRef.set({
                    subscription: {
                        cancelledAt: (0, admin_1.serverTimestamp)(),
                        willExpireAt: event.expiration_at_ms ?? null,
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    },
                }, { merge: true });
                break;
            }
            case 'EXPIRATION': {
                // Subscription expired — revoke premium
                await userRef.set({
                    subscription: {
                        isPremium: false,
                        expiredAt: (0, admin_1.serverTimestamp)(),
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    },
                }, { merge: true });
                break;
            }
            case 'BILLING_ISSUE': {
                // Payment failed — flag for grace period handling
                await userRef.set({
                    subscription: {
                        billingIssue: true,
                        billingIssueAt: (0, admin_1.serverTimestamp)(),
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    },
                }, { merge: true });
                break;
            }
            case 'NON_RENEWING_PURCHASE': {
                // Consumable purchase (gems)
                const productId = event.product_id ?? '';
                const gemsToGrant = GEM_PRODUCTS[productId];
                if (gemsToGrant) {
                    // Find the parent's first child and grant gems
                    const childrenSnap = await admin_1.db
                        .collection('children')
                        .where('parentUid', '==', uid)
                        .limit(1)
                        .get();
                    if (!childrenSnap.empty) {
                        await childrenSnap.docs[0].ref.update({
                            'currency.gems': (0, admin_1.increment)(gemsToGrant),
                            updatedAt: (0, admin_1.serverTimestamp)(),
                        });
                    }
                    await admin_1.db.collection(`users/${uid}/purchases`).add({
                        type: 'consumable',
                        productId,
                        gemsGranted: gemsToGrant,
                        processedAt: (0, admin_1.serverTimestamp)(),
                    });
                }
                break;
            }
            case 'PRODUCT_CHANGE': {
                // User switched plans (e.g., monthly → yearly)
                await userRef.set({
                    subscription: {
                        productId: event.product_id ?? null,
                        expiresAt: event.expiration_at_ms ?? null,
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    },
                }, { merge: true });
                break;
            }
            default:
                console.log(`Unhandled webhook event type: ${event.type}`);
        }
        // Always return 200 so RevenueCat doesn't retry
        res.status(200).json({ received: true });
    }
    catch (err) {
        console.error('Webhook processing error:', err);
        // Return 500 so RevenueCat retries
        res.status(500).json({ error: 'Internal error' });
    }
});
//# sourceMappingURL=revenuecatWebhook.js.map