/**
 * HomeScreen
 *
 * Ana sayfa — streak, günlük hedef, dünyalar, Nova maskotu, hızlı aksiyonlar.
 */

import type { World } from '@/types/content';
import { Badge } from '@components/atoms/Badge';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { CurrencyDisplay } from '@components/molecules/CurrencyDisplay';
import { NovaStageAvatar } from '@components/molecules/NovaStageAvatar';
import { XPDisplay } from '@components/molecules/XPDisplay';
import { MainLayout } from '@components/templates/MainLayout';
import { curriculum } from '@features/learning/data/curriculum';
import { useWorlds } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
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
  const openModal = useUIStore((s) => s.openModal);
  const navigate = useNavigate();
  const { data: firestoreWorlds } = useWorlds();

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
        return () => clearTimeout(timer);
      }
    }
  }, [child?.id, child?.currentStreak, child?.longestStreak, openModal]);
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

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Text variant="h3">Merhaba, {child.name}! 👋</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              Bugün ne öğrenmek istersin?
            </Text>
          </div>
          <CurrencyDisplay stars={child.stars} gems={child.gems} compact />
        </div>

        {/* Streak & XP */}
        <div className="flex gap-3">
          <Card variant="filled" padding="sm" className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <Text variant="h4" className="text-nova-orange">
                  {child.currentStreak}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  Gün Seri
                </Text>
              </div>
            </div>
          </Card>
          <Card variant="filled" padding="sm" className="flex-1">
            <XPDisplay currentXP={child.totalXP} level={child.level} compact />
          </Card>
        </div>

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
            onClick={() => navigate('/conversation')}
            className="border-nova-blue/20 border bg-linear-to-r from-purple-50 to-blue-50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-nova-blue/10 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                🎭
              </div>
              <div className="flex-1">
                <Text variant="body" weight="bold">
                  Nova ile Konuş
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  Birebir konuşma pratiği yap — her gün yeni senaryolar!
                </Text>
              </div>
              <span className="text-nova-blue text-xl">→</span>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              emoji: '📚',
              label: 'Devam Et',
              description: 'Bulunduğun dünyaya dön',
              onClick: () => navigate(`/world/${child.currentWorldId}`),
            },
            {
              emoji: '🎰',
              label: 'Günlük Çark',
              description: 'Günlük ödülünü çevir',
              onClick: () => openModal('dailyWheel'),
            },
            {
              emoji: '🏆',
              label: 'Başarımlar',
              description: 'Açtığın rozetleri gör',
              onClick: () => navigate('/achievements'),
            },
            {
              emoji: '⚔️',
              label: 'Görevler',
              description: 'Günlük görevleri tamamla',
              onClick: () => navigate('/quests'),
            },
            {
              emoji: '🛒',
              label: 'Mağaza',
              description: 'Nova için yeni eşyalar',
              onClick: () => navigate('/shop'),
            },
            {
              emoji: '📖',
              label: 'Hikayeler',
              description: 'İngilizce hikaye oku',
              onClick: () => navigate('/stories'),
            },
          ].map((action) => (
            <Card
              key={action.label}
              variant="elevated"
              pressable
              padding="md"
              onClick={action.onClick}
            >
              <div className="space-y-1 text-center">
                <span className="text-3xl">{action.emoji}</span>
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
            Dünyalar 🌍
          </Text>
          <div className="space-y-3">
            {worlds.map((world) => {
              const isLocked = child.level < world.requiredLevel;
              const isCurrent = child.currentWorldId === world.id;
              const curWorld = curriculum.find((w) => w.id === world.id);
              const emoji = curWorld?.emoji ?? '🌍';

              return (
                <Card
                  key={world.id}
                  variant={isLocked ? 'outlined' : 'elevated'}
                  pressable={!isLocked}
                  padding="md"
                  onClick={() => !isLocked && navigate(`/world/${world.id}`)}
                  className={isLocked ? 'opacity-60' : ''}
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
                        {isCurrent ? ' · Devam ediyor' : ''}
                      </Text>
                    </div>
                    {isLocked ? (
                      <span className="text-xl">🔒</span>
                    ) : isCurrent ? (
                      <Badge variant="success" size="sm">
                        Aktif
                      </Badge>
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
                  Günlük Hedef
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {child.completedLessons % 3} / 3 ders tamamlandı
                </Text>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Nova Companion — interactive SVG */}
      <motion.div
        className="fixed right-4 z-30"
        style={{ bottom: 'calc(var(--spacing-nav-height) + var(--spacing-safe-bottom) + 0.5rem)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
      >
        <motion.button
          className="relative cursor-pointer touch-manipulation"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/profile')}
        >
          <NovaStageAvatar stage={child.novaStage} size="sm" />
          {/* Speech bubble */}
          <motion.div
            className="absolute right-0 bottom-full mb-2 max-w-44 min-w-28 rounded-2xl rounded-br-sm border border-gray-100 bg-white px-3 py-2 shadow-lg"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 400, damping: 20 }}
          >
            <p className="text-text-primary text-xs font-semibold">
              Bugün harika bir gün olacak! 🌟
            </p>
          </motion.div>
        </motion.button>
      </motion.div>
    </MainLayout>
  );
}
