/**
 * Nova Evolution Service
 *
 * Manages the Nova mascot's growth stages.
 * Stages: egg → baby → child → teen → adult → legendary
 *
 * Evolution is driven by total XP milestones.
 */

export const NOVA_STAGES = ['egg', 'baby', 'child', 'teen', 'adult', 'legendary'] as const;
export type NovaStage = (typeof NOVA_STAGES)[number];

/** XP thresholds for each evolution stage */
const STAGE_THRESHOLDS: Record<NovaStage, number> = {
  egg: 0,
  baby: 200, // ~4 lessons
  child: 1_000, // ~20 lessons
  teen: 3_000, // ~60 lessons
  adult: 8_000, // ~160 lessons
  legendary: 20_000, // ~400 lessons
};

/** Determine the Nova stage for a given totalXP */
export function getNovaStage(totalXP: number): NovaStage {
  const stages = [...NOVA_STAGES].reverse();
  for (const stage of stages) {
    if (totalXP >= STAGE_THRESHOLDS[stage]) return stage;
  }
  return 'egg';
}

/** Check if the user just evolved (compare before/after) */
export function checkEvolution(
  previousXP: number,
  newXP: number,
): { evolved: boolean; newStage: NovaStage; previousStage: NovaStage } {
  const previousStage = getNovaStage(previousXP);
  const newStage = getNovaStage(newXP);
  return {
    evolved: newStage !== previousStage,
    newStage,
    previousStage,
  };
}

/** XP remaining until the next stage */
export function xpToNextStage(totalXP: number): number {
  const currentStage = getNovaStage(totalXP);
  const idx = NOVA_STAGES.indexOf(currentStage);
  if (idx >= NOVA_STAGES.length - 1) return 0; // already legendary
  const nextThreshold = STAGE_THRESHOLDS[NOVA_STAGES[idx + 1]];
  return Math.max(0, nextThreshold - totalXP);
}

/** Determine Nova's mood based on recent activity */
export function getNovaMood(
  lessonsToday: number,
  currentStreak: number,
): 'happy' | 'neutral' | 'sleepy' | 'excited' {
  if (lessonsToday >= 3 || currentStreak >= 7) return 'excited';
  if (lessonsToday >= 1) return 'happy';
  if (currentStreak > 0) return 'neutral';
  return 'sleepy';
}
