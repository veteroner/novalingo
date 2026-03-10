/**
 * Gamification Service Tests
 *
 * Tests for pure functions: getNovaStageForXP, checkNovaEvolution,
 * getStreakMultiplier, isStreakActive, calculateLevelRewards, processLessonResult.
 */

import type { SubmitLessonResultRes } from '@services/firebase/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockShowToast, mockOpenModal } = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
  mockOpenModal: vi.fn(),
}));

import {
  checkNovaEvolution,
  getNovaStageForXP,
  getStreakMultiplier,
  isStreakActive,
  processLessonResult,
} from '../gamificationService';

// Mock uiStore
vi.mock('@stores/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      showToast: mockShowToast,
      openModal: mockOpenModal,
    }),
  },
}));

beforeEach(() => {
  mockShowToast.mockClear();
  mockOpenModal.mockClear();
});

// ===== getNovaStageForXP =====

describe('getNovaStageForXP', () => {
  it('should return egg for 0 XP', () => {
    expect(getNovaStageForXP(0)).toBe('egg');
  });

  it('should return baby at 200 XP', () => {
    expect(getNovaStageForXP(200)).toBe('baby');
  });

  it('should return child at 1000 XP', () => {
    expect(getNovaStageForXP(1000)).toBe('child');
  });

  it('should return teen at 3000 XP', () => {
    expect(getNovaStageForXP(3000)).toBe('teen');
  });

  it('should return adult at 8000 XP', () => {
    expect(getNovaStageForXP(8000)).toBe('adult');
  });

  it('should return legendary at 20000 XP', () => {
    expect(getNovaStageForXP(20000)).toBe('legendary');
  });

  it('should return legendary for very high XP', () => {
    expect(getNovaStageForXP(999999)).toBe('legendary');
  });

  it('should return egg for negative XP', () => {
    expect(getNovaStageForXP(-1)).toBe('egg');
  });

  it('should return correct stage at boundary transitions', () => {
    expect(getNovaStageForXP(199)).toBe('egg');
    expect(getNovaStageForXP(200)).toBe('baby');
    expect(getNovaStageForXP(999)).toBe('baby');
    expect(getNovaStageForXP(1000)).toBe('child');
  });
});

// ===== checkNovaEvolution =====

describe('checkNovaEvolution', () => {
  it('should return new stage when evolution happens', () => {
    const result = checkNovaEvolution(150, 250);
    expect(result).toBe('baby');
  });

  it('should return null when no evolution', () => {
    const result = checkNovaEvolution(100, 150);
    expect(result).toBeNull();
  });

  it('should open evolution modal on evolution', () => {
    checkNovaEvolution(150, 250);
    expect(mockOpenModal).toHaveBeenCalledWith('novaEvolution', {
      oldStage: 'egg',
      newStage: 'baby',
    });
  });

  it('should not open modal when no evolution', () => {
    mockOpenModal.mockClear();
    checkNovaEvolution(100, 150);
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});

// ===== getStreakMultiplier =====

describe('getStreakMultiplier', () => {
  it('should return 1.0 for 0 days', () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
  });

  it('should increase by 0.05 per day', () => {
    expect(getStreakMultiplier(1)).toBe(1.05);
    expect(getStreakMultiplier(10)).toBe(1.5);
  });

  it('should cap at 2.5x', () => {
    expect(getStreakMultiplier(30)).toBe(2.5);
    expect(getStreakMultiplier(100)).toBe(2.5);
  });
});

// ===== isStreakActive =====

describe('isStreakActive', () => {
  it('should return true for today', () => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    expect(isStreakActive(today)).toBe(true);
  });

  it('should return true for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
    expect(isStreakActive(yesterday)).toBe(true);
  });

  it('should return false for 2 days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] ?? '';
    expect(isStreakActive(twoDaysAgo)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isStreakActive('')).toBe(false);
  });
});

// ===== processLessonResult =====

describe('processLessonResult', () => {
  const baseResult: SubmitLessonResultRes = {
    xpEarned: 50,
    baseXP: 40,
    bonusXP: 10,
    starsEarned: 2,
    newLevel: 5,
    leveledUp: false,
    streak: 3,
    isPerfect: false,
  } as SubmitLessonResultRes;

  it('should show perfect toast when isPerfect', () => {
    const perfectResult = { ...baseResult, isPerfect: true };
    processLessonResult(perfectResult, 5, 0);

    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'achievement' }));
  });

  it('should not show toast for imperfect result', () => {
    processLessonResult(baseResult, 5, 0);

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('should open level:up modal when leveled up', () => {
    const levelUpResult: SubmitLessonResultRes = {
      ...baseResult,
      leveledUp: true,
      newLevel: 6,
    };
    processLessonResult(levelUpResult, 5, 0);

    expect(mockOpenModal).toHaveBeenCalledWith('levelUp', {
      level: 6,
      rewards: { stars: 60, gems: 0 },
    });
  });

  it('should not open level:up modal when no level up', () => {
    mockOpenModal.mockClear();
    processLessonResult(baseResult, 5, 0);

    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});
