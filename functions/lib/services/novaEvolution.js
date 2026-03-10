"use strict";
/**
 * Nova Evolution Service
 *
 * Manages the Nova mascot's growth stages.
 * Stages: egg → baby → child → teen → adult → legendary
 *
 * Evolution is driven by total XP milestones.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOVA_STAGES = void 0;
exports.getNovaStage = getNovaStage;
exports.checkEvolution = checkEvolution;
exports.xpToNextStage = xpToNextStage;
exports.getNovaMood = getNovaMood;
exports.NOVA_STAGES = ['egg', 'baby', 'child', 'teen', 'adult', 'legendary'];
/** XP thresholds for each evolution stage */
const STAGE_THRESHOLDS = {
    egg: 0,
    baby: 200, // ~4 lessons
    child: 1_000, // ~20 lessons
    teen: 3_000, // ~60 lessons
    adult: 8_000, // ~160 lessons
    legendary: 20_000, // ~400 lessons
};
/** Determine the Nova stage for a given totalXP */
function getNovaStage(totalXP) {
    const stages = [...exports.NOVA_STAGES].reverse();
    for (const stage of stages) {
        if (totalXP >= STAGE_THRESHOLDS[stage])
            return stage;
    }
    return 'egg';
}
/** Check if the user just evolved (compare before/after) */
function checkEvolution(previousXP, newXP) {
    const previousStage = getNovaStage(previousXP);
    const newStage = getNovaStage(newXP);
    return {
        evolved: newStage !== previousStage,
        newStage,
        previousStage,
    };
}
/** XP remaining until the next stage */
function xpToNextStage(totalXP) {
    const currentStage = getNovaStage(totalXP);
    const idx = exports.NOVA_STAGES.indexOf(currentStage);
    if (idx >= exports.NOVA_STAGES.length - 1)
        return 0; // already legendary
    const nextThreshold = STAGE_THRESHOLDS[exports.NOVA_STAGES[idx + 1]];
    return Math.max(0, nextThreshold - totalXP);
}
/** Determine Nova's mood based on recent activity */
function getNovaMood(lessonsToday, currentStreak) {
    if (lessonsToday >= 3 || currentStreak >= 7)
        return 'excited';
    if (lessonsToday >= 1)
        return 'happy';
    if (currentStreak > 0)
        return 'neutral';
    return 'sleepy';
}
//# sourceMappingURL=novaEvolution.js.map