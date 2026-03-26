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

const leagueTiers: { id: LeagueTier; label: string; emoji: string; color: string }[] = [
  { id: 'bronze', label: 'Bronz', emoji: '🥉', color: 'text-amber-700' },
  { id: 'silver', label: 'Gümüş', emoji: '🥈', color: 'text-gray-400' },
  { id: 'gold', label: 'Altın', emoji: '🥇', color: 'text-yellow-500' },
  { id: 'platinum', label: 'Platin', emoji: '💫', color: 'text-cyan-500' },
  { id: 'diamond', label: 'Elmas', emoji: '💎', color: 'text-nova-blue' },
  { id: 'legend', label: 'Efsane', emoji: '👑', color: 'text-nova-purple' },
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
  const entries = data?.entries ?? [];
  const myRank = data?.myRank ?? 0;

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
        {entries.length === 0 ? (
          <Card variant="filled" padding="lg">
            <div className="space-y-2 text-center">
              <span className="text-4xl">📊</span>
              <Text variant="body" weight="bold">
                Henüz kimse yok
              </Text>
              <Text variant="caption" className="text-text-secondary">
                Bu haftanın liderlik tablosu yakında dolacak!
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
