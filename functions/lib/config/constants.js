"use strict";
/**
 * Backend Constants
 *
 * Mirrors frontend src/config/constants.ts — single source of truth
 * for XP, currency, lesson, and streak configuration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_REWARDS = exports.NOVA_STAGES = exports.LESSON = exports.CURRENCY = exports.XP = void 0;
exports.XP = {
    BASE_PER_ACTIVITY: 10,
    PERFECT_MULTIPLIER: 1.5,
    SPEED_BONUS_THRESHOLD: 0.7,
    SPEED_MULTIPLIER: 1.2,
    STREAK_BONUS_PER_DAY: 0.05,
    STREAK_BONUS_MAX: 0.5,
    FIRST_TRY_BONUS: 5,
    NO_HINT_BONUS: 3,
};
exports.CURRENCY = {
    STARS_PER_LESSON: 5,
    STARS_PERFECT_BONUS: 10,
};
exports.LESSON = {
    STAR_THRESHOLDS: [0.6, 0.8, 1.0],
    TIME_PER_ACTIVITY_SEC: 30,
    PERFECT_ACCURACY: 1.0,
};
exports.NOVA_STAGES = [
    { stage: 'egg', minXP: 0 },
    { stage: 'baby', minXP: 200 },
    { stage: 'child', minXP: 1000 },
    { stage: 'teen', minXP: 3000 },
    { stage: 'adult', minXP: 8000 },
    { stage: 'legendary', minXP: 20000 },
];
exports.LEVEL_REWARDS = {
    STARS_PER_LEVEL: 10,
    GEMS_MILESTONE_INTERVAL: 5,
    GEMS_MULTIPLIER: 2,
};
//# sourceMappingURL=constants.js.map