/**
 * useAppInit
 *
 * Auth sonrası servisleri başlatır: offline sync, push notifications.
 * AppProviders'ta AuthProvider sonrasında çağrılır.
 */

import { initializeNotifications } from '@services/notification/notificationService';
import { startSyncManager, stopSyncManager } from '@services/offline/syncManager';
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
    void initializeNotifications(user.id);

    return () => {
      void stopSyncManager();
      initializedRef.current = false;
    };
  }, [user]);
}
