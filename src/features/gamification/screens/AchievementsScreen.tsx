/**
 * AchievementsScreen
 *
 * Başarımlar — kategorize edilmiş, açık/kilitli, nadir ışıltısı.
 */

import { Badge } from '@components/atoms/Badge';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { MainLayout } from '@components/templates/MainLayout';
import { useAchievementCatalog, useAchievements } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

type AchCategory = 'all' | 'learning' | 'streak' | 'collection' | 'social' | 'special';

const categories: { id: AchCategory; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'learning', label: '📚 Öğrenme' },
  { id: 'streak', label: '🔥 Seri' },
  { id: 'collection', label: '📦 Toplama' },
  { id: 'social', label: '🤝 Sosyal' },
  { id: 'special', label: '⭐ Özel' },
];

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  category: AchCategory;
  unlocked: boolean;
  progress: number;
  target: number;
}

// Fallback data
const fallbackAchievements: AchievementItem[] = [
  {
    id: '1',
    title: 'İlk Adım',
    description: 'İlk dersini tamamla',
    icon: '👣',
    rarity: 'common',
    category: 'learning',
    unlocked: true,
    progress: 1,
    target: 1,
  },
  {
    id: '2',
    title: 'Kelime Avcısı',
    description: '50 kelime öğren',
    icon: '🎯',
    rarity: 'rare',
    category: 'learning',
    unlocked: true,
    progress: 50,
    target: 50,
  },
  {
    id: '3',
    title: 'Ateş Serisi',
    description: '7 gün üst üste oyna',
    icon: '🔥',
    rarity: 'rare',
    category: 'streak',
    unlocked: false,
    progress: 4,
    target: 7,
  },
  {
    id: '4',
    title: 'Mükemmeliyetci',
    description: '10 mükemmel ders',
    icon: '💎',
    rarity: 'epic',
    category: 'learning',
    unlocked: false,
    progress: 3,
    target: 10,
  },
  {
    id: '5',
    title: 'Efsane',
    description: "Seviye 50'ye ulaş",
    icon: '👑',
    rarity: 'legendary',
    category: 'special',
    unlocked: false,
    progress: 12,
    target: 50,
  },
  {
    id: '6',
    title: 'Sosyal Kelebek',
    description: 'Liderlik tablosunda Top 10',
    icon: '🦋',
    rarity: 'epic',
    category: 'social',
    unlocked: false,
    progress: 0,
    target: 1,
  },
];

const rarityStyles: Record<string, string> = {
  common: 'border-gray-200',
  rare: 'border-nova-blue/50',
  epic: 'border-nova-purple/50',
  legendary: 'border-nova-orange/50',
};

export default function AchievementsScreen() {
  const [activeCategory, setActiveCategory] = useState<AchCategory>('all');
  const childId = useChildStore((s) => s.activeChild?.id);
  const { data: catalog } = useAchievementCatalog();
  const { data: userAchs } = useAchievements(childId);

  const achievements: AchievementItem[] = useMemo(() => {
    if (!catalog || catalog.length === 0) return fallbackAchievements;
    const unlockedIds = new Set((userAchs ?? []).map((a) => a.achievementId));
    return catalog.map((a) => ({
      id: a.id,
      title: a.name,
      description: a.description,
      icon: a.icon,
      rarity: a.rarity,
      category: a.category as AchCategory,
      unlocked: unlockedIds.has(a.id),
      progress: 0,
      target: a.target,
    }));
  }, [catalog, userAchs]);

  const filteredAchievements =
    activeCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <Text variant="h3">🏆 Başarımlar</Text>
          <Text variant="bodySmall" className="text-text-secondary">
            {unlockedCount}/{achievements.length} başarım açıldı
          </Text>
        </div>

        {/* Category Filter */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-nova-blue text-white'
                  : 'text-text-secondary bg-gray-100'
              }`}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievement List */}
        <div className="space-y-3">
          {filteredAchievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                variant="outlined"
                padding="md"
                className={`border-2 ${rarityStyles[ach.rarity]} ${!ach.unlocked ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0 text-3xl">{ach.unlocked ? ach.icon : '🔒'}</div>
                  <div className="min-w-0 flex-1">
                    <Text variant="bodySmall" weight="bold" truncate>
                      {ach.title}
                    </Text>
                    <Text variant="caption" className="text-text-secondary">
                      {ach.description}
                    </Text>
                    {!ach.unlocked && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar
                          value={ach.progress / ach.target}
                          size="xs"
                          className="flex-1"
                        />
                        <Text
                          variant="caption"
                          weight="bold"
                          className="text-text-secondary shrink-0"
                        >
                          {ach.progress}/{ach.target}
                        </Text>
                      </div>
                    )}
                  </div>
                  {ach.unlocked && (
                    <Badge variant="success" size="sm">
                      ✓
                    </Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
