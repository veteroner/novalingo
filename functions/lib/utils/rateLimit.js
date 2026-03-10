"use strict";
/**
 * Rate Limiter — Firestore-backed per-user rate limiting.
 *
 * Tracks call counts per user per function within a sliding window.
 * Uses a dedicated `rateLimits` collection to avoid polluting business data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = void 0;
exports.checkRateLimit = checkRateLimit;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("./admin");
/** Default rate limit presets */
exports.RATE_LIMITS = {
    /** Sensitive operations: PIN, delete, auth — 5 calls / 5 min */
    sensitive: { maxCalls: 5, windowSeconds: 300 },
    /** Write operations: lesson submit, purchase — 20 calls / min */
    write: { maxCalls: 20, windowSeconds: 60 },
    /** Read operations: leaderboard, profile — 60 calls / min */
    read: { maxCalls: 60, windowSeconds: 60 },
    /** Monetary operations: receipt, restore — 10 calls / 5 min */
    monetary: { maxCalls: 10, windowSeconds: 300 },
};
/**
 * Check and increment rate limit for a user + function combo.
 * Throws RESOURCE_EXHAUSTED if limit is exceeded.
 */
async function checkRateLimit(uid, functionName, config) {
    const docId = `${uid}_${functionName}`;
    const ref = admin_1.db.collection('rateLimits').doc(docId);
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;
    await admin_1.db.runTransaction(async (tx) => {
        const doc = await tx.get(ref);
        const data = doc.data();
        // Filter to only calls within the window
        const recentCalls = (data?.calls ?? []).filter((t) => t > windowStart);
        if (recentCalls.length >= config.maxCalls) {
            throw new https_1.HttpsError('resource-exhausted', `Rate limit exceeded. Try again later.`);
        }
        // Add current call timestamp, keep only recent ones
        recentCalls.push(now);
        tx.set(ref, { calls: recentCalls, updatedAt: now }, { merge: true });
    });
}
//# sourceMappingURL=rateLimit.js.map