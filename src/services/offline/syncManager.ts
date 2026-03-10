/**
 * Offline Sync Manager
 *
 * Çevrimdışıken biriken eylemleri ağ geldiğinde sunucuyla senkronize eder.
 */

import type { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { cloudFunctions } from '@services/firebase';
import { getPendingActions, incrementRetry, removeFromQueue } from './offlineDB';

let isSyncing = false;
let listenerHandle: PluginListenerHandle | null = null;

/**
 * Sync manager'ı başlat — ağ değişikliklerini dinler
 */
export function startSyncManager(): void {
  if (listenerHandle) return;

  void Network.addListener('networkStatusChange', (status) => {
    if (status.connected) {
      void syncPendingActions();
    }
  }).then((handle) => {
    listenerHandle = handle;
  });

  // İlk açılışta da dene
  void syncPendingActions();
}

/**
 * Sync manager'ı durdur — listener'ı temizle
 */
export async function stopSyncManager(): Promise<void> {
  if (listenerHandle) {
    await listenerHandle.remove();
    listenerHandle = null;
  }
}

/**
 * Bekleyen tüm eylemleri senkronize et
 */
export async function syncPendingActions(): Promise<void> {
  if (isSyncing) return;

  const networkStatus = await Network.getStatus();
  if (!networkStatus.connected) return;

  isSyncing = true;

  try {
    const actions = await getPendingActions();
    if (actions.length === 0) return;

    // Toplu gönder
    const payload = actions.map((a) => ({
      type: a.type,
      payload: JSON.parse(a.payload) as Record<string, unknown>,
      timestamp: a.createdAt,
    }));

    // İlk action'dan childId al
    const firstPayload = payload[0]?.payload;
    const childId = typeof firstPayload?.childId === 'string' ? firstPayload.childId : '';

    try {
      await cloudFunctions.syncOfflineProgress({
        childId,
        actions: payload,
      });

      // Başarılı olanları kuyruktan sil
      for (const action of actions) {
        await removeFromQueue(action.id);
      }
    } catch {
      // Başarısız olanların retry sayısını artır
      for (const action of actions) {
        await incrementRetry(action.id);
      }
    }
  } finally {
    isSyncing = false;
  }
}

/**
 * Bekleyen eylem sayısı
 */
export async function getPendingCount(): Promise<number> {
  const actions = await getPendingActions();
  return actions.length;
}
