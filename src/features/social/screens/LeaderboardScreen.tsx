/**
 * LeaderboardScreen
 *
 * Haftalık liderlik tablosu — lig sistemi, sıralama.
 */

import type { LeagueTier } from '@/types';
import { Badge } from '@components/atoms/Badge';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { Leaderboard } from '@components/organisms/Leaderboard';
import { MainLayout } from '@components/templates/MainLayout';
import { useLeaderboard } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Etiketler i18n'den gelir (common.leaderboard.tiers, id'ye göre); burada emoji/renk.
const leagueTiers: { id: LeagueTier; emoji: string; color: string }[] = [
  { id: 'bronze', emoji: '🥉', color: 'text-amber-700' },
  { id: 'silver', emoji: '🥈', color: 'text-gray-400' },
  { id: 'gold', emoji: '🥇', color: 'text-yellow-500' },
  { id: 'platinum', emoji: '💫', color: 'text-cyan-500' },
  { id: 'diamond', emoji: '💎', color: 'text-nova-blue' },
  { id: 'legend', emoji: '👑', color: 'text-nova-purple' },
];

export default function LeaderboardScreen() {
  const { t } = useTranslation('common');
  const child = useChildStore((s) => s.activeChild);
  const [currentLeague, setCurrentLeague] = useState<LeagueTier>(child?.leagueTier ?? 'silver');
  const defaultTier = { id: 'bronze' as LeagueTier, emoji: '🥉', color: 'text-amber-700' };
  const currentTier = leagueTiers.find((tier) => tier.id === currentLeague) ?? defaultTier;

  const { data } = useLeaderboard(currentLeague);
  const entries = data?.entries ?? [];
  const myRank = data?.myRank ?? 0;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="text-center">
          <Text variant="h3">{t('leaderboard.title')}</Text>
          <motion.div
            className="mt-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">{currentTier.emoji}</span>
          </motion.div>
          <Text variant="h4" className={currentTier.color}>
            {t('leaderboard.leagueName', { tier: t(`leaderboard.tiers.${currentLeague}`) })}
          </Text>
        </div>

        {/* League tabs */}
        <div className="flex justify-center gap-2">
          {leagueTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                setCurrentLeague(tier.id);
              }}
              className={`text-xl transition-all ${tier.id === currentLeague ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60'}`}
            >
              {tier.emoji}
            </button>
          ))}
        </div>

        {/* Week Info */}
        <Card variant="glass" padding="sm">
          <div className="flex items-center justify-between">
            <Text variant="caption" weight="bold" className="text-text-secondary">
              {t('leaderboard.thisWeekRank', { rank: myRank })}
            </Text>
            <Badge variant="info" size="sm">
              {t('leaderboard.daysLeft', { count: 3 })}
            </Badge>
          </div>
        </Card>

        {/* Promotion/Demotion info */}
        <Card variant="filled" padding="sm">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🏆</span>
            <Text variant="caption" weight="bold" className="text-success">
              {t('leaderboard.topPromote')}
            </Text>
          </div>
        </Card>

        {/* Leaderboard */}
        {entries.length === 0 ? (
          <Card variant="filled" padding="lg">
            <div className="space-y-2 text-center">
              <span className="text-4xl">📊</span>
              <Text variant="body" weight="bold">
                {t('leaderboard.empty')}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {t('leaderboard.emptyDesc')}
              </Text>
            </div>
          </Card>
        ) : (
          <Leaderboard entries={entries} currentUserId={child?.id ?? 'current'} />
        )}
      </div>
    </MainLayout>
  );
}
