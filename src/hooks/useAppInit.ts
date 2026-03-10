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

    return () => {
      void stopSyncManager();
      initializedRef.current = false;
    };
  }, [user]);
}
