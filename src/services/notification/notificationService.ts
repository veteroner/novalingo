/**
 * Notification Service
 *
 * Push notification yönetimi (FCM via Capacitor).
 * COPPA uyumlu — çocuklara doğrudan bildirim gönderilmez.
 */

import { getPlatform } from '@/types/common';
import { PushNotifications } from '@capacitor/push-notifications';
import { docs, updateDocument } from '@services/firebase/firestore';

let initialized = false;

/**
 * Push bildirimlerini başlat ve FCM token'ı Firestore'a kaydet
 */
export async function initializeNotifications(uid?: string): Promise<string | null> {
  if (getPlatform() === 'web') {
    return null;
  }

  try {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      return null;
    }

    await PushNotifications.register();

    const token = await new Promise<string | null>((resolve) => {
      void PushNotifications.addListener('registration', (t) => {
        initialized = true;
        resolve(t.value);
      });

      void PushNotifications.addListener('registrationError', () => {
        resolve(null);
      });
    });

    // Persist FCM token to Firestore for backend notification targeting
    if (token && uid) {
      await updateDocument(docs.user(uid), { fcmToken: token });
    }

    return token;
  } catch {
    return null;
  }
}

/**
 * Bildirim dinleyicileri kur
 */
export function setupNotificationListeners(
  onNotification: (data: Record<string, unknown>) => void,
): void {
  // Uygulama açıkken gelen bildirim
  void PushNotifications.addListener('pushNotificationReceived', (notification) => {
    onNotification(notification.data as Record<string, unknown>);
  });

  // Bildirime tıklanınca
  void PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    onNotification(action.notification.data as Record<string, unknown>);
  });
}

/**
 * Badge sayısını temizle
 */
export async function clearBadge(): Promise<void> {
  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch {
    // Sessizce geç
  }
}

export function isNotificationInitialized(): boolean {
  return initialized;
}
