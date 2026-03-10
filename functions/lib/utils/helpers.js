"use strict";
/**
 * Shared utility helpers for Cloud Functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekId = getWeekId;
exports.shuffle = shuffle;
exports.chunk = chunk;
exports.clamp = clamp;
/** Current week ID in YYYY-Wnn format */
function getWeekId(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86_400_000 + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}
/** Shuffle an array in-place (Fisher-Yates) and return it */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
/** Split an array into chunks of a given size */
function chunk(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}
/** Clamp a number between min and max */
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
//# sourceMappingURL=helpers.js.map