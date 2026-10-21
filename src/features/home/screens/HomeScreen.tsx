/**
 * HomeScreen
 *
 * Ana sayfa — streak, günlük hedef, dünyalar, Nova maskotu, hızlı aksiyonlar.
 */

import { FREE_TIER } from '@/config/constants';
import type { World } from '@/types/content';
import { Badge } from '@components/atoms/Badge';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { CurrencyDisplay } from '@components/molecules/CurrencyDisplay';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { NovaHomeHero } from '../components/NovaHomeHero';
import {
  BookOpenIcon,
  ArrowRightIcon,
  TrophyIcon,
  FlagIcon,
  StorefrontIcon,
  CircleNotchIcon,
  FlameIcon,
} from '@phosphor-icons/react';
import { XPDisplay } from '@components/molecules/XPDisplay';
import { MainLayout } from '@components/templates/MainLayout';
import { SeasonalEventBanner } from '@features/gamification/components/SeasonalEventBanner';
import { curriculum } from '@features/learning/data/curriculum';
import { useLessonProgress, useVocabularyCards, useWorlds } from '@hooks/queries';
import { getReviewQueue } from '@services/srs/srsEngine';
import {
  getDailyLessonCount,
  isPremiumUser,
  isWorldPremiumLocked,
} from '@services/subscription/premiumAccess';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

// Build fallback worlds from in-memory curriculum
const curriculumWorlds: World[] = curriculum.map((w) => ({
  id: w.id,
  name: w.name,
  nameEn: w.nameEn,
  description: w.description,
  order: w.order,
  themeColor: w.themeColor,
  iconUrl: '',
  backgroundUrl: '',
  requiredLevel: w.requiredLevel,
  isPremium: w.isPremium,
  units: w.units.map((u) => u.id),
}));

export default function HomeScreen() {
  const child = useChildStore((s) => s.activeChild);
  const children = useChildStore((s) => s.children);
  const user = useAuthStore((s) => s.user);
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const { data: firestoreWorlds } = useWorlds();
  const { data: vocabCards } = useVocabularyCards(child?.id);
  const { data: lessonProgress } = useLessonProgress(child?.id);
  const dueCount = useMemo(
    () => (vocabCards ? getReviewQueue(vocabCards).length : 0),
    [vocabCards],
  );
  const lessonsToday = getDailyLessonCount(child, lessonProgress);
  const isPremium = isPremiumUser(user);

  // Otomatik streak-lost modal: seri kırılmışsa (currentStreak===0 ve daha önce bir seri vardıysa)
  // her profil için oturum başına yalnızca bir kez göster.
  useEffect(() => {
    if (!child) return;
    if (child.currentStreak === 0 && child.longestStreak > 2) {
      const storageKey = `streak_lost_shown_${child.id}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, '1');
        const timer = setTimeout(() => {
          openModal('streakLost');
        }, 1500);
        return () => {
          clearTimeout(timer);
        };
      }
    }
  }, [child, openModal]);
  const worlds = useMemo(
    () => (firestoreWorlds && firestoreWorlds.length > 0 ? firestoreWorlds : curriculumWorlds),
    [firestoreWorlds],
  );
  // "Nova ile Konuş" artık standalone /conversation route'una yönlenir.
  // Lesson hack (conversationLessonId) kaldırıldı.

  // Authenticated but no children → create profile first
  if (!child && children.length === 0) {
    return <Navigate to="/create-profile" replace />;
  }

  if (!child) {
    // children loaded but none selected → this shouldn't persist long
    // (ChildDataProvider auto-selects, but guard against race)
    return <Navigate to="/create-profile" replace />;
  }

  const currentWorldOrder = curriculum.find((w) => w.id === child.currentWorldId)?.order ?? 1;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Text variant="h3">{t('greeting', { name: child.name })}</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {t('subtitle')}
            </Text>
          </div>
          <CurrencyDisplay stars={child.stars} gems={child.gems} compact />
        </div>

        <NovaHomeHero
          stage={child.novaStage}
          worldName={
            curriculum.find((w) => w.id === child.currentWorldId)?.name ??
            t('worldMap.worldFallback')
          }
          onContinue={() => {
            void navigate(`/world/${child.currentWorldId}`);
          }}
          onVisitNova={() => {
            void navigate('/profile');
          }}
        />

        {/* Streak & XP */}
        <div className="flex gap-3">
          <Card variant="filled" padding="sm" className="flex-1">
            <div className="flex items-center gap-2">
              <FlameIcon size={28} weight="fill" className="text-streak" aria-hidden="true" />
              <div>
                <Text variant="h4" className="text-text">
                  {child.currentStreak}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {t('streakLabel')}
                </Text>
              </div>
            </div>
          </Card>
          <Card variant="filled" padding="sm" className="flex-1">
            {/* Ana sayfada kompakt rozet — streak kartıyla tek satır dengeli durur.
                İlerleme çubuğu (full varyant) Profil ekranında gösterilir. */}
            <XPDisplay currentXP={child.totalXP} level={child.level} compact />
          </Card>
        </div>

        {/* Seasonal Event Banner */}
        <SeasonalEventBanner />

        {/* Conversation Practice — Prominent CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            variant="elevated"
            pressable
            padding="md"
            onClick={() => navigate('/conversation/topics')}
            className="border-primary/15 bg-surface border"
          >
            <div className="flex items-center gap-4">
              <div className="bg-nova-blue/10 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                <NovaCharacter size="sm" mood="listening" decorative />
              </div>
              <div className="flex-1">
                <Text variant="body" weight="bold">
                  {t('conversation.title')}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {t('conversation.subtitle')}
                </Text>
              </div>
              <ArrowRightIcon size={22} className="text-primary" aria-hidden="true" />
            </div>
          </Card>
        </motion.div>

        {/* Daily Review — prominent CTA when cards are due */}
        {dueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              variant="elevated"
              pressable
              padding="md"
              onClick={() => navigate('/review')}
              className="border-nova-orange/20 border bg-linear-to-r from-orange-50 to-yellow-50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-nova-orange/10 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                  🧠
                </div>
                <div className="flex-1">
                  <Text variant="body" weight="bold">
                    {t('review.title')}
                  </Text>
                  <Text variant="caption" className="text-text-secondary">
                    {t('review.subtitle', { count: dueCount })}
                  </Text>
                </div>
                <Badge variant="warning" size="lg">
                  {dueCount}
                </Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: 'dailyWheel',
              icon: CircleNotchIcon,
              label: t('quickActions.dailyWheel'),
              description: t('quickActions.dailyWheelDesc'),
              onClick: () => {
                openModal('dailyWheel');
              },
            },
            {
              id: 'achievements',
              icon: TrophyIcon,
              label: t('quickActions.achievements'),
              description: t('quickActions.achievementsDesc'),
              onClick: () => navigate('/achievements'),
            },
            {
              id: 'quests',
              icon: FlagIcon,
              label: t('quickActions.quests'),
              description: t('quickActions.questsDesc'),
              onClick: () => navigate('/quests'),
            },
            {
              id: 'shop',
              icon: StorefrontIcon,
              label: t('quickActions.shop'),
              description: t('quickActions.shopDesc'),
              onClick: () => navigate('/shop'),
            },
            {
              id: 'stories',
              icon: BookOpenIcon,
              label: t('quickActions.stories'),
              description: t('quickActions.storiesDesc'),
              onClick: () => navigate('/stories'),
            },
          ].map((action) => (
            <Card
              key={action.id}
              variant="elevated"
              pressable
              padding="md"
              onClick={action.onClick}
            >
              <div className="space-y-1 text-center">
                <action.icon size={28} className="text-primary mx-auto" aria-hidden="true" />
                <Text variant="bodySmall" weight="bold">
                  {action.label}
                </Text>
                <Text variant="caption" className="text-text-secondary block">
                  {action.description}
                </Text>
              </div>
            </Card>
          ))}
        </div>

        {/* Worlds Preview */}
        <div>
          <Text variant="h4" className="mb-3">
            {t('worldsTitle')}
          </Text>
          <div className="space-y-3">
            {worlds.map((world) => {
              const isWorldLocked = world.order > currentWorldOrder;
              const isPremiumLocked = isWorldPremiumLocked(user, world);
              const isCurrent = child.currentWorldId === world.id;
              const isCompleted = world.order < currentWorldOrder;
              const curWorld = curriculum.find((w) => w.id === world.id);
              const emoji = curWorld?.emoji ?? '🌍';

              return (
                <Card
                  key={world.id}
                  variant={isWorldLocked || isPremiumLocked ? 'outlined' : 'elevated'}
                  pressable={!isWorldLocked && !isPremiumLocked}
                  padding="md"
                  onClick={() => {
                    if (isWorldLocked) return;
                    if (isPremiumLocked) {
                      showToast({
                        type: 'info',
                        title: t('premium.title'),
                        message: t('premium.message'),
                      });
                      void navigate('/subscription');
                      return;
                    }
                    void navigate(`/world/${world.id}`);
                  }}
                  className={isWorldLocked || isPremiumLocked ? 'opacity-60' : ''}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-success/20 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl">
                      {emoji}
                    </div>
                    <div className="flex-1">
                      <Text variant="body" weight="bold">
                        {world.name}
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        {world.description}
                        {isCurrent ? t('worldCard.current') : ''}
                      </Text>
                    </div>
                    {isWorldLocked || isPremiumLocked ? (
                      <span className="text-xl">🔒</span>
                    ) : isCurrent ? (
                      <Badge variant="success" size="sm">
                        {t('worldCard.active')}
                      </Badge>
                    ) : isCompleted ? (
                      <span className="text-xl">✅</span>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div className="flex-1">
                <Text variant="bodySmall" weight="bold">
                  {t('dailyGoal')}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {isPremium
                    ? t('dailyGoalUnlimited')
                    : t('dailyGoalProgress', {
                        current: lessonsToday,
                        target: FREE_TIER.DAILY_LESSONS,
                      })}
                </Text>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
