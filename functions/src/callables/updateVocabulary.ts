/**
 * Processes vocabulary review results using the SRS engine.
 * Updates each word's SRS card in Firestore.
 */

import { onCall } from 'firebase-functions/v2/https';
import { createCard, reviewCard, type SRSCard } from '../services/srsEngine';
import {
  callableOpts,
  db,
  getTodayTR,
  increment,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';
import { validateId, validateVocabReviews } from '../utils/validators';

export const updateVocabulary = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const data = request.data as { childId: string; reviews: unknown };
  const childId = validateId(data.childId, 'childId');
  const reviews = validateVocabReviews(data.reviews);

  await requireChildOwnership(uid, childId);

  const today = getTodayTR();
  const batch = db.batch();
  const mastered: string[] = [];
  let updated = 0;

  for (const review of reviews) {
    const vocabRef = db.doc(`children/${childId}/vocabulary/${review.wordId}`);
    const vocabDoc = await vocabRef.get();

    let card: SRSCard;
    if (vocabDoc.exists) {
      card = vocabDoc.data() as SRSCard;
    } else {
      card = createCard(review.wordId, today);
    }

    const updatedCard = reviewCard(card, review.rating, today);

    batch.set(
      vocabRef,
      {
        ...updatedCard,
        lastReviewedAt: serverTimestamp(),
        responseTimeMs: review.responseTimeMs,
      },
      { merge: true },
    );

    if (updatedCard.status === 'mastered' && card.status !== 'mastered') {
      mastered.push(review.wordId);
    }
    updated++;
  }

  // Update words learned count if new mastered words
  if (mastered.length > 0) {
    const childRef = db.doc(`children/${childId}`);
    batch.update(childRef, {
      'stats.wordsLearned': increment(mastered.length),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();

  return { updated, mastered };
});
