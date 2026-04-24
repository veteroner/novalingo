"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshUserEntitlement = refreshUserEntitlement;
exports.upsertVerifiedSubscription = upsertVerifiedSubscription;
const admin_1 = require("../../utils/admin");
function makeSubscriptionDocumentId(platform, externalId) {
    return `${platform}_${Buffer.from(externalId, 'utf8').toString('base64url')}`;
}
function normalizeDate(value) {
    if (!value)
        return null;
    if (value instanceof Date)
        return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof value === 'object' &&
        value &&
        'toDate' in value &&
        typeof value.toDate === 'function') {
        const parsed = value.toDate();
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
}
function computeProjectedStatus(state, expiresAt, now) {
    if (state === 'active' || state === 'trial' || state === 'grace') {
        return !expiresAt || expiresAt.getTime() > now.getTime();
    }
    return false;
}
async function refreshUserEntitlement(uid) {
    const snap = await admin_1.db.collection(`users/${uid}/subscriptions`).get();
    const now = new Date();
    let bestActive;
    for (const doc of snap.docs) {
        const data = doc.data();
        const state = data.state ?? 'unknown';
        const platform = data.platform ?? 'apple';
        const productId = data.productId ?? '';
        const expiresAt = normalizeDate(data.expiresAt);
        const isActive = computeProjectedStatus(state, expiresAt, now);
        if (!isActive)
            continue;
        if (!bestActive) {
            bestActive = { state, expiresAt, platform, productId };
            continue;
        }
        const bestExpiryMs = bestActive.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const currentExpiryMs = expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        if (currentExpiryMs > bestExpiryMs) {
            bestActive = { state, expiresAt, platform, productId };
        }
    }
    await admin_1.db.doc(`users/${uid}`).set({
        isPremium: Boolean(bestActive),
        premiumExpiresAt: bestActive?.expiresAt ?? null,
        subscriptionState: bestActive?.state ?? 'expired',
        subscriptionPlatform: bestActive?.platform ?? null,
        subscriptionProductId: bestActive?.productId ?? null,
        entitlementUpdatedAt: (0, admin_1.serverTimestamp)(),
    }, { merge: true });
}
async function upsertVerifiedSubscription(update) {
    const docId = makeSubscriptionDocumentId(update.platform, update.externalId);
    const verifiedAt = update.verifiedAt ?? new Date();
    await admin_1.db.doc(`users/${update.uid}/subscriptions/${docId}`).set({
        uid: update.uid,
        platform: update.platform,
        externalId: update.externalId,
        productId: update.productId,
        state: update.state,
        isEntitlementActive: update.isEntitlementActive,
        expiresAt: update.expiresAt ?? null,
        originalTransactionId: update.originalTransactionId ?? null,
        trialEndsAt: update.trialEndsAt ?? null,
        autoRenewEnabled: update.autoRenewEnabled ?? null,
        lastEventId: update.eventId ?? null,
        lastEventType: update.eventType ?? null,
        lastVerifiedAt: verifiedAt,
        raw: update.raw ?? null,
        updatedAt: (0, admin_1.serverTimestamp)(),
    }, { merge: true });
    await refreshUserEntitlement(update.uid);
}
//# sourceMappingURL=entitlementService.js.map