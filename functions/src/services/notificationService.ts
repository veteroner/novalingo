/**
 * Notification Service
 *
 * Sends push notifications via Firebase Cloud Messaging.
 * Handles parent notifications for child achievements, weekly reports, etc.
 */

import { db, messaging } from '../utils/admin';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send a push notification to a parent by looking up their FCM token.
 * Silently returns false if the token is missing or send fails.
 */
export async function sendToParent(
  parentUid: string,
  payload: NotificationPayload,
): Promise<boolean> {
  try {
    const userDoc = await db.doc(`users/${parentUid}`).get();
    const fcmToken = userDoc.data()?.fcmToken;
    if (!fcmToken) return false;

    await messaging.send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });

    return true;
  } catch (err) {
    console.warn('Push notification failed:', err);
    return false;
  }
}

/**
 * Resolve a child's parentUid from the children collection.
 */
export async function getParentUidForChild(childId: string): Promise<string | null> {
  const doc = await db.doc(`children/${childId}`).get();
  return doc.data()?.parentUid ?? null;
}

/**
 * Send a notification to a child's parent about a child event.
 */
export async function notifyParentAboutChild(
  childId: string,
  payload: NotificationPayload,
): Promise<boolean> {
  const parentUid = await getParentUidForChild(childId);
  if (!parentUid) return false;
  return sendToParent(parentUid, payload);
}
