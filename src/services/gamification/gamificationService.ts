/**
 * Client-side Gamification Service
 *
 * Backend sonuçlarını UI olaylarına çevirir — level up, streak, quest, achievement popup'ları.
 * EventBus üzerinden loosely-coupled bildirimler yayınlar.
 */

import type { SubmitLessonResultRes } from '@services/firebase/functions';
import { useUIStore } from '@stores/uiStore';

// ===== LESSON RESULT PROCESSING =====

/**
 * Backend submitLessonResult yanıtını işleyip UI olayları tetikler.
 */
export function processLessonResult(
  result: SubmitLessonResultRes,
  previousLevel: number,
  _previousXP: number,
): void {
  const { showToast, openModal } = useUIStore.getState();

  // Level up check
  if (result.leveledUp && result.newLevel > previousLevel) {
    openModal('levelUp', {
      level: result.newLevel,
      rewards: calculateLevelRewards(result.newLevel),
    });
  }

  // Perfect lesson
  if (result.isPerfect) {
    showToast({
      type: 'achievement',
      title: 'Mükemmel! 🌟',
      message: 'Tüm soruları doğru cevapladın!',
      icon: '💯',
    });
  }
}

// ===== LEVEL REWARDS =====
function calculateLevelRewards(level: number): { stars: number; gems: number } {
  // Every 5 levels: gems bonus, always some stars
  return {
    stars: level * 10,
    gems: level % 5 === 0 ? level * 2 : 0,
  };
}

// ===== NOVA STAGE =====

const NOVA_STAGES = [
  { stage: 'egg', minXP: 0 },
  { stage: 'baby', minXP: 200 },
  { stage: 'child', minXP: 1000 },
  { stage: 'teen', minXP: 3000 },
  { stage: 'adult', minXP: 8000 },
  { stage: 'legendary', minXP: 20000 },
] as const;

export function getNovaStageForXP(totalXP: number): string {
  for (let i = NOVA_STAGES.length - 1; i >= 0; i--) {
    const entry = NOVA_STAGES[i];
    if (entry && totalXP >= entry.minXP) return entry.stage;
  }
  return 'egg';
}

export function checkNovaEvolution(previousXP: number, newXP: number): string | null {
  const oldStage = getNovaStageForXP(previousXP);
  const newStage = getNovaStageForXP(newXP);

  if (oldStage !== newStage) {
    const { openModal } = useUIStore.getState();
    openModal('novaEvolution', { oldStage, newStage });

    return newStage;
  }
  return null;
}

// ===== STREAK HELPERS =====

export function getStreakMultiplier(streak: number): number {
  return Math.min(1 + streak * 0.05, 2.5); // max 2.5x at 30 days
}

export function isStreakActive(lastActivityDate: string): boolean {
  if (!lastActivityDate) return false;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  return lastActivityDate === today || lastActivityDate === yesterday;
}

// ===== LEVEL INFO =====
export { calculateLevel, calculateStars } from '@utils/xp';
