/**
 * useNetworkStatus Hook
 *
 * Çevrimiçi/çevrimdışı durum takibi.
 */

import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

interface NetworkInfo {
  connected: boolean;
  connectionType: string;
}

export function useNetworkStatus(): NetworkInfo {
  const [status, setStatus] = useState<NetworkInfo>({
    connected: navigator.onLine,
    connectionType: 'unknown',
  });

  useEffect(() => {
    // İlk durumu al
    Network.getStatus()
      .then((s) => {
        setStatus({ connected: s.connected, connectionType: s.connectionType });
      })
      .catch(() => {
        // Capacitor yoksa browser API kullan
      });

    // Değişiklikleri dinle
    const handler = Network.addListener('networkStatusChange', (s) => {
      setStatus({ connected: s.connected, connectionType: s.connectionType });
    });

    // Fallback: browser events
    const onOnline = () => {
      setStatus((prev) => ({ ...prev, connected: true }));
    };
    const onOffline = () => {
      setStatus((prev) => ({ ...prev, connected: false }));
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      handler.then((h) => h.remove()).catch(() => {});
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return status;
}
