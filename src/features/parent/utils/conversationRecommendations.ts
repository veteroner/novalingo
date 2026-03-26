import type { ConversationThemeProgress } from '@/hooks/queries/useParentQueries';

export interface RecommendedConversationTheme {
  theme: string;
  reason: string;
  averageScore: number;
  focusWords: string[];
}

export function getRecommendedConversationTheme(
  themes: ConversationThemeProgress[],
): RecommendedConversationTheme | null {
  const candidates = themes
    .filter(
      (item) =>
        item.attempts >= 2 &&
        (item.averageScore < 80 || item.successRate < 0.75 || item.averageHints >= 0.75),
    )
    .map((item) => ({
      item,
      needScore:
        100 -
        item.averageScore +
        (1 - item.successRate) * 35 +
        item.averageHints * 12 +
        Math.min(item.attempts, 4) * 2,
    }))
    .sort((left, right) => right.needScore - left.needScore);

  const selected = candidates[0]?.item;
  if (!selected) return null;

  const roundedScore = Math.round(selected.averageScore);
  const roundedSuccessRate = Math.round(selected.successRate * 100);
  const roundedHints = selected.averageHints.toFixed(1);
  const focusWords = selected.recentWords.slice(0, 3);

  let reason = `${selected.attempts} oturumda ortalama %${roundedScore} başarı gördük.`;
  if (selected.averageHints >= 0.75) {
    reason += ` Bu temada oturum başına ortalama ${roundedHints} ipucu kullanıldığı için bir tekrar turu faydalı olur.`;
  } else if (selected.successRate < 0.75) {
    reason += ` Başarılı tamamlama oranı %${roundedSuccessRate} seviyesinde kaldı.`;
  } else {
    reason += ' Biraz daha pratikle daha akıcı hale gelebilir.';
  }

  return {
    theme: selected.theme,
    reason,
    averageScore: roundedScore,
    focusWords,
  };
}
