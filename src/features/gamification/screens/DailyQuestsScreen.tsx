/**
 * DailyQuestsScreen
 *
 * Günlük görevler listesi — ilerleme, ödüller, tamamlanma durumu.
 */

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

export default function DailyQuestsScreen() {
  const child = useChildStore((s) => s.activeChild);
  const { data: serverQuests } = useDailyQuests(child?.id);
  const claimReward = useClaimQuestReward();
  const [localClaimed, setLocalClaimed] = useState<Set<string>>(new Set());
  const showToast = useUIStore((s) => s.showToast);

  const quests = serverQuests ?? [];

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
          {quests.length === 0 ? (
            <Card variant="filled" padding="lg">
              <div className="space-y-2 text-center">
                <span className="text-4xl">⚔️</span>
                <Text variant="body" weight="bold">
                  Henüz görev yok
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  Günlük görevler yakında gelecek!
                </Text>
              </div>
            </Card>
          ) : (
            quests.map((quest, i) => (
              <motion.div
                key={quest.questId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <QuestItem quest={quest} onClaim={handleClaim} />
              </motion.div>
            ))
          )}
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
