/**
 * onUserCreated
 *
 * Firestore trigger: when a new user document is created.
 * Initializes default preferences, sends welcome notification.
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db, REGION, serverTimestamp } from '../utils/admin';

export const onUserCreated = onDocumentCreated(
  { document: 'users/{userId}', region: REGION },
  async (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();

    if (!userData) return;

    // Create default preferences document
    await db.doc(`users/${userId}/preferences/default`).set({
      language: 'tr',
      theme: 'auto',
      soundEnabled: true,
      musicEnabled: true,
      hapticEnabled: true,
      notificationsEnabled: true,
      dailyReminderTime: '18:00',
      parentPin: null,
      createdAt: serverTimestamp(),
    });

    // Create initial welcome quest
    const today = new Date().toISOString().split('T')[0];
    await db.doc(`users/${userId}/quests/welcome_${today}`).set({
      type: 'lesson',
      title: 'İlk Adım',
      description: 'İlk dersini tamamla',
      targetProgress: 1,
      currentProgress: 0,
      reward: { type: 'gems', amount: 10 },
      claimed: false,
      expiresAt: null, // No expiry for welcome quest
      createdAt: serverTimestamp(),
    });

    console.log(`User ${userId} initialized with defaults`);
  }
);
