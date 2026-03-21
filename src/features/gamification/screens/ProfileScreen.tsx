/**
 * ProfileScreen
 *
 * Çocuk profili — avatar, seviye, streak, istatistikler, başarımlar özeti.
 */

import { NOVA_STAGES } from '@/config/constants';
import type { NovaStage } from '@/types/user';
import { Avatar } from '@components/atoms/Avatar';
import { Badge } from '@components/atoms/Badge';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { CurrencyDisplay } from '@components/molecules/CurrencyDisplay';
import { NovaStageAvatar, STAGE_CONFIG } from '@components/molecules/NovaStageAvatar';
import { XPDisplay } from '@components/molecules/XPDisplay';
import { MainLayout } from '@components/templates/MainLayout';
import { useChildStore } from '@stores/childStore';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileScreen() {
  const child = useChildStore((s) => s.activeChild);
  const navigate = useNavigate();

  if (!child) return null;

  const stats = [
    { label: 'Tamamlanan Ders', value: child.completedLessons, emoji: '📚' },
    { label: 'Toplam Süre (dk)', value: child.totalPlayTimeMinutes, emoji: '📝' },
    { label: 'En Uzun Seri', value: child.longestStreak, emoji: '🔥' },
    { label: 'Toplam XP', value: child.totalXP, emoji: '⚡' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Profile Header */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Avatar name={child.name} src={child.avatarId} size="xl" showLevel={child.level} />
          <Text variant="h3" className="mt-3">
            {child.name}
          </Text>
          <Badge variant="level" size="lg" className="mt-1">
            Seviye {child.level}
          </Badge>
        </motion.div>

        {/* XP Progress */}
        <XPDisplay currentXP={child.totalXP} level={child.level} />

        {/* Currency */}
        <Card variant="glass" padding="md">
          <div className="flex items-center justify-center">
            <CurrencyDisplay stars={child.stars} gems={child.gems} />
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} variant="filled" padding="md">
              <div className="text-center">
                <span className="text-2xl">{stat.emoji}</span>
                <Text variant="h4" className="mt-1">
                  {stat.value}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {stat.label}
                </Text>
              </div>
            </Card>
          ))}
        </div>

        {/* Nova Companion Status — Enhanced */}
        <NovaStageCard
          stage={child.novaStage}
          totalXP={child.totalXP}
          happiness={child.novaHappiness}
        />

        {/* Quick Links */}
        <div className="space-y-2">
          {[
            { label: '🏆 Başarımlar', path: '/achievements' },
            { label: '📦 Koleksiyon', path: '/collection' },
            { label: '🛒 Mağaza', path: '/shop' },
            { label: '📊 Liderlik', path: '/leaderboard' },
            { label: '👨‍👩‍👧 Ebeveyn Paneli', path: '/parent' },
          ].map((link) => (
            <Card
              key={link.label}
              variant="outlined"
              pressable
              padding="sm"
              onClick={() => navigate(link.path)}
            >
              <div className="flex items-center justify-between">
                <Text variant="body" weight="semibold">
                  {link.label}
                </Text>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

// ===== Nova Stage Card =====

const STAGE_LABELS_TR: Record<NovaStage, string> = {
  egg: 'Yumurta',
  baby: 'Bebek Nova',
  child: 'Çocuk Nova',
  teen: 'Genç Nova',
  adult: 'Yetişkin Nova',
  legendary: 'Efsanevi Nova',
};

function NovaStageCard({
  stage,
  totalXP,
  happiness,
}: {
  stage: NovaStage;
  totalXP: number;
  happiness: number;
}) {
  const stageProgress = useMemo(() => {
    const currentIdx = NOVA_STAGES.findIndex((s) => s.stage === stage);
    const currentThreshold = NOVA_STAGES[currentIdx];
    const nextThreshold = NOVA_STAGES[currentIdx + 1];

    if (!nextThreshold || !currentThreshold) {
      return { progress: 1, xpToNext: 0, nextStageName: null };
    }

    const rangeXP = nextThreshold.minXP - currentThreshold.minXP;
    const progressXP = totalXP - currentThreshold.minXP;

    return {
      progress: Math.min(progressXP / rangeXP, 1),
      xpToNext: nextThreshold.minXP - totalXP,
      nextStageName: STAGE_LABELS_TR[nextThreshold.stage],
    };
  }, [stage, totalXP]);

  const config = STAGE_CONFIG[stage];

  return (
    <Card variant="elevated" padding="md">
      <div className="flex flex-col items-center gap-3 text-center">
        <NovaStageAvatar stage={stage} size="lg" />
        <div className="w-full">
          <div className="flex items-center gap-2">
            <Text variant="body" weight="bold" style={{ color: config.bodyColor }}>
              {STAGE_LABELS_TR[stage]}
            </Text>
            <Text variant="caption" className="text-text-secondary">
              😊 {happiness}%
            </Text>
          </div>

          {/* Progress to next stage */}
          {stageProgress.nextStageName ? (
            <>
              <ProgressBar value={stageProgress.progress} variant="xp" size="xs" className="mt-1" />
              <Text variant="caption" className="text-text-secondary mt-0.5">
                Sonraki: {stageProgress.nextStageName} · {stageProgress.xpToNext} XP kaldı
              </Text>
            </>
          ) : (
            <Text variant="caption" className="text-nova-orange mt-1 font-semibold">
              ✦ Maksimum Aşama ✦
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}
