import { FeatureHeader } from '@components/molecules/FeatureHeader';
import {
  BirdIcon,
  BuildingsIcon,
  FlagIcon,
  PackageIcon,
  PawPrintIcon,
  PizzaIcon,
  QuestionIcon,
  RocketIcon,
  StickerIcon,
  TreasureChestIcon,
} from '@phosphor-icons/react';
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

const categories = [
  { id: 'animals', icon: PawPrintIcon },
  { id: 'flags', icon: FlagIcon },
  { id: 'stickers', icon: StickerIcon },
  { id: 'characters', icon: BirdIcon },
  { id: 'landmarks', icon: BuildingsIcon },
  { id: 'foods', icon: PizzaIcon },
  { id: 'vehicles', icon: RocketIcon },
] as const;

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
        <FeatureHeader
          title={t('collection.title')}
          description={t('collection.collected', { collected: collectedCount, total: totalCount })}
          icon={<TreasureChestIcon size={28} weight="duotone" />}
        />

        {/* Category Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary-dark text-white'
                  : 'text-text-secondary bg-surface-elevated'
              }`}
              aria-pressed={activeCategory === cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
            >
              <cat.icon size={20} weight="duotone" aria-hidden="true" />
              {t(`collection.categories.${cat.id}`)}
            </button>
          ))}
        </div>

        {/* Collection Grid */}
        {items.length === 0 ? (
          <Card variant="filled" padding="lg">
            <div className="space-y-2 text-center">
              <PackageIcon
                size={48}
                weight="duotone"
                className="text-primary mx-auto"
                aria-hidden="true"
              />
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
                    <span className="inline-flex text-4xl" aria-hidden="true">
                      {item.collected ? item.emoji : <QuestionIcon size={40} weight="duotone" />}
                    </span>
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
