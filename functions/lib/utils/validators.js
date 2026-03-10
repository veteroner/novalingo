"use strict";
/**
 * Input validation helpers for Cloud Functions.
 * Throws HttpsError on invalid input.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateString = validateString;
exports.validateAgeGroup = validateAgeGroup;
exports.validateTier = validateTier;
exports.validateId = validateId;
exports.validatePositiveInt = validatePositiveInt;
exports.validateActivities = validateActivities;
exports.validateVocabReviews = validateVocabReviews;
const https_1 = require("firebase-functions/v2/https");
const AGE_GROUPS = ['cubs', 'stars', 'legends'];
const LEAGUE_TIERS = ['bronze', 'silver', 'gold', 'diamond', 'master'];
/** Validate a trimmed string within length bounds */
function validateString(value, field, min, max) {
    if (typeof value !== 'string') {
        throw new https_1.HttpsError('invalid-argument', `${field} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
        throw new https_1.HttpsError('invalid-argument', `${field} must be ${min}-${max} characters`);
    }
    return trimmed;
}
/** Validate ageGroup enum */
function validateAgeGroup(value) {
    if (!AGE_GROUPS.includes(value)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid age group');
    }
    return value;
}
/** Validate league tier enum */
function validateTier(value) {
    if (value === undefined || value === null)
        return undefined;
    if (!LEAGUE_TIERS.includes(value)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid league tier');
    }
    return value;
}
/** Validate a required non-empty string ID */
function validateId(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new https_1.HttpsError('invalid-argument', `${field} is required`);
    }
    return value.trim();
}
/** Validate a positive integer within bounds */
function validatePositiveInt(value, field, max) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > max) {
        throw new https_1.HttpsError('invalid-argument', `${field} must be 1-${max}`);
    }
    return n;
}
/** Validate activities array from lesson submission */
function validateActivities(activities) {
    if (!Array.isArray(activities) || activities.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'activities must be a non-empty array');
    }
    if (activities.length > 50) {
        throw new https_1.HttpsError('invalid-argument', 'Too many activities (max 50)');
    }
    return activities.map((a, i) => {
        if (typeof a.activityId !== 'string') {
            throw new https_1.HttpsError('invalid-argument', `activities[${i}].activityId is required`);
        }
        return {
            activityId: a.activityId,
            correct: Boolean(a.correct),
            timeSpentMs: Math.max(0, Number(a.timeSpentMs) || 0),
            hintsUsed: Math.max(0, Math.floor(Number(a.hintsUsed) || 0)),
            attempts: Math.max(1, Math.floor(Number(a.attempts) || 1)),
        };
    });
}
/** Validate vocab review array */
function validateVocabReviews(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'reviews must be a non-empty array');
    }
    if (reviews.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'Too many reviews (max 100)');
    }
    return reviews.map((r, i) => {
        const wordId = validateId(r.wordId, `reviews[${i}].wordId`);
        const rating = Number(r.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new https_1.HttpsError('invalid-argument', `reviews[${i}].rating must be 1-5`);
        }
        return {
            wordId,
            rating: rating,
            responseTimeMs: Math.max(0, Number(r.responseTimeMs) || 0),
        };
    });
}
//# sourceMappingURL=validators.js.map