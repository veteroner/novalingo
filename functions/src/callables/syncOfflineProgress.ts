/**
 * syncOfflineProgress
 *
 * Receives batched offline actions and replays them server-side
 * in chronological order. Handles conflicts via last-write-wins.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  callableOpts,
  db,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';

interface OfflineAction {
  type: 'lessonComplete' | 'vocabularyReview' | 'questProgress' | 'currencyChange';
  payload: Record<string, unknown>;
  timestamp: number; // epoch ms
}

interface SyncRequest {
  childId: string;
  actions: OfflineAction[];
  lastSyncTimestamp: number;
}

export const syncOfflineProgress = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { childId, actions } = request.data as SyncRequest;

  if (!actions || actions.length === 0) {
    return { synced: 0 };
  }

  if (actions.length > 100) {
    throw new HttpsError('invalid-argument', 'Too many actions (max 100)');
  }

  await requireChildOwnership(uid, childId);

  // Sort by timestamp (oldest first)
  const sorted = [...actions].sort((a, b) => a.timestamp - b.timestamp);

  let synced = 0;
  let errors = 0;

  for (const action of sorted) {
    try {
      switch (action.type) {
        case 'lessonComplete': {
          const p = action.payload;
          const lessonId = typeof p.lessonId === 'string' ? p.lessonId : null;
          if (!lessonId) {
            errors++;
            break;
          }
          await db.doc(`children/${childId}/lessonProgress/${lessonId}`).set(
            {
              lessonId,
              stars: Math.min(Math.max(Number(p.stars) || 0, 0), 3),
              accuracy: Math.min(Math.max(Number(p.accuracy) || 0, 0), 1),
              xpEarned: Math.min(Math.max(Number(p.xpEarned) || 0, 0), 500),
              timeSpentMs: Math.min(Math.max(Number(p.timeSpentMs) || 0, 0), 600_000),
              syncedAt: serverTimestamp(),
              offlineSync: true,
            },
            { merge: true },
          );
          synced++;
          break;
        }

        case 'vocabularyReview': {
          const p = action.payload;
          const wordId = typeof p.wordId === 'string' ? p.wordId : null;
          if (!wordId) {
            errors++;
            break;
          }
          await db.doc(`children/${childId}/vocabulary/${wordId}`).set(
            {
              wordId,
              interval: Math.min(Math.max(Number(p.interval) || 1, 1), 365),
              easeFactor: Math.min(Math.max(Number(p.easeFactor) || 2.5, 1.3), 5),
              repetitions: Math.min(Math.max(Number(p.repetitions) || 0, 0), 100),
              nextReviewDate: typeof p.nextReviewDate === 'string' ? p.nextReviewDate : null,
              syncedAt: serverTimestamp(),
            },
            { merge: true },
          );
          synced++;
          break;
        }

        case 'questProgress': {
          const p = action.payload;
          const questId = typeof p.questId === 'string' ? p.questId : null;
          const progress = Math.min(Math.max(Number(p.progress) || 0, 0), 1000);
          if (!questId) {
            errors++;
            break;
          }
          await db.doc(`children/${childId}/quests/${questId}`).update({
            currentProgress: progress,
            updatedAt: serverTimestamp(),
          });
          synced++;
          break;
        }

        default:
          errors++;
      }
    } catch {
      errors++;
    }
  }

  return { synced, errors, total: actions.length };
});
