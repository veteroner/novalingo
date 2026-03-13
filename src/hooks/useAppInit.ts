/**
 * useAppInit
 *
 * Auth sonrası servisleri başlatır: offline sync, push notifications,
 * RevenueCat subscriptions, AdMob ads.
 * AppProviders'ta AuthProvider sonrasında çağrılır.
 */

import { initializeAdMob } from '@services/admob/admobService';
import { initializeNotifications } from '@services/notification/notificationService';
import { startSyncManager, stopSyncManager } from '@services/offline/syncManager';
import { initializeRevenueCat } from '@services/revenuecat/revenuecatService';
import { preloadKokoro } from '@services/speech/kokoroService';
import { useAuthStore } from '@stores/authStore';
import { useEffect, useRef } from 'react';

export function useAppInit(): void {
  const user = useAuthStore((s) => s.user);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    // Platform-agnostic services (safe to call on web — they no-op gracefully)
    startSyncManager();
    void initializeAdMob();
    void initializeNotifications(user.id);
    void initializeRevenueCat(user.id);

    // Preload Kokoro TTS model when browser is idle (non-blocking)
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        () => {
          preloadKokoro();
        },
        { timeout: 10_000 },
      );
    } else {
      setTimeout(() => {
        preloadKokoro();
      }, 5_000);
    }

    return () => {
      void stopSyncManager();
      initializedRef.current = false;
    };
  }, [user]);
}
