/**
 * CollectionScreen
 *
 * Koleksiyon albümü — toplanan kartlar, sticker'lar, hayvanlar vb.
 */

import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { MainLayout } from '@components/templates/MainLayout';
import { useCollectibles, useInventory } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CollectionCategory =
  | 'animals'
  | 'flags'
  | 'stickers'
  | 'characters'
  | 'landmarks'
  | 'foods'
  | 'vehicles';

// Etiketler i18n'den gelir (gamification.collection.categories, id'ye göre); burada yalnızca emoji.
const categories: { id: CollectionCategory; emoji: string }[] = [
  { id: 'animals', emoji: '🐾' },
  { id: 'flags', emoji: '🏳️' },
  { id: 'stickers', emoji: '⭐' },
  { id: 'characters', emoji: '🧙' },
  { id: 'landmarks', emoji: '🏛️' },
  { id: 'foods', emoji: '🍕' },
  { id: 'vehicles', emoji: '🚀' },
];

interface Collectible {
  id: string;
  name: string;
  emoji: string;
  rarity: string;
  collected: boolean;
  category: CollectionCategory;
}

const rarityGlow: Record<string, string> = {
  common: '',
  rare: 'ring-2 ring-nova-blue/30',
  epic: 'ring-2 ring-nova-purple/30',
  legendary: 'ring-2 ring-nova-orange/40 shadow-lg shadow-nova-orange/20',
};

export default function CollectionScreen() {
  const { t } = useTranslation('gamification');
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>('animals');
  const childId = useChildStore((s) => s.activeChild?.id);
  const openModal = useUIStore((s) => s.openModal);
  const { data: catalog } = useCollectibles(activeCategory);
  const { data: inventory } = useInventory(childId);

  const items: Collectible[] = useMemo(() => {
    if (!catalog || catalog.length === 0) {
      return [];
    }
    const ownedIds = new Set((inventory ?? []).map((i) => i.id));
    return catalog.map((c) => ({
      ...c,
      category: c.category as CollectionCategory,
      collected: ownedIds.has(c.id),
    }));
  }, [catalog, inventory]);

  const collectedCount = items.filter((i) => i.collected).length;
  const totalCount = items.length;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <Text variant="h3">{t('collection.title')}</Text>
          <Text variant="bodySmall" className="text-text-secondary">
            {t('collection.collected', { collected: collectedCount, total: totalCount })}
          </Text>
        </div>

        {/* Category Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-nova-purple text-white'
                  : 'text-text-secondary bg-gray-100'
              }`}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
            >
              <span>{cat.emoji}</span>
              {t(`collection.categories.${cat.id}`)}
            </button>
          ))}
        </div>

        {/* Collection Grid */}
        {items.length === 0 ? (
          <Card variant="filled" padding="lg">
            <div className="space-y-2 text-center">
              <span className="text-4xl">📦</span>
              <Text variant="body" weight="bold">
                {t('collection.empty')}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {t('collection.emptyDesc')}
              </Text>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  variant="elevated"
                  padding="sm"
                  pressable={item.collected}
                  onClick={() => {
                    if (!item.collected) return;
                    openModal('collectible', {
                      id: item.id,
                      name: item.name,
                      emoji: item.emoji,
                      rarity: item.rarity,
                      description: t('collection.itemDescription', { name: item.name }),
                      fact: t('collection.itemFact', {
                        category: categories.some((category) => category.id === item.category)
                          ? t(`collection.categories.${item.category}`)
                          : t('collection.fallbackCategory'),
                      }),
                    });
                  }}
                  className={`flex aspect-square items-center justify-center ${
                    item.collected ? rarityGlow[item.rarity] : 'opacity-30'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl">{item.collected ? item.emoji : '❓'}</span>
                    {item.collected && (
                      <Text variant="caption" weight="bold" className="mt-1 truncate">
                        {item.name}
                      </Text>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
