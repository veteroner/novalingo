/**
 * ShopScreen
 *
 * Mağaza — Avatar, tema, güçlendirici, çerçeve vb.
 * Yıldız ve gem ile satın alma.
 */

import { Badge } from '@components/atoms/Badge';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { CurrencyDisplay } from '@components/molecules/CurrencyDisplay';
import { MainLayout } from '@components/templates/MainLayout';
import { usePurchaseItem, useShopItems } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';

type ShopCategory = 'avatars' | 'themes' | 'boosters' | 'frames' | 'effects' | 'nova';

const categories: { id: ShopCategory; label: string; emoji: string }[] = [
  { id: 'avatars', label: 'Avatar', emoji: '👤' },
  { id: 'themes', label: 'Tema', emoji: '🎨' },
  { id: 'boosters', label: 'Güçlendirici', emoji: '⚡' },
  { id: 'frames', label: 'Çerçeve', emoji: '🖼️' },
  { id: 'effects', label: 'Efekt', emoji: '✨' },
  { id: 'nova', label: 'Nova', emoji: '🦉' },
];

interface DisplayShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: 'stars' | 'gems';
  emoji: string;
  rarity: string;
}

// Fallback mock items per category
const fallbackItems: Record<string, DisplayShopItem[]> = {
  avatars: [
    {
      id: 'a1',
      name: 'Kaplan',
      category: 'avatars',
      price: 100,
      currency: 'stars',
      emoji: '🐯',
      rarity: 'common',
    },
    {
      id: 'a2',
      name: 'Panda',
      category: 'avatars',
      price: 200,
      currency: 'stars',
      emoji: '🐼',
      rarity: 'rare',
    },
    {
      id: 'a3',
      name: 'Ejderha',
      category: 'avatars',
      price: 15,
      currency: 'gems',
      emoji: '🐉',
      rarity: 'epic',
    },
    {
      id: 'a4',
      name: 'Unicorn',
      category: 'avatars',
      price: 30,
      currency: 'gems',
      emoji: '🦄',
      rarity: 'legendary',
    },
  ],
  themes: [
    {
      id: 't1',
      name: 'Okyanus',
      category: 'themes',
      price: 150,
      currency: 'stars',
      emoji: '🌊',
      rarity: 'common',
    },
    {
      id: 't2',
      name: 'Uzay',
      category: 'themes',
      price: 250,
      currency: 'stars',
      emoji: '🚀',
      rarity: 'rare',
    },
    {
      id: 't3',
      name: 'Orman',
      category: 'themes',
      price: 100,
      currency: 'stars',
      emoji: '🌲',
      rarity: 'common',
    },
  ],
  boosters: [
    {
      id: 'b1',
      name: '2x XP (1 saat)',
      category: 'boosters',
      price: 50,
      currency: 'stars',
      emoji: '⚡',
      rarity: 'common',
    },
    {
      id: 'b2',
      name: 'Seri Koruma',
      category: 'boosters',
      price: 10,
      currency: 'gems',
      emoji: '🛡️',
      rarity: 'rare',
    },
    {
      id: 'b3',
      name: 'İpucu Paketi',
      category: 'boosters',
      price: 30,
      currency: 'stars',
      emoji: '💡',
      rarity: 'common',
    },
  ],
  frames: [
    {
      id: 'f1',
      name: 'Yıldız',
      category: 'frames',
      price: 80,
      currency: 'stars',
      emoji: '⭐',
      rarity: 'common',
    },
    {
      id: 'f2',
      name: 'Ateş',
      category: 'frames',
      price: 200,
      currency: 'stars',
      emoji: '🔥',
      rarity: 'rare',
    },
  ],
  effects: [
    {
      id: 'e1',
      name: 'Konfeti',
      category: 'effects',
      price: 120,
      currency: 'stars',
      emoji: '🎊',
      rarity: 'common',
    },
    {
      id: 'e2',
      name: 'Havai Fişek',
      category: 'effects',
      price: 20,
      currency: 'gems',
      emoji: '🎆',
      rarity: 'epic',
    },
  ],
  nova: [
    {
      id: 'n1',
      name: 'Şapka',
      category: 'nova',
      price: 150,
      currency: 'stars',
      emoji: '🎩',
      rarity: 'common',
    },
    {
      id: 'n2',
      name: 'Gözlük',
      category: 'nova',
      price: 100,
      currency: 'stars',
      emoji: '🕶️',
      rarity: 'common',
    },
    {
      id: 'n3',
      name: 'Kanatlar',
      category: 'nova',
      price: 25,
      currency: 'gems',
      emoji: '🪽',
      rarity: 'epic',
    },
  ],
};

export default function ShopScreen() {
  const child = useChildStore((s) => s.activeChild);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('avatars');
  const { data: serverItems } = useShopItems(activeCategory);
  const purchase = usePurchaseItem();
  const showToast = useUIStore((s) => s.showToast);

  const items: DisplayShopItem[] = useMemo(() => {
    if (serverItems && serverItems.length > 0) {
      return serverItems.map((si) => ({
        id: si.id,
        name: si.name,
        category: si.category,
        price: si.price,
        currency: si.currency,
        emoji: si.imageUrl || '🛍️',
        rarity: si.isPremium ? 'epic' : 'common',
      }));
    }
    return fallbackItems[activeCategory] ?? [];
  }, [serverItems, activeCategory]);

  const handlePurchase = useCallback(
    (item: DisplayShopItem) => {
      if (!child || purchase.isPending) return;

      // Check balance
      const balance = item.currency === 'stars' ? child.stars : child.gems;
      if (balance < item.price) return;

      purchase.mutate(
        { childId: child.id, itemId: item.id },
        {
          onError: () => {
            showToast({
              type: 'error',
              title: 'Satın alma başarısız',
              message: 'Bir hata oluştu, lütfen tekrar dene.',
            });
          },
        },
      );
    },
    [child, purchase, showToast],
  );

  if (!child) return null;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Text variant="h3">🛒 Mağaza</Text>
          <CurrencyDisplay stars={child.stars} gems={child.gems} compact />
        </div>

        {/* Category Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-nova-blue text-white'
                  : 'text-text-secondary bg-gray-100'
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const balance = item.currency === 'stars' ? child.stars : child.gems;
            const canAfford = balance >= item.price;
            const isBuying = purchase.isPending;

            return (
              <Card key={item.id} variant="elevated" padding="sm">
                <div className="space-y-2 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                    {item.emoji}
                  </div>
                  <Text variant="bodySmall" weight="bold" truncate>
                    {item.name}
                  </Text>
                  <Badge variant={item.currency === 'gems' ? 'gem' : 'star'} size="sm">
                    {item.price} {item.currency === 'gems' ? '💎' : '⭐'}
                  </Badge>
                  <Button
                    variant={canAfford ? 'primary' : 'secondary'}
                    size="sm"
                    fullWidth
                    disabled={!canAfford || isBuying}
                    onClick={() => {
                      handlePurchase(item);
                    }}
                  >
                    {isBuying ? '...' : canAfford ? 'Satın Al' : 'Yetersiz'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
