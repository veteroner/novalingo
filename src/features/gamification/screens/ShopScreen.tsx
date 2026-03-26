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

// Default items shown when server items are unavailable
const defaultShopItems: Record<ShopCategory, DisplayShopItem[]> = {
  avatars: [
    {
      id: 'avatar_fox',
      name: 'Tilki',
      category: 'avatars',
      price: 100,
      currency: 'stars',
      emoji: '🦊',
      rarity: 'common',
    },
    {
      id: 'avatar_panda',
      name: 'Panda',
      category: 'avatars',
      price: 150,
      currency: 'stars',
      emoji: '🐼',
      rarity: 'common',
    },
    {
      id: 'avatar_unicorn',
      name: 'Unicorn',
      category: 'avatars',
      price: 300,
      currency: 'gems',
      emoji: '🦄',
      rarity: 'epic',
    },
    {
      id: 'avatar_dragon',
      name: 'Ejderha',
      category: 'avatars',
      price: 500,
      currency: 'gems',
      emoji: '🐉',
      rarity: 'epic',
    },
    {
      id: 'avatar_astronaut',
      name: 'Astronot',
      category: 'avatars',
      price: 200,
      currency: 'stars',
      emoji: '🧑‍🚀',
      rarity: 'common',
    },
    {
      id: 'avatar_robot',
      name: 'Robot',
      category: 'avatars',
      price: 250,
      currency: 'stars',
      emoji: '🤖',
      rarity: 'common',
    },
  ],
  themes: [
    {
      id: 'theme_ocean',
      name: 'Okyanus',
      category: 'themes',
      price: 200,
      currency: 'stars',
      emoji: '🌊',
      rarity: 'common',
    },
    {
      id: 'theme_space',
      name: 'Uzay',
      category: 'themes',
      price: 300,
      currency: 'gems',
      emoji: '🚀',
      rarity: 'epic',
    },
    {
      id: 'theme_forest',
      name: 'Orman',
      category: 'themes',
      price: 200,
      currency: 'stars',
      emoji: '🌲',
      rarity: 'common',
    },
    {
      id: 'theme_candy',
      name: 'Şekerleme',
      category: 'themes',
      price: 250,
      currency: 'stars',
      emoji: '🍭',
      rarity: 'common',
    },
  ],
  boosters: [
    {
      id: 'boost_2x_xp',
      name: '2x XP (1 saat)',
      category: 'boosters',
      price: 150,
      currency: 'gems',
      emoji: '⚡',
      rarity: 'common',
    },
    {
      id: 'boost_streak_freeze',
      name: 'Seri Koruyucu',
      category: 'boosters',
      price: 100,
      currency: 'gems',
      emoji: '🛡️',
      rarity: 'common',
    },
    {
      id: 'boost_hint_pack',
      name: 'İpucu Paketi (10x)',
      category: 'boosters',
      price: 80,
      currency: 'gems',
      emoji: '💡',
      rarity: 'common',
    },
    {
      id: 'boost_star_doubler',
      name: 'Yıldız 2x (1 gün)',
      category: 'boosters',
      price: 200,
      currency: 'gems',
      emoji: '🌟',
      rarity: 'epic',
    },
  ],
  frames: [
    {
      id: 'frame_gold',
      name: 'Altın Çerçeve',
      category: 'frames',
      price: 200,
      currency: 'stars',
      emoji: '🖼️',
      rarity: 'common',
    },
    {
      id: 'frame_rainbow',
      name: 'Gökkuşağı',
      category: 'frames',
      price: 300,
      currency: 'gems',
      emoji: '🌈',
      rarity: 'epic',
    },
    {
      id: 'frame_star',
      name: 'Yıldız Çerçeve',
      category: 'frames',
      price: 150,
      currency: 'stars',
      emoji: '⭐',
      rarity: 'common',
    },
    {
      id: 'frame_crown',
      name: 'Taç Çerçeve',
      category: 'frames',
      price: 400,
      currency: 'gems',
      emoji: '👑',
      rarity: 'epic',
    },
  ],
  effects: [
    {
      id: 'effect_sparkle',
      name: 'Işıltı',
      category: 'effects',
      price: 100,
      currency: 'stars',
      emoji: '✨',
      rarity: 'common',
    },
    {
      id: 'effect_confetti',
      name: 'Konfeti',
      category: 'effects',
      price: 150,
      currency: 'stars',
      emoji: '🎊',
      rarity: 'common',
    },
    {
      id: 'effect_fireworks',
      name: 'Havai Fişek',
      category: 'effects',
      price: 250,
      currency: 'gems',
      emoji: '🎆',
      rarity: 'epic',
    },
    {
      id: 'effect_hearts',
      name: 'Kalpler',
      category: 'effects',
      price: 120,
      currency: 'stars',
      emoji: '💖',
      rarity: 'common',
    },
  ],
  nova: [
    {
      id: 'nova_hat_wizard',
      name: 'Büyücü Şapkası',
      category: 'nova',
      price: 200,
      currency: 'stars',
      emoji: '🧙',
      rarity: 'common',
    },
    {
      id: 'nova_hat_crown',
      name: 'Kral Tacı',
      category: 'nova',
      price: 400,
      currency: 'gems',
      emoji: '👑',
      rarity: 'epic',
    },
    {
      id: 'nova_cape_red',
      name: 'Kırmızı Pelerin',
      category: 'nova',
      price: 250,
      currency: 'stars',
      emoji: '🦸',
      rarity: 'common',
    },
    {
      id: 'nova_glasses',
      name: 'Güneş Gözlüğü',
      category: 'nova',
      price: 100,
      currency: 'stars',
      emoji: '😎',
      rarity: 'common',
    },
    {
      id: 'nova_wings',
      name: 'Melek Kanatları',
      category: 'nova',
      price: 500,
      currency: 'gems',
      emoji: '😇',
      rarity: 'epic',
    },
    {
      id: 'nova_scarf',
      name: 'Atkı',
      category: 'nova',
      price: 80,
      currency: 'stars',
      emoji: '🧣',
      rarity: 'common',
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
    return defaultShopItems[activeCategory] ?? [];
  }, [serverItems, activeCategory]);

  const handlePurchase = useCallback(
    (item: DisplayShopItem) => {
      if (!child || purchase.isPending) return;

      // Check balance
      const balance = item.currency === 'stars' ? child.stars : child.gems;
      if (balance < item.price) {
        showToast({
          type: 'error',
          title: 'Yetersiz bakiye',
          message: `${item.name} için yeterli ${item.currency === 'gems' ? 'elmas' : 'yıldız'} yok.`,
        });
        return;
      }

      purchase.mutate(
        { childId: child.id, itemId: item.id },
        {
          onSuccess: () => {
            showToast({
              type: 'success',
              title: 'Satın alındı! 🎉',
              message: `${item.name} koleksiyonuna eklendi.`,
            });
          },
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
        {items.length === 0 ? (
          <Card variant="filled" padding="lg">
            <div className="space-y-2 text-center">
              <span className="text-4xl">🛒</span>
              <Text variant="body" weight="bold">
                Bu kategoride henüz ürün yok
              </Text>
              <Text variant="caption" className="text-text-secondary">
                Ders tamamla ve yıldız kazan — yeni ürünler açılacak!
              </Text>
            </div>
          </Card>
        ) : (
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
        )}
      </div>
    </MainLayout>
  );
}
