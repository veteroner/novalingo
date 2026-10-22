/**
 * "Nova ile Konuş" öğrenme yolu.
 *
 * Konuşma senaryoları temalarına göre bölümlere ayrılır (temalar senaryo
 * listesindeki ilk görünüş sırasıyla, senaryolar kendi sıralarıyla). Dünya
 * haritasındaki ders yolu gibi sıralı açılır: tamamlananlar ve ilk
 * tamamlanmamış senaryo açıktır, sonrakiler kilitlidir.
 */

import type { ConversationScenario } from '@/features/learning/data/conversations';
import { calculateStars } from '@utils/xp';

export type ConversationStopStatus = 'locked' | 'active' | 'completed' | 'perfect';

export interface ConversationStop {
  scenario: ConversationScenario;
  status: ConversationStopStatus;
  stars: number;
}

export interface ConversationChapter {
  theme: string;
  stops: ConversationStop[];
  completed: number;
}

export interface ConversationProgressSnapshot {
  completedScenarioIds: string[];
  bestScores: Record<string, number>;
}

export function buildConversationPath(
  scenarios: ConversationScenario[],
  progress: ConversationProgressSnapshot,
): ConversationChapter[] {
  const themes: string[] = [];
  for (const scenario of scenarios) {
    if (!themes.includes(scenario.theme)) themes.push(scenario.theme);
  }
  const completed = new Set(progress.completedScenarioIds);
  let hasActive = false;

  return themes.map((theme) => {
    const stops = scenarios
      .filter((scenario) => scenario.theme === theme)
      .map((scenario): ConversationStop => {
        const done = completed.has(scenario.id);
        // Puan (0-100) → doğruluk (0-1) → yıldız; uygulamanın geri kalanıyla aynı eşikler.
        const stars = done
          ? Math.max(1, calculateStars((progress.bestScores[scenario.id] ?? 0) / 100))
          : 0;
        const status: ConversationStopStatus = done
          ? stars >= 3
            ? 'perfect'
            : 'completed'
          : hasActive
            ? 'locked'
            : 'active';
        if (status === 'active') hasActive = true;
        return { scenario, status, stars };
      });
    return {
      theme,
      stops,
      completed: stops.filter((stop) => stop.status !== 'locked' && stop.status !== 'active')
        .length,
    };
  });
}
