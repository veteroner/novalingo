"use strict";
/**
 * SRS (Spaced Repetition System) Engine
 *
 * Modified SM-2 algorithm, simplified for children.
 * Manages vocabulary review intervals and mastery tracking.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCard = createCard;
exports.reviewCard = reviewCard;
exports.getDueCards = getDueCards;
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MASTERED_REPS = 6;
const MASTERED_INTERVAL = 30;
/** Create a brand-new SRS card for a word */
function createCard(wordId, today) {
    return {
        wordId,
        easeFactor: DEFAULT_EASE,
        interval: 0,
        repetitions: 0,
        nextReviewDate: today,
        status: 'learning',
    };
}
/** Process a review rating (1-5) and return the updated card */
function reviewCard(card, rating, today) {
    let { easeFactor, interval, repetitions } = card;
    if (rating < 3) {
        // Forgot — reset
        repetitions = 0;
        interval = 1;
    }
    else {
        repetitions += 1;
        if (repetitions === 1) {
            interval = 1;
        }
        else if (repetitions === 2) {
            interval = 3;
        }
        else if (repetitions === 3) {
            interval = 7;
        }
        else {
            interval = Math.round(interval * easeFactor);
        }
        // Update ease factor (SM-2 formula)
        easeFactor = Math.max(MIN_EASE, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
    }
    const status = repetitions >= MASTERED_REPS && interval > MASTERED_INTERVAL
        ? 'mastered'
        : repetitions > 0
            ? 'reviewing'
            : 'learning';
    const nextDate = addDays(today, interval);
    return {
        wordId: card.wordId,
        easeFactor,
        interval,
        repetitions,
        nextReviewDate: nextDate,
        status,
    };
}
/** Get all cards due for review on a given date */
function getDueCards(cards, today) {
    return cards.filter((c) => c.nextReviewDate <= today && c.status !== 'mastered');
}
/** Helper: add days to a YYYY-MM-DD string */
function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}
//# sourceMappingURL=srsEngine.js.map