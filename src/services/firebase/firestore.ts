/**
 * Firestore Database Service
 *
 * Collection referansları ve CRUD helpers.
 */

import * as Sentry from '@sentry/react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './app';

// ===== COLLECTION REFERENCES =====
export const collections = {
  users: () => collection(db, 'users'),
  children: () => collection(db, 'children'),
  childLessonProgress: (childId: string) => collection(db, 'children', childId, 'lessonProgress'),
  childVocabulary: (childId: string) => collection(db, 'children', childId, 'vocabulary'),
  childQuests: (childId: string) => collection(db, 'children', childId, 'quests'),
  childAchievements: (childId: string) => collection(db, 'children', childId, 'achievements'),
  childInventory: (childId: string) => collection(db, 'children', childId, 'inventory'),
  childDailySpins: (childId: string) => collection(db, 'children', childId, 'dailySpins'),
  childStats: (childId: string) => collection(db, 'children', childId, 'stats'),
  progress: () => collection(db, 'progress'),
  vocabulary: () => collection(db, 'vocabulary'),
  worlds: () => collection(db, 'worlds'),
  units: (worldId: string) => collection(db, 'worlds', worldId, 'units'),
  lessons: (worldId: string, unitId: string) =>
    collection(db, 'worlds', worldId, 'units', unitId, 'lessons'),
  leaderboards: () => collection(db, 'leaderboards'),
  leaderboardEntries: (leagueId: string) => collection(db, 'leaderboards', leagueId, 'entries'),
  shopItems: () => collection(db, 'shopItems'),
  collectibles: () => collection(db, 'collectibles'),
  childEventProgress: (childId: string) => collection(db, 'children', childId, 'eventProgress'),
  achievementsCatalog: () => collection(db, 'achievementsCatalog'),
  config: () => collection(db, 'config'),
} as const;

// ===== DOCUMENT REFERENCES =====
export const docs = {
  user: (userId: string) => doc(db, 'users', userId),
  child: (childId: string) => doc(db, 'children', childId),
  childLessonProgress: (childId: string, lessonId: string) =>
    doc(db, 'children', childId, 'lessonProgress', lessonId),
  world: (worldId: string) => doc(db, 'worlds', worldId),
  unit: (worldId: string, unitId: string) => doc(db, 'worlds', worldId, 'units', unitId),
  lesson: (worldId: string, unitId: string, lessonId: string) =>
    doc(db, 'worlds', worldId, 'units', unitId, 'lessons', lessonId),
  config: (configId: string) => doc(db, 'config', configId),
} as const;

// ===== GENERIC CRUD HELPERS =====

/**
 * Tek dokümân getir
 */
export async function getDocument<T>(ref: DocumentReference): Promise<T | null> {
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/**
 * Koleksiyon sorgula
 */
export async function queryCollection<T>(
  ref: CollectionReference,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

/**
 * Dokümân oluştur/üzerine yaz
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export async function setDocument<T extends DocumentData>(
  ref: DocumentReference,
  data: T,
  merge = false,
): Promise<void> {
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge });
}

/**
 * Dokümân güncelle (kısmi)
 */
export async function updateDocument(
  ref: DocumentReference,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Dokümân sil
 */
export async function removeDocument(ref: DocumentReference): Promise<void> {
  await deleteDoc(ref);
}

/**
 * Gerçek zamanlı dinleyici
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function subscribeToDocument<T>(
  ref: DocumentReference,
  callback: (data: T | null) => void,
): Unsubscribe {
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback({ id: snap.id, ...snap.data() } as T);
    },
    (error) => {
      if (import.meta.env.DEV)
        console.error('[subscribeToDocument] listener error:', ref.path, error);
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
        extra: { context: '[subscribeToDocument] listener error', path: ref.path },
      });
      callback(null);
    },
  );
}

/**
 * Gerçek zamanlı koleksiyon dinleyici
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function subscribeToCollection<T>(
  ref: CollectionReference,
  callback: (items: T[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const q = query(ref, ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
      callback(items);
    },
    (error) => {
      if (import.meta.env.DEV)
        console.error('[subscribeToCollection] listener error:', ref.path, error);
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
        extra: { context: '[subscribeToCollection] listener error', path: ref.path },
      });
      callback([]);
    },
  );
}

// Re-export query helpers for convenience
export { limit, orderBy, serverTimestamp, startAfter, where };
