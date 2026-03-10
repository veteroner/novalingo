/**
 * Content Service
 *
 * İçerik yükleme ve cache yönetimi.
 * Firestore'dan dünya/ünite/ders verisini çeker, offline cache'te saklar.
 * Curriculum (in-memory) ile Firestore (remote) arasında köprü görevi görür.
 */

import { CACHE } from '@/config/constants';
import type { Lesson, Unit, World } from '@/types/content';
import {
  collections,
  docs,
  getDocument,
  orderBy,
  queryCollection,
} from '@services/firebase/firestore';
import { cacheContent, getCachedContent } from '@services/offline/offlineDB';

// ===== WORLDS =====

/**
 * Tüm dünyaları getir (cache → Firestore fallback).
 */
export async function getWorlds(): Promise<World[]> {
  // Try offline cache first
  const cached = await getCachedContent('all-worlds');
  if (cached) return cached as World[];

  const worlds = await queryCollection<World>(collections.worlds(), orderBy('order'));

  // Cache for offline
  await cacheContent('all-worlds', 'world', worlds, CACHE.CONTENT_TTL_MS / 60000);

  return worlds;
}

/**
 * Tek dünya getir.
 */
export async function getWorld(worldId: string): Promise<World | null> {
  const cacheKey = `world-${worldId}`;
  const cached = await getCachedContent(cacheKey);
  if (cached) return cached as World;

  const world = await getDocument<World>(docs.world(worldId));

  if (world) {
    await cacheContent(cacheKey, 'world', world, CACHE.CONTENT_TTL_MS / 60000);
  }

  return world;
}

// ===== UNITS =====

/**
 * Bir dünyanın ünitelerini getir.
 */
export async function getUnits(worldId: string): Promise<Unit[]> {
  const cacheKey = `units-${worldId}`;
  const cached = await getCachedContent(cacheKey);
  if (cached) return cached as Unit[];

  const units = await queryCollection<Unit>(collections.units(worldId), orderBy('order'));

  await cacheContent(cacheKey, 'unit', units, CACHE.CONTENT_TTL_MS / 60000);

  return units;
}

// ===== LESSONS =====

/**
 * Bir ünitenin derslerini getir.
 */
export async function getLessons(worldId: string, unitId: string): Promise<Lesson[]> {
  const cacheKey = `lessons-${worldId}-${unitId}`;
  const cached = await getCachedContent(cacheKey);
  if (cached) return cached as Lesson[];

  const lessons = await queryCollection<Lesson>(
    collections.lessons(worldId, unitId),
    orderBy('order'),
  );

  await cacheContent(cacheKey, 'lesson', lessons, CACHE.CONTENT_TTL_MS / 60000);

  return lessons;
}

/**
 * Tek ders getir.
 */
export async function getLesson(
  worldId: string,
  unitId: string,
  lessonId: string,
): Promise<Lesson | null> {
  const cacheKey = `lesson-${lessonId}`;
  const cached = await getCachedContent(cacheKey);
  if (cached) return cached as Lesson;

  const lesson = await getDocument<Lesson>(docs.lesson(worldId, unitId, lessonId));

  if (lesson) {
    await cacheContent(cacheKey, 'lesson', lesson, CACHE.CONTENT_TTL_MS / 60000);
  }

  return lesson;
}

// ===== PROGRESS HELPERS =====

/**
 * Çocuğun tamamladığı ders ID'lerini getir.
 */
export async function getCompletedLessonIds(childId: string): Promise<Set<string>> {
  const progress = await queryCollection<{ id: string; lessonId: string }>(
    collections.childLessonProgress(childId),
  );
  return new Set(progress.map((p) => p.lessonId));
}

/**
 * Bir dersin kilidi açık mı kontrol et.
 * İlk ders her zaman açık, sonrakiler önceki dersin tamamlanmasını gerektirir.
 */
export function isLessonUnlocked(
  lesson: Lesson,
  allLessons: Lesson[],
  completedIds: Set<string>,
): boolean {
  // İlk ders her zaman açık
  if (lesson.order === 0 || lesson.order === 1) return true;

  // Önceki dersi bul
  const previousLesson = allLessons.find((l) => l.order === lesson.order - 1);
  if (!previousLesson) return true; // önceki yoksa aç

  return completedIds.has(previousLesson.id);
}

// ===== CACHE MANAGEMENT =====

/**
 * Belirli bir dünya için tüm içerikleri önceden cache'le.
 * Offline oyun için kullanılır.
 */
export async function prefetchWorldContent(worldId: string): Promise<void> {
  const units = await getUnits(worldId);

  // Tüm ünitelerin derslerini paralel yükle
  await Promise.all(units.map((unit) => getLessons(worldId, unit.id)));
}
