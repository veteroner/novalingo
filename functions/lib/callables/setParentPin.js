"use strict";
/**
 * Sets or updates the parent's PIN code for the parental gate.
 * PIN is hashed with SHA-256 + random salt before storage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setParentPin = void 0;
const crypto_1 = require("crypto");
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
function hashPin(pin, salt) {
    return (0, crypto_1.createHash)('sha256')
        .update(salt + pin)
        .digest('hex');
}
exports.setParentPin = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'setParentPin', rateLimit_1.RATE_LIMITS.sensitive);
    const { pin, currentPin } = request.data;
    // Validate new PIN: exactly 4 digits
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
        throw new https_1.HttpsError('invalid-argument', 'PIN must be exactly 4 digits');
    }
    const userRef = admin_1.db.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        throw new https_1.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    const existingPin = userData.settings?.parentPinHash;
    const existingSalt = userData.settings?.parentPinSalt;
    // If PIN already set, require current PIN to change it
    if (existingPin && existingSalt) {
        if (!currentPin || typeof currentPin !== 'string') {
            throw new https_1.HttpsError('permission-denied', 'Current PIN required to change PIN');
        }
        const currentHash = hashPin(currentPin, existingSalt);
        if (currentHash !== existingPin) {
            throw new https_1.HttpsError('permission-denied', 'Current PIN is incorrect');
        }
    }
    // Generate new salt and hash
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const pinHash = hashPin(pin, salt);
    await userRef.update({
        'settings.parentPinHash': pinHash,
        'settings.parentPinSalt': salt,
        'settings.parentPin': pin.replace(/./g, '*'), // Store masked version for UI reference
        updatedAt: (0, admin_1.serverTimestamp)(),
    });
    return { success: true };
});
//# sourceMappingURL=setParentPin.js.map