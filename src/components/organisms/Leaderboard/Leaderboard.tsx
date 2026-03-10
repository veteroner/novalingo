/**
 * Leaderboard Organism
 *
 * Haftalık liderlik tablosu — kendi liginin en iyileri.
 * Animasyonlu sıralama, mevcut kullanıcı vurgusu.
 */

import type { LeaderboardEntry } from '@/types';
import { Avatar } from '@components/atoms/Avatar';
import { Badge } from '@components/atoms/Badge';
import { Text } from '@components/atoms/Text';
import { formatNumber } from '@utils/number';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  className?: string;
}

const rankMedals: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function Leaderboard({ entries, currentUserId, className }: LeaderboardProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      {entries.map((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = entry.childId === currentUserId;
        const medal = rankMedals[rank];

        return (
          <motion.div
            key={entry.childId}
            className={clsx(
              'flex items-center gap-3 rounded-2xl px-4 py-3',
              isCurrentUser
                ? 'bg-nova-blue/10 border-nova-blue/30 border-2'
                : 'border border-gray-100 bg-white',
              rank <= 3 && 'shadow-md',
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Rank */}
            <div className="w-8 shrink-0 text-center">
              {medal ? (
                <span className="text-xl">{medal}</span>
              ) : (
                <Text variant="bodySmall" weight="bold" className="text-text-secondary">
                  {rank}
                </Text>
              )}
            </div>

            {/* Avatar */}
            <Avatar
              name={entry.displayName}
              src={entry.avatarId}
              size="sm"
              showLevel={entry.level}
            />

            {/* Name */}
            <div className="min-w-0 flex-1">
              <Text variant="bodySmall" weight="bold" truncate>
                {entry.displayName}
                {isCurrentUser && <span className="text-nova-blue ml-1">(Sen)</span>}
              </Text>
            </div>

            {/* XP */}
            <Badge variant="xp" size="sm">
              {formatNumber(entry.weeklyXP)} XP
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}
