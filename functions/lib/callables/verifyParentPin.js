"use strict";
/**
 * Verifies the parent PIN for the parental gate.
 * Compares against stored hash — never returns the PIN itself.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyParentPin = void 0;
const crypto_1 = require("crypto");
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
exports.verifyParentPin = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'verifyParentPin', rateLimit_1.RATE_LIMITS.sensitive);
    const { pin } = request.data;
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
        throw new https_1.HttpsError('invalid-argument', 'PIN must be exactly 4 digits');
    }
    const userDoc = await admin_1.db.doc(`users/${uid}`).get();
    if (!userDoc.exists) {
        throw new https_1.HttpsError('not-found', 'User not found');
    }
    const settings = userDoc.data()?.settings;
    const storedHash = settings?.parentPinHash;
    const storedSalt = settings?.parentPinSalt;
    // If no PIN set, deny access (PIN must be set first)
    if (!storedHash || !storedSalt) {
        throw new https_1.HttpsError('failed-precondition', 'No PIN set. Please set a PIN first.');
    }
    const inputHash = (0, crypto_1.createHash)('sha256')
        .update(storedSalt + pin)
        .digest('hex');
    const valid = inputHash === storedHash;
    if (!valid) {
        throw new https_1.HttpsError('permission-denied', 'Incorrect PIN');
    }
    return { valid: true };
});
//# sourceMappingURL=verifyParentPin.js.map