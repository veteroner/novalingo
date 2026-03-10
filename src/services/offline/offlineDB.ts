/**
 * Offline Storage Service
 *
 * Dexie.js (IndexedDB) ile offline veri yönetimi.
 * Çevrimdışı ilerleme, kelime kartları ve kuyruk sistemi.
 */

import Dexie, { type EntityTable } from 'dexie';

// ===== DATABASE SCHEMA =====
interface OfflineLessonProgress {
  id: string;
  childId: string;
  lessonId: string;
  score: number;
  accuracy: number;
  durationSeconds: number;
  completedAt: number;
  synced: boolean;
}

interface OfflineVocabularyCard {
  id: string;
  childId: string;
  word: string;
  translation: string;
  imageUrl: string;
  audioUrl: string;
  nextReviewAt: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

interface OfflineSyncQueue {
  id: string;
  type: 'lessonComplete' | 'vocabularyReview' | 'questProgress' | 'currencyChange';
  payload: string; // JSON stringified
  createdAt: number;
  retryCount: number;
}

interface CachedContent {
  id: string;
  type: 'world' | 'unit' | 'lesson';
  data: string; // JSON stringified
  cachedAt: number;
  expiresAt: number;
}

// ===== DATABASE CLASS =====
class NovaLingoDB extends Dexie {
  progress!: EntityTable<OfflineLessonProgress, 'id'>;
  vocabulary!: EntityTable<OfflineVocabularyCard, 'id'>;
  syncQueue!: EntityTable<OfflineSyncQueue, 'id'>;
  cachedContent!: EntityTable<CachedContent, 'id'>;

  constructor() {
    super('NovaLingoDB');

    this.version(1).stores({
      progress: 'id, childId, lessonId, synced, completedAt',
      vocabulary: 'id, childId, nextReviewAt, [childId+nextReviewAt]',
      syncQueue: 'id, type, createdAt, retryCount',
      cachedContent: 'id, type, expiresAt',
    });
  }
}

// Singleton instance
export const offlineDB = new NovaLingoDB();

// ===== SYNC QUEUE OPERATIONS =====

/**
 * Sync kuyruğuna eylem ekle
 */
export async function enqueueAction(
  type: OfflineSyncQueue['type'],
  payload: Record<string, unknown>,
): Promise<void> {
  await offlineDB.syncQueue.add({
    id: crypto.randomUUID(),
    type,
    payload: JSON.stringify(payload),
    createdAt: Date.now(),
    retryCount: 0,
  });
}

/**
 * Bekleyen eylemleri getir
 */
export async function getPendingActions(): Promise<OfflineSyncQueue[]> {
  return offlineDB.syncQueue.where('retryCount').below(5).sortBy('createdAt');
}

/**
 * Başarılı sync sonrası sil
 */
export async function removeFromQueue(id: string): Promise<void> {
  await offlineDB.syncQueue.delete(id);
}

/**
 * Retry sayısını artır
 */
export async function incrementRetry(id: string): Promise<void> {
  const item = await offlineDB.syncQueue.get(id);
  if (!item) return;
  await offlineDB.syncQueue.update(id, {
    retryCount: item.retryCount + 1,
  });
}

// ===== CONTENT CACHE =====

/**
 * İçerik cache'le
 */
export async function cacheContent(
  id: string,
  type: CachedContent['type'],
  data: unknown,
  ttlMinutes = 60,
): Promise<void> {
  await offlineDB.cachedContent.put({
    id,
    type,
    data: JSON.stringify(data),
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  });
}

/**
 * Cache'den oku
 */
export async function getCachedContent<T>(id: string): Promise<T | null> {
  const item = await offlineDB.cachedContent.get(id);
  if (!item) return null;

  // Süresi dolmuşsa sil
  if (item.expiresAt < Date.now()) {
    await offlineDB.cachedContent.delete(id);
    return null;
  }

  return JSON.parse(item.data) as T;
}

/**
 * Süresi dolmuş cache'leri temizle
 */
export async function cleanExpiredCache(): Promise<number> {
  const expired = await offlineDB.cachedContent.where('expiresAt').below(Date.now()).toArray();
  await offlineDB.cachedContent.bulkDelete(expired.map((e) => e.id));
  return expired.length;
}
