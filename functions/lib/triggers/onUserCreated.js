"use strict";
/**
 * onUserCreated
 *
 * Firestore trigger: when a new user document is created.
 * Initializes default preferences, sends welcome notification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("../utils/admin");
exports.onUserCreated = (0, firestore_1.onDocumentCreated)({ document: 'users/{userId}', region: admin_1.REGION }, async (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();
    if (!userData)
        return;
    // Create default preferences document
    await admin_1.db.doc(`users/${userId}/preferences/default`).set({
        language: 'tr',
        theme: 'auto',
        soundEnabled: true,
        musicEnabled: true,
        hapticEnabled: true,
        notificationsEnabled: true,
        dailyReminderTime: '18:00',
        parentPin: null,
        createdAt: (0, admin_1.serverTimestamp)(),
    });
    // Create initial welcome quest
    const today = new Date().toISOString().split('T')[0];
    await admin_1.db.doc(`users/${userId}/quests/welcome_${today}`).set({
        type: 'lesson',
        title: 'İlk Adım',
        description: 'İlk dersini tamamla',
        targetProgress: 1,
        currentProgress: 0,
        reward: { type: 'gems', amount: 10 },
        claimed: false,
        expiresAt: null, // No expiry for welcome quest
        createdAt: (0, admin_1.serverTimestamp)(),
    });
    console.log(`User ${userId} initialized with defaults`);
});
//# sourceMappingURL=onUserCreated.js.map