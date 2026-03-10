"use strict";
/**
 * Processes vocabulary review results using the SRS engine.
 * Updates each word's SRS card in Firestore.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVocabulary = void 0;
const https_1 = require("firebase-functions/v2/https");
const srsEngine_1 = require("../services/srsEngine");
const admin_1 = require("../utils/admin");
const validators_1 = require("../utils/validators");
exports.updateVocabulary = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const data = request.data;
    const childId = (0, validators_1.validateId)(data.childId, 'childId');
    const reviews = (0, validators_1.validateVocabReviews)(data.reviews);
    await (0, admin_1.requireChildOwnership)(uid, childId);
    const today = (0, admin_1.getTodayTR)();
    const batch = admin_1.db.batch();
    const mastered = [];
    let updated = 0;
    for (const review of reviews) {
        const vocabRef = admin_1.db.doc(`children/${childId}/vocabulary/${review.wordId}`);
        const vocabDoc = await vocabRef.get();
        let card;
        if (vocabDoc.exists) {
            card = vocabDoc.data();
        }
        else {
            card = (0, srsEngine_1.createCard)(review.wordId, today);
        }
        const updatedCard = (0, srsEngine_1.reviewCard)(card, review.rating, today);
        batch.set(vocabRef, {
            ...updatedCard,
            lastReviewedAt: (0, admin_1.serverTimestamp)(),
            responseTimeMs: review.responseTimeMs,
        }, { merge: true });
        if (updatedCard.status === 'mastered' && card.status !== 'mastered') {
            mastered.push(review.wordId);
        }
        updated++;
    }
    // Update words learned count if new mastered words
    if (mastered.length > 0) {
        const childRef = admin_1.db.doc(`children/${childId}`);
        batch.update(childRef, {
            'stats.wordsLearned': (0, admin_1.increment)(mastered.length),
            updatedAt: (0, admin_1.serverTimestamp)(),
        });
    }
    await batch.commit();
    return { updated, mastered };
});
//# sourceMappingURL=updateVocabulary.js.map