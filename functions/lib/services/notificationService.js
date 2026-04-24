"use strict";
/**
 * Notification Service
 *
 * Sends push notifications via Firebase Cloud Messaging.
 * Handles parent notifications for child achievements, weekly reports, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentNotificationPrefs = getParentNotificationPrefs;
exports.sendToParent = sendToParent;
exports.getParentUidForChild = getParentUidForChild;
exports.notifyParentAboutChild = notifyParentAboutChild;
const admin_1 = require("../utils/admin");
const DEFAULT_PREFS = {
    dailyReminder: true,
    weeklyReport: true,
    achievementAlert: true,
    inactivityAlert: false,
};
/**
 * Returns the parent's notification preferences, merged with sane defaults.
 * Stored at `users/{parentUid}.settings.notifications`.
 */
async function getParentNotificationPrefs(parentUid) {
    const userDoc = await admin_1.db.doc(`users/${parentUid}`).get();
    const raw = (userDoc.data()?.settings?.notifications ?? {});
    return { ...DEFAULT_PREFS, ...raw };
}
/**
 * Send a push notification to a parent by looking up their FCM token.
 * Silently returns false if the token is missing, the parent has disabled
 * the given category, or send fails.
 */
async function sendToParent(parentUid, payload) {
    try {
        const userDoc = await admin_1.db.doc(`users/${parentUid}`).get();
        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;
        if (!fcmToken)
            return false;
        // Honor parent preferences when a category is supplied.
        if (payload.category) {
            const prefs = {
                ...DEFAULT_PREFS,
                ...(userData?.settings?.notifications ?? {}),
            };
            if (!prefs[payload.category])
                return false;
        }
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