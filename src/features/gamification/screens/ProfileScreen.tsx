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
import { NovaStageAvatar } from '@components/molecules/NovaStageAvatar';
import { XPDisplay } from '@components/molecules/XPDisplay';
import { MainLayout } from '@components/templates/MainLayout';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AvatarEditor } from '../components/AvatarEditor';

export default function ProfileScreen() {
  const child = useChildStore((s) => s.activeChild);
  const openModal = useUIStore((s) => s.openModal);
  const navigate = useNavigate();
  const { t } = useTranslation('gamification');
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);

  if (!child) return null;

  if (editingAvatar) {
    return (
      <MainLayout>
        <div className="px-4 py-6">
          <AvatarEditor
            key={child.id}
            childId={child.id}
            avatarId={child.avatarId}
            name={child.name}
            onClose={(saved) => {
              setEditingAvatar(false);
              setAvatarSaved(saved);
              requestAnimationFrame(() => editButton.current?.focus());
            }}
          />
        </div>
      </MainLayout>
    );
  }

  const stats = [
    { label: t('profile.stats.completedLessons'), value: child.completedLessons, emoji: '📚' },
    { label: t('profile.stats.totalTime'), value: child.totalPlayTimeMinutes, emoji: '📝' },
    { label: t('profile.stats.longestStreak'), value: child.longestStreak, emoji: '🔥' },
    { label: t('profile.stats.totalXP'), value: child.totalXP, emoji: '⚡' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Profile Header */}
        <motion.div
          className="border-border from-primary-soft to-surface flex flex-col items-center rounded-3xl border bg-linear-to-b p-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Avatar name={child.name} avatarId={child.avatarId} size="xl" showLevel={child.level} />
          <Text variant="h3" className="mt-3">
            {child.name}
          </Text>
          <Badge variant="level" size="lg" className="mt-1">
            {t('profile.level', { level: child.level })}
          </Badge>
          <button
            ref={editButton}
            type="button"
            onClick={() => {
              setEditingAvatar(true);
              setAvatarSaved(false);
            }}
            className="text-primary focus-visible:ring-primary mt-4 min-h-11 rounded-xl px-4 text-sm font-bold focus-visible:ring-2"
          >
            {t('profile.avatar.change')}
          </button>
          {avatarSaved && (
            <p role="status" className="text-success-ink mt-3 text-sm">
              {t('profile.avatar.saved')}
            </p>
          )}
        </motion.div>

        {/* XP Progress */}
        <XPDisplay
          currentXP={child.totalXP}
          level={child.level}
          currentLevelXP={child.currentLevelXP}
          nextLevelXP={child.nextLevelXP}
        />

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
          <Card
            variant="outlined"
            pressable
            padding="sm"
            onClick={() => {
              openModal('settings');
            }}
          >
            <div className="flex items-center justify-between">
              <Text variant="body" weight="semibold">
                {t('profile.quickSettings')}
              </Text>
              <span className="text-text-secondary">→</span>
            </div>
          </Card>

          <Card
            variant="outlined"
            pressable
            padding="sm"
            onClick={() => {
              openModal('streakLost');
            }}
          >
            <div className="flex items-center justify-between">
              <Text variant="body" weight="semibold">
                {t('profile.streakFreeze')}
              </Text>
              <span className="text-text-secondary">→</span>
            </div>
          </Card>

          {[
            { label: t('profile.menu.achievements'), path: '/achievements' },
            { label: t('profile.menu.collection'), path: '/collection' },
            { label: t('profile.menu.shop'), path: '/shop' },
            { label: t('profile.menu.leaderboard'), path: '/leaderboard' },
            { label: t('profile.menu.parent'), path: '/parent' },
          ].map((link) => (
            <Card
              key={link.path}
              variant="outlined"
              pressable
              padding="sm"
              onClick={() => navigate(link.path)}
            >
              <div className="flex items-center justify-between">
                <Text variant="body" weight="semibold">
                  {link.label}
                </Text>
                <span className="text-text-secondary">→</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

// ===== Nova Stage Card =====

function NovaStageCard({
  stage,
  totalXP,
  happiness,
}: {
  stage: NovaStage;
  totalXP: number;
  happiness: number;
}) {
  const { t } = useTranslation('gamification');
  const stageProgress = useMemo(() => {
    const currentIdx = NOVA_STAGES.findIndex((s) => s.stage === stage);
    const currentThreshold = NOVA_STAGES[currentIdx];
    const nextThreshold = NOVA_STAGES[currentIdx + 1];

    if (!nextThreshold || !currentThreshold) {
      return { progress: 1, xpToNext: 0, nextStageKey: null as NovaStage | null };
    }

    const rangeXP = nextThreshold.minXP - currentThreshold.minXP;
    const progressXP = totalXP - currentThreshold.minXP;

    return {
      progress: Math.min(progressXP / rangeXP, 1),
      xpToNext: nextThreshold.minXP - totalXP,
      nextStageKey: nextThreshold.stage,
    };
  }, [stage, totalXP]);

  return (
    <Card variant="elevated" padding="md">
      <div className="flex flex-col items-center gap-3 text-center">
        <NovaStageAvatar stage={stage} size="lg" />
        <div className="w-full">
          <div className="flex items-center gap-2">
            <Text variant="body" weight="bold" className="text-primary">
              {t(`profile.stage.${stage}`)}
            </Text>
            <Text variant="caption" className="text-text-secondary">
              😊 {happiness}%
            </Text>
          </div>

          {/* Progress to next stage */}
          {stageProgress.nextStageKey ? (
            <>
              <ProgressBar value={stageProgress.progress} variant="xp" size="xs" className="mt-1" />
              <Text variant="caption" className="text-text-secondary mt-0.5">
                {t('profile.nextStage', {
                  name: t(`profile.stage.${stageProgress.nextStageKey}`),
                  xp: stageProgress.xpToNext,
                })}
              </Text>
            </>
          ) : (
            <Text variant="caption" className="text-reward-ink mt-1 font-semibold">
              {t('profile.maxStage')}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}
