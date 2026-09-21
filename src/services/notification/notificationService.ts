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

    // Token'ı backend hedeflemesi için Firestore'a yaz.
    //
    // DİKKAT: @capacitor/push-notifications iOS'ta APNs cihaz token'ı döndürür,
    // Android'de (google-services.json varken) FCM kayıt token'ı döndürür.
    // Backend FCM ile gönderim yaptığı için sağlayıcıyı da yazıyoruz; APNs
    // token'ına FCM ile gönderim yapılamaz (bkz. docs/PUSH_SETUP.md).
    if (token && uid) {
      await updateDocument(docs.user(uid), {
        fcmToken: token,
        pushProvider: getPlatform() === 'ios' ? 'apns' : 'fcm',
        pushTokenUpdatedAt: new Date().toISOString(),
      });
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
  if (getPlatform() === 'web') return;

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
