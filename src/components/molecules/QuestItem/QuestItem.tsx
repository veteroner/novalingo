/**
 * QuestItem Molecule
 *
 * Günlük görev kartı — ilerleme çubuğu ve ödül.
 */

import type { DailyQuest } from '@/types';
import { Button } from '@components/atoms/Button';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface QuestItemProps {
  quest: DailyQuest;
  onClaim?: (questId: string) => void;
  className?: string;
}

const questIcons: Record<string, string> = {
  complete_lessons: '📚',
  earn_xp: '⚡',
  perfect_lesson: '🌟',
  maintain_streak: '🔥',
  review_vocabulary: '🧠',
  play_time: '⏱️',
  collect_stars: '⭐',
};

export function QuestItem({ quest, onClaim, className }: QuestItemProps) {
  const progress = quest.target > 0 ? quest.progress / quest.target : 0;
  const isCompleted = quest.completed;
  const isClaimed = quest.claimed;

  return (
    <motion.div
      layout
      className={clsx(
        'flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors',
        isClaimed
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : isCompleted
            ? 'bg-success/5 border-success/30'
            : 'bg-white border-gray-100',
        className,
      )}
    >
      {/* Icon */}
      <div className="text-2xl shrink-0">
        {questIcons[quest.definition.type] ?? '🎯'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <Text variant="bodySmall" weight="bold" truncate>
          {quest.definition.title}
        </Text>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar value={progress} size="xs" />
          </div>
          <Text variant="caption" weight="semibold" className="shrink-0 text-text-secondary">
            {quest.progress}/{quest.target}
          </Text>
        </div>
      </div>

      {/* Reward / Claim */}
      <div className="shrink-0">
        {isCompleted && !isClaimed ? (
          <Button size="sm" variant="success" onClick={() => onClaim?.(quest.questId)}>
            Al!
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-xs font-bold text-text-secondary">
            {quest.definition.reward.xp > 0 && <span>+{quest.definition.reward.xp} XP</span>}
            {quest.definition.reward.stars > 0 && <span>+{quest.definition.reward.stars} ⭐</span>}
            {quest.definition.reward.gems > 0 && <span>+{quest.definition.reward.gems} 💎</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
