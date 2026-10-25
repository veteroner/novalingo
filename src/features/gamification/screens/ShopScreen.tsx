import { FeatureHeader } from '@components/molecules/FeatureHeader';
import {
  BirdIcon,
  FrameCornersIcon,
  LightningIcon,
  PaletteIcon,
  ShoppingCartIcon,
  SparkleIcon,
  StorefrontIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import { RewardIcon } from '@components/atoms/RewardIcon/RewardIcon';
import { ShopArtwork } from '../components/ItemArtwork';
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
import { useTranslation } from 'react-i18next';

type ShopCategory = 'avatars' | 'themes' | 'boosters' | 'frames' | 'effects' | 'nova';

const categories = [
  { id: 'avatars', icon: UserCircleIcon },
  { id: 'themes', icon: PaletteIcon },
  { id: 'boosters', icon: LightningIcon },
  { id: 'frames', icon: FrameCornersIcon },
  { id: 'effects', icon: SparkleIcon },
  { id: 'nova', icon: BirdIcon },
] as const;

interface DisplayShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: 'stars' | 'gems';
  imageUrl?: string;
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
      rarity: 'common',
    },
    {
      id: 'avatar_panda',
      name: 'Panda',
      category: 'avatars',
      price: 150,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'avatar_unicorn',
      name: 'Unicorn',
      category: 'avatars',
      price: 300,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'avatar_dragon',
      name: 'Ejderha',
      category: 'avatars',
      price: 500,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'avatar_astronaut',
      name: 'Astronot',
      category: 'avatars',
      price: 200,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'avatar_robot',
      name: 'Robot',
      category: 'avatars',
      price: 250,
      currency: 'stars',
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
      rarity: 'common',
    },
    {
      id: 'theme_space',
      name: 'Uzay',
      category: 'themes',
      price: 300,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'theme_forest',
      name: 'Orman',
      category: 'themes',
      price: 200,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'theme_candy',
      name: 'Şekerleme',
      category: 'themes',
      price: 250,
      currency: 'stars',
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
      rarity: 'common',
    },
    {
      id: 'boost_streak_freeze',
      name: 'Seri Koruyucu',
      category: 'boosters',
      price: 100,
      currency: 'gems',
      rarity: 'common',
    },
    {
      id: 'boost_hint_pack',
      name: 'İpucu Paketi (10x)',
      category: 'boosters',
      price: 80,
      currency: 'gems',
      rarity: 'common',
    },
    {
      id: 'boost_star_doubler',
      name: 'Yıldız 2x (1 gün)',
      category: 'boosters',
      price: 200,
      currency: 'gems',
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
      rarity: 'common',
    },
    {
      id: 'frame_rainbow',
      name: 'Gökkuşağı',
      category: 'frames',
      price: 300,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'frame_star',
      name: 'Yıldız Çerçeve',
      category: 'frames',
      price: 150,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'frame_crown',
      name: 'Taç Çerçeve',
      category: 'frames',
      price: 400,
      currency: 'gems',
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
      rarity: 'common',
    },
    {
      id: 'effect_confetti',
      name: 'Konfeti',
      category: 'effects',
      price: 150,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'effect_fireworks',
      name: 'Havai Fişek',
      category: 'effects',
      price: 250,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'effect_hearts',
      name: 'Kalpler',
      category: 'effects',
      price: 120,
      currency: 'stars',
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
      rarity: 'common',
    },
    {
      id: 'nova_hat_crown',
      name: 'Kral Tacı',
      category: 'nova',
      price: 400,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'nova_cape_red',
      name: 'Kırmızı Pelerin',
      category: 'nova',
      price: 250,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'nova_glasses',
      name: 'Güneş Gözlüğü',
      category: 'nova',
      price: 100,
      currency: 'stars',
      rarity: 'common',
    },
    {
      id: 'nova_wings',
      name: 'Melek Kanatları',
      category: 'nova',
      price: 500,
      currency: 'gems',
      rarity: 'epic',
    },
    {
      id: 'nova_scarf',
      name: 'Atkı',
      category: 'nova',
      price: 80,
      currency: 'stars',
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
  const { t, i18n } = useTranslation('shop');

  const items: DisplayShopItem[] = useMemo(() => {
    if (serverItems && serverItems.length > 0) {
      return serverItems.map((si) => ({
        id: si.id,
        name: i18n.language.startsWith('en') ? si.nameEn || si.name : si.name,
        category: si.category,
        price: si.price,
        currency: si.currency,
        imageUrl: si.imageUrl,
        rarity: si.isPremium ? 'epic' : 'common',
      }));
    }
    return defaultShopItems[activeCategory];
  }, [serverItems, activeCategory, i18n.language]);

  const handlePurchase = useCallback(
    (item: DisplayShopItem) => {
      if (!child || purchase.isPending) return;

      // Check balance
      const balance = item.currency === 'stars' ? child.stars : child.gems;
      if (balance < item.price) {
        showToast({
          type: 'error',
          title: t('screen.insufficientTitle'),
          message: t('screen.insufficientFunds', {
            name: item.name,
            currency: item.currency === 'gems' ? t('screen.gems') : t('screen.stars'),
          }),
        });
        return;
      }

      purchase.mutate(
        { childId: child.id, itemId: item.id },
        {
          onSuccess: () => {
            showToast({
              type: 'success',
              title: t('screen.purchaseSuccessTitle'),
              message: t('screen.purchaseSuccessMessage', { name: item.name }),
            });
          },
          onError: () => {
            showToast({
              type: 'error',
              title: t('screen.purchaseFailTitle'),
              message: t('screen.purchaseFailMessage'),
            });
          },
        },
      );
    },
    [child, purchase, showToast, t],
  );

  if (!child) return null;

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        <FeatureHeader
          title={t('screen.title')}
          icon={<StorefrontIcon size={28} weight="duotone" />}
        >
          <CurrencyDisplay stars={child.stars} gems={child.gems} compact />
        </FeatureHeader>

        {/* Category Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary-dark text-white'
                  : 'text-text-secondary bg-surface-elevated'
              }`}
              aria-pressed={activeCategory === cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(cat.id);
              }}
            >
              <cat.icon size={20} weight="duotone" aria-hidden="true" />
              {t(`screenCategories.${cat.id}`)}
            </motion.button>
          ))}
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card variant="filled" padding="lg">
            <div className="space-y-2 text-center">
              <ShoppingCartIcon
                size={48}
                weight="duotone"
                className="text-primary mx-auto"
                aria-hidden="true"
              />
              <Text variant="body" weight="bold">
                {t('screen.emptyTitle')}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {t('screen.emptyDesc')}
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
                    <div className="bg-surface-elevated mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-3xl">
                      <ShopArtwork id={item.id} category={item.category} source={item.imageUrl} />
                    </div>
                    <Text variant="bodySmall" weight="bold" className="min-h-10 break-words">
                      {t(`items.${item.id}`, { defaultValue: item.name })}
                    </Text>
                    <Badge
                      variant={item.currency === 'gems' ? 'gem' : 'star'}
                      size="md"
                      icon={<RewardIcon kind={item.currency} size={18} />}
                    >
                      {item.price}
                      <span className="sr-only"> {t(`screen.${item.currency}`)}</span>
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
                      {isBuying
                        ? t('screen.buying')
                        : canAfford
                          ? t('screen.buy')
                          : t('screen.insufficient')}
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
