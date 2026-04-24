/**
 * useAppInit
 *
 * Auth sonrası servisleri başlatır: offline sync, push notifications.
 * AppProviders'ta AuthProvider sonrasında çağrılır.
 */

import { trackRetentionDay } from '@services/analytics/analyticsService';
import {
  initializeNotifications,
  setupNotificationListeners,
} from '@services/notification/notificationService';
import { startSyncManager, stopSyncManager } from '@services/offline/syncManager';
import { initializeStore } from '@services/subscription/subscriptionService';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useEffect, useRef } from 'react';

export function useAppInit(): void {
  const user = useAuthStore((s) => s.user);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    // Platform-agnostic services (safe to call on web — they no-op gracefully)
    startSyncManager();
    void initializeNotifications(user.id);

    // Wire notification tap/receive handlers (native only — no-op on web via guard in service)
    setupNotificationListeners((data) => {
      // Deep-link routing from notification tap
      // Navigating here is not possible without router context; route is handled
      // by the screen that reads notification data from the store or query params.
      // The listener is still needed to keep Capacitor's listener registry active.
      if (import.meta.env.DEV) {
        console.log('[useAppInit] push notification received:', data);
      }
    });

    // Initialize native IAP subscriptions
    initializeStore();

    // ── Retention funnel: Day 1 / 3 / 7 / 14 / 30 ─────────────────
    const activeChild = useChildStore.getState().activeChild;
    if (activeChild?.createdAt && activeChild.completedLessons > 0) {
      const createdMs =
        typeof activeChild.createdAt.toMillis === 'function'
          ? activeChild.createdAt.toMillis()
          : Number(activeChild.createdAt);
      const daysSince = (Date.now() - createdMs) / 86_400_000;

      for (const day of [1, 3, 7, 14, 30]) {
        if (daysSince >= day && daysSince < day + 1) {
          const key = `retention_d${day}_${activeChild.id}`;
          if (!localStorage.getItem(key)) {
            trackRetentionDay(day, activeChild.id);
            localStorage.setItem(key, '1');
          }
        }
      }
    }

    return () => {
      void stopSyncManager();
      initializedRef.current = false;
    };
  }, [user]);
}
