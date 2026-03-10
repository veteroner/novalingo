/**
 * DailyQuestsScreen
 *
 * Günlük görevler listesi — ilerleme, ödüller, tamamlanma durumu.
 */

import type { DailyQuest, QuestDefinition } from '@/types';
import { Badge } from '@components/atoms/Badge';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { QuestItem } from '@components/molecules/QuestItem';
import { MainLayout } from '@components/templates/MainLayout';
import { useClaimQuestReward, useDailyQuests } from '@hooks/queries';
import { useCountdown } from '@hooks/useCountdown';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

/** Seconds remaining until midnight (local time) */
function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

// Helper to create mock quest
function mockQuest(
  questId: string,
  def: Omit<QuestDefinition, 'id' | 'titleEn' | 'description' | 'difficulty' | 'metadata'>,
  progress: number,
  completed: boolean,
  claimed: boolean,
): DailyQuest {
  return {
    questId,
    definition: {
      id: `def_${questId}`,
      titleEn: def.title,
      description: def.title,
      difficulty: 'easy',
      ...def,
    },
    progress,
    target: def.target,
    completed,
    claimed,
    assignedAt: null,
  };
}

// Fallback mock quests
const fallbackQuests: DailyQuest[] = [
  mockQuest(
    'q1',
    {
      type: 'complete_lessons',
      title: '3 ders tamamla',
      target: 3,
      reward: { xp: 50, stars: 0, gems: 0 },
    },
    2,
    false,
    false,
  ),
  mockQuest(
    'q2',
    { type: 'earn_xp', title: '100 XP kazan', target: 100, reward: { xp: 0, stars: 30, gems: 0 } },
    100,
    true,
    false,
  ),
  mockQuest(
    'q3',
    {
      type: 'perfect_score',
      title: '1 mükemmel ders yap',
      target: 1,
      reward: { xp: 0, stars: 0, gems: 5 },
    },
    0,
    false,
    false,
  ),
  mockQuest(
    'q4',
    {
      type: 'learn_words',
      title: '20 kelime tekrar et',
      target: 20,
      reward: { xp: 30, stars: 0, gems: 0 },
    },
    8,
    false,
    false,
  ),
];

export default function DailyQuestsScreen() {
  const child = useChildStore((s) => s.activeChild);
  const { data: serverQuests } = useDailyQuests(child?.id);
  const claimReward = useClaimQuestReward();
  const [localClaimed, setLocalClaimed] = useState<Set<string>>(new Set());
  const showToast = useUIStore((s) => s.showToast);

  const quests = serverQuests && serverQuests.length > 0 ? serverQuests : fallbackQuests;

  const completedCount = quests.filter(
    (q) => q.completed || q.claimed || localClaimed.has(q.questId),
  ).length;
  const progress = quests.length > 0 ? completedCount / quests.length : 0;

  const { seconds: resetSeconds } = useCountdown({
    initialSeconds: secondsUntilMidnight(),
    autoStart: true,
  });

  const hours = Math.floor(resetSeconds / 3600);
  const minutes = Math.floor((resetSeconds % 3600) / 60);
  const secs = resetSeconds % 60;
  const timerText = `${String(hours).padStart(2, '0')}s ${String(minutes).padStart(2, '0')}dk ${String(secs).padStart(2, '0')}sn`;

  const handleClaim = useCallback(
    (questId: string) => {
      if (!child || claimReward.isPending) return;
      claimReward.mutate(
        { childId: child.id, questId },
        {
          onSuccess: () => {
            setLocalClaimed((prev) => new Set(prev).add(questId));
          },
          onError: () => {
            showToast({
              type: 'error',
              title: 'Ödül alınamadı',
              message: 'Bir hata oluştu, lütfen tekrar dene.',
            });
          },
        },
      );
    },
    [child, claimReward, showToast],
  );

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <Text variant="h3">⚔️ Günlük Görevler</Text>
          <Text variant="bodySmall" className="text-text-secondary">
            Her gün yeni görevler seni bekliyor!
          </Text>
        </div>

        {/* Overall Progress */}
        <Card variant="glass" padding="md">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text variant="bodySmall" weight="bold">
                Günlük İlerleme
              </Text>
              <Badge variant="success" size="sm">
                {completedCount}/{quests.length}
              </Badge>
            </div>
            <ProgressBar value={progress} variant="xp" size="md" />
            {progress >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Text variant="caption" className="text-success text-center font-bold">
                  🎉 Tüm görevler tamamlandı! Bonus ödül kazandın!
                </Text>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Quest List */}
        <div className="space-y-3">
          {quests.map((quest, i) => (
            <motion.div
              key={quest.questId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <QuestItem quest={quest} onClaim={handleClaim} />
            </motion.div>
          ))}
        </div>

        {/* Timer */}
        <Card variant="filled" padding="sm">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">⏰</span>
            <Text variant="caption" weight="bold" className="text-text-secondary">
              Yeni görevlere kalan: {timerText}
            </Text>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
