"use strict";
/**
 * Notification Service
 *
 * Sends push notifications via Firebase Cloud Messaging.
 * Handles parent notifications for child achievements, weekly reports, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToParent = sendToParent;
exports.getParentUidForChild = getParentUidForChild;
exports.notifyParentAboutChild = notifyParentAboutChild;
const admin_1 = require("../utils/admin");
/**
 * Send a push notification to a parent by looking up their FCM token.
 * Silently returns false if the token is missing or send fails.
 */
async function sendToParent(parentUid, payload) {
    try {
        const userDoc = await admin_1.db.doc(`users/${parentUid}`).get();
        const fcmToken = userDoc.data()?.fcmToken;
        if (!fcmToken)
            return false;
        await admin_1.messaging.send({
            token: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
        });
        return true;
    }
    catch (err) {
        console.warn('Push notification failed:', err);
        return false;
    }
}
/**
 * Resolve a child's parentUid from the children collection.
 */
async function getParentUidForChild(childId) {
    const doc = await admin_1.db.doc(`children/${childId}`).get();
    return doc.data()?.parentUid ?? null;
}
/**
 * Send a notification to a child's parent about a child event.
 */
async function notifyParentAboutChild(childId, payload) {
    const parentUid = await getParentUidForChild(childId);
    if (!parentUid)
        return false;
    return sendToParent(parentUid, payload);
}
//# sourceMappingURL=notificationService.js.map