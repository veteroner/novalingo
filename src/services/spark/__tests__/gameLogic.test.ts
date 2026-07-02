/**
 * gameLogic — günlük görev üretimi testleri.
 *
 * Görev dokümanı şeması backend (`resetDailyQuests`, `onLessonCompleted`,
 * `claimQuestReward`) ve istemci eşlemesi (`useDailyQuests` → `mapStoredQuest`)
 * tarafından paylaşılır. Bu test o sözleşmeyi kilitler.
 */

import { describe, expect, it } from 'vitest';
import { generateDailyQuests } from '../gameLogic';

describe('generateDailyQuests', () => {
  const today = '2026-07-01';

  it('4 benzersiz görev üretir', () => {
    const quests = generateDailyQuests(today);
    expect(quests).toHaveLength(4);
    const types = new Set(quests.map((q) => q.type));
    expect(types.size).toBe(4);
  });

  it('backend uyumlu düz şemayı üretir', () => {
    for (const q of generateDailyQuests(today)) {
      expect(q.id).toMatch(new RegExp(`^${today}_\\d$`));
      expect(typeof q.title).toBe('string');
      expect(q.currentProgress).toBe(0);
      expect(q.targetProgress).toBeGreaterThan(0);
      expect(q.claimed).toBe(false);
      expect(['stars', 'gems', 'xp']).toContain(q.reward.type);
      expect(q.reward.amount).toBeGreaterThan(0);
    }
  });

  it('bilinen görev tiplerini kullanır', () => {
    const allowed = new Set(['lesson', 'xp', 'perfect', 'word', 'streak']);
    for (const q of generateDailyQuests(today)) {
      expect(allowed.has(q.type)).toBe(true);
    }
  });

  it("doküman id'si tarih önekiyle başlar (bugün filtresi için)", () => {
    for (const q of generateDailyQuests(today)) {
      expect(q.id >= today).toBe(true);
    }
  });
});
