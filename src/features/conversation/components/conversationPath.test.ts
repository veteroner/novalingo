import type { ConversationScenario } from '@/features/learning/data/conversations';
import { describe, expect, it } from 'vitest';
import { buildConversationPath } from './conversationPath';

const scenario = (id: string, theme: string) => ({ id, theme }) as ConversationScenario;

const scenarios = [
  scenario('a1', 'animals'),
  scenario('f1', 'food'),
  scenario('a2', 'animals'),
  scenario('f2', 'food'),
];

describe('buildConversationPath', () => {
  it('temaları ilk görünüş sırasıyla bölümlere ayırır', () => {
    const path = buildConversationPath(scenarios, { completedScenarioIds: [], bestScores: {} });
    expect(path.map((chapter) => chapter.theme)).toEqual(['animals', 'food']);
    expect(path[0]?.stops.map((stop) => stop.scenario.id)).toEqual(['a1', 'a2']);
  });

  it('ilk senaryo açık, sonrakiler kilitli', () => {
    const path = buildConversationPath(scenarios, { completedScenarioIds: [], bestScores: {} });
    const statuses = path.flatMap((chapter) => chapter.stops.map((stop) => stop.status));
    expect(statuses).toEqual(['active', 'locked', 'locked', 'locked']);
  });

  it('tamamlananlardan sonra ilk tamamlanmamış senaryo açılır; yıldızlar puandan gelir', () => {
    const path = buildConversationPath(scenarios, {
      completedScenarioIds: ['a1', 'a2'],
      bestScores: { a1: 100, a2: 10 },
    });
    const [animals, food] = path;
    expect(animals?.stops.map((stop) => stop.status)).toEqual(['perfect', 'completed']);
    expect(animals?.stops[1]?.stars).toBe(1);
    expect(animals?.completed).toBe(2);
    expect(food?.stops.map((stop) => stop.status)).toEqual(['active', 'locked']);
  });

  it('sıra dışı tamamlanan bir senaryo açık kalır', () => {
    const path = buildConversationPath(scenarios, {
      completedScenarioIds: ['f2'],
      bestScores: { f2: 80 },
    });
    const statuses = path.flatMap((chapter) => chapter.stops.map((stop) => stop.status));
    expect(statuses).toEqual(['active', 'locked', 'locked', 'completed']);
  });
});
