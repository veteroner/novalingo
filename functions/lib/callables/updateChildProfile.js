"use strict";
/**
 * Updates an existing child profile's editable fields (name, avatarId).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChildProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const validators_1 = require("../utils/validators");
exports.updateChildProfile = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { childId, name, avatarId } = request.data;
    const validChildId = (0, validators_1.validateId)(childId, 'childId');
    await (0, admin_1.requireChildOwnership)(uid, validChildId);
    const updates = { updatedAt: (0, admin_1.serverTimestamp)() };
    if (name !== undefined) {
        updates.name = (0, validators_1.validateString)(name, 'name', 2, 20);
    }
    if (avatarId !== undefined) {
        if (typeof avatarId !== 'string' || avatarId.trim().length === 0) {
            throw new https_1.HttpsError('invalid-argument', 'avatarId must be a non-empty string');
        }
        updates.avatarId = avatarId.trim();
    }
    // At least one field must be provided
    if (Object.keys(updates).length <= 1) {
        throw new https_1.HttpsError('invalid-argument', 'No fields to update');
    }
    await admin_1.db.doc(`children/${validChildId}`).update(updates);
    return { childId: validChildId, updated: updates };
});
//# sourceMappingURL=updateChildProfile.js.map