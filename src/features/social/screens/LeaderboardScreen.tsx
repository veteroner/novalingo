/**
 * LeaderboardScreen
 *
 * Haftalık liderlik tablosu — lig sistemi, sıralama.
 */

import type { LeaderboardEntry, LeagueTier } from '@/types';
import { Badge } from '@components/atoms/Badge';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { Leaderboard } from '@components/organisms/Leaderboard';
import { MainLayout } from '@components/templates/MainLayout';
import { useLeaderboard } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { motion } from 'framer-motion';
import { useState } from 'react';

const leagueTiers: { id: LeagueTier; label: string; emoji: string; color: string }[] = [
  { id: 'bronze', label: 'Bronz', emoji: '🥉', color: 'text-amber-700' },
  { id: 'silver', label: 'Gümüş', emoji: '🥈', color: 'text-gray-400' },
  { id: 'gold', label: 'Altın', emoji: '🥇', color: 'text-yellow-500' },
  { id: 'platinum', label: 'Platin', emoji: '💫', color: 'text-cyan-500' },
  { id: 'diamond', label: 'Elmas', emoji: '💎', color: 'text-nova-blue' },
  { id: 'legend', label: 'Efsane', emoji: '👑', color: 'text-nova-purple' },
];

// Fallback mock leaderboard
const fallbackEntries: LeaderboardEntry[] = [
  {
    childId: 'c1',
    displayName: 'Ayşe',
    avatarId: 'avatar_1',
    level: 15,
    weeklyXP: 1250,
    rank: 1,
    trend: 'up',
  },
  {
    childId: 'c2',
    displayName: 'Mehmet',
    avatarId: 'avatar_2',
    level: 12,
    weeklyXP: 980,
    rank: 2,
    trend: 'down',
  },
  {
    childId: 'c3',
    displayName: 'Zeynep',
    avatarId: 'avatar_3',
    level: 14,
    weeklyXP: 920,
    rank: 3,
    trend: 'up',
  },
  {
    childId: 'current',
    displayName: 'Sen',
    avatarId: 'avatar_default',
    level: 10,
    weeklyXP: 750,
    rank: 4,
    trend: 'same',
  },
  {
    childId: 'c4',
    displayName: 'Ali',
    avatarId: 'avatar_4',
    level: 9,
    weeklyXP: 680,
    rank: 5,
    trend: 'down',
  },
  {
    childId: 'c5',
    displayName: 'Elif',
    avatarId: 'avatar_5',
    level: 11,
    weeklyXP: 620,
    rank: 6,
    trend: 'up',
  },
  {
    childId: 'c6',
    displayName: 'Can',
    avatarId: 'avatar_6',
    level: 8,
    weeklyXP: 500,
    rank: 7,
    trend: 'same',
  },
  {
    childId: 'c7',
    displayName: 'Defne',
    avatarId: 'avatar_7',
    level: 7,
    weeklyXP: 420,
    rank: 8,
    trend: 'down',
  },
];

export default function LeaderboardScreen() {
  const child = useChildStore((s) => s.activeChild);
  const [currentLeague, setCurrentLeague] = useState<LeagueTier>(child?.leagueTier ?? 'silver');
  const defaultTier = {
    id: 'bronze' as LeagueTier,
    label: 'Bronz',
    emoji: '🥉',
    color: 'text-amber-700',
  };
  const currentTier = leagueTiers.find((t) => t.id === currentLeague) ?? defaultTier;

  const { data } = useLeaderboard(currentLeague);
  const entries = data?.entries ?? fallbackEntries;
  const myRank = data?.myRank ?? 4;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="text-center">
          <Text variant="h3">📊 Liderlik Tablosu</Text>
          <motion.div
            className="mt-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">{currentTier.emoji}</span>
          </motion.div>
          <Text variant="h4" className={currentTier.color}>
            {currentTier.label} Ligi
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
              Bu Hafta — Sıran: #{myRank}
            </Text>
            <Badge variant="info" size="sm">
              ⏰ 3 gün kaldı
            </Badge>
          </div>
        </Card>

        {/* Promotion/Demotion info */}
        <Card variant="filled" padding="sm">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🏆</span>
            <Text variant="caption" weight="bold" className="text-success">
              İlk 3 bir üst lige yükselir!
            </Text>
          </div>
        </Card>

        {/* Leaderboard */}
        <Leaderboard entries={entries} currentUserId={child?.id ?? 'current'} />
      </div>
    </MainLayout>
  );
}
