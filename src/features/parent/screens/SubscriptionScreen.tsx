/**
 * SubscriptionScreen
 *
 * Abonelik yönetimi — mevcut plan, premium özellikleri, plan seçimi ve satın alma.
 * Ebeveyn panelinden erişilir.
 *
 * Satın alma akışı:
 *  1. Kullanıcı plan seçer (aylık / yıllık).
 *  2. "7 Gün Ücretsiz Dene" butonuna basar.
 *  3. subscriptionService.purchaseSubscription() çağrılır.
 *  4. Native: App Store / Google Play abonelik sayfası açılır.
 *  5. Sunucu webhook'u aboneliği onaylar ve Firestore'da isPremium = true yapar.
 *  6. Yenileme sırasında: "Geri Yükle" butonu kullanılır.
 */

import {
  IAP_PRODUCTS,
  IOS_MANAGE_SUBSCRIPTIONS_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '@/config/constants';
import { Capacitor } from '@capacitor/core';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { MainLayout } from '@components/templates/MainLayout';
import { purchaseSubscription, restorePurchases } from '@services/subscription/subscriptionService';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PREMIUM_FEATURES = [
  { emoji: '🌍', text: 'Tüm dünyalara erişim (6+ dünya)' },
  { emoji: '♾️', text: 'Sınırsız ders' },
  { emoji: '🚫', text: 'Reklam yok' },
  { emoji: '📶', text: 'Offline öğrenme' },
  { emoji: '📊', text: 'Detaylı ebeveyn raporu' },
  { emoji: '🦉', text: "Nova'nın tüm evrimleri" },
  { emoji: '👨‍👩‍👧‍👦', text: '5 çocuk profili' },
  { emoji: '⚡', text: 'Günde 1 saat 2x XP' },
] as const;

const PLANS = [
  {
    id: IAP_PRODUCTS.MONTHLY,
    key: 'monthly',
    label: 'Aylık',
    priceTRY: '₺149.99',
    period: '/ay',
    highlighted: false,
  },
  {
    id: IAP_PRODUCTS.YEARLY,
    key: 'yearly',
    label: 'Yıllık',
    priceTRY: '₺899.99',
    period: '/yıl',
    highlighted: true,
    badge: '%50 Tasarruf',
    monthlyEquiv: '₺74.99/ay',
  },
] as const;

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const child = useChildStore((s) => s.activeChild);
  const showToast = useUIStore((s) => s.showToast);
  const isPremium = user?.isPremium ?? false;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(IAP_PRODUCTS.YEARLY);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const platform = Capacitor.getPlatform();
  const isNativePlatform = platform === 'ios' || platform === 'android';

  async function handlePurchase() {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await purchaseSubscription(
        selectedPlanId as (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS],
      );
      if (result.status === 'success') {
        showToast({
          type: 'success',
          title: 'Abonelik Aktif!',
          message: 'NovaLingo Plus başladı.',
        });
      } else if (result.status === 'store_redirect') {
        showToast({
          type: 'info',
          title: 'Mağaza Açıldı',
          message: isNativePlatform
            ? 'Aboneliğinizi mağaza üzerinden tamamlayın. İşlem sonrasında "Geri Yükle" butonuna basın.'
            : 'Uygulamayı mobil cihazınızdan indirerek abone olabilirsiniz.',
        });
      } else if (result.status === 'cancelled') {
        // User cancelled — no toast needed
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message });
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.status === 'success') {
        showToast({
          type: 'success',
          title: 'Abonelik Bulundu!',
          message: 'Premium erişiminiz yeniden etkinleştirildi.',
        });
        navigate(-1);
      } else {
        showToast({
          type: 'error',
          title: 'Abonelik Bulunamadı',
          message: result.status === 'error' ? result.message : 'Aktif abonelik bulunamadı.',
        });
      }
    } finally {
      setRestoring(false);
    }
  }

  return (
    <MainLayout showNavigation={false}>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h3">💳 Abonelik</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {isPremium ? 'Premium üye' : 'Ücretsiz Plan'}
            </Text>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            Geri
          </Button>
        </div>

        {/* Current Plan */}
        <Card variant={isPremium ? 'elevated' : 'outlined'} padding="md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isPremium ? '⭐' : '🆓'}</span>
            <div className="flex-1">
              <Text variant="body" weight="bold">
                {isPremium ? 'NovaLingo Plus' : 'Ücretsiz Plan'}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {isPremium
                  ? 'Tüm özelliklere erişiminiz var'
                  : 'İlk 2 dünya, günde 5 ders, reklamlı'}
              </Text>
            </div>
            {isPremium && (
              <span className="bg-success/20 text-success rounded-full px-3 py-1 text-xs font-bold">
                Aktif
              </span>
            )}
          </div>
        </Card>

        {/* Upgrade flow — shown only for free users */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Text variant="h4" align="center">
              ⭐ NovaLingo Plus
            </Text>

            {/* Feature list */}
            <Card variant="glass" padding="md">
              <div className="space-y-3">
                {PREMIUM_FEATURES.map((feat) => (
                  <div key={feat.text} className="flex items-center gap-3">
                    <span className="text-lg">{feat.emoji}</span>
                    <Text variant="bodySmall">{feat.text}</Text>
                  </div>
                ))}
              </div>
            </Card>

            {/* Plan picker */}
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <button
                    key={plan.key}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="text-left"
                  >
                    <Card
                      variant={isSelected ? 'elevated' : 'outlined'}
                      padding="md"
                      className={isSelected ? 'ring-nova-blue ring-2' : ''}
                    >
                      <div className="space-y-2 text-center">
                        {plan.highlighted && plan.badge && (
                          <span className="bg-nova-orange inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white">
                            {plan.badge}
                          </span>
                        )}
                        <Text variant="body" weight="bold">
                          {plan.label}
                        </Text>
                        <Text variant="h3" className="text-nova-blue">
                          {plan.priceTRY}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {plan.period}
                        </Text>
                        {'monthlyEquiv' in plan && plan.monthlyEquiv && (
                          <Text variant="caption" className="text-success font-semibold">
                            {plan.monthlyEquiv}
                          </Text>
                        )}
                        {isSelected && (
                          <span className="text-nova-blue block text-xs font-semibold">
                            ✔ Seçildi
                          </span>
                        )}
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>

            {/* Primary CTA */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? 'İşleniyor…' : '7 Gün Ücretsiz Dene'}
            </Button>
            <Text variant="caption" align="center" className="text-text-secondary">
              7 günlük deneme süresi sonunda seçtiğiniz plan üzerinden ücretlendirilirsiniz.
              İstediğiniz zaman iptal edebilirsiniz.
            </Text>

            {/* Restore */}
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleRestore}
              disabled={restoring}
            >
              {restoring ? 'Kontrol ediliyor…' : 'Satın alma geçmişini geri yükle'}
            </Button>
          </motion.div>
        )}

        {/* Premium user: subscription management */}
        {isPremium && (
          <div className="space-y-4">
            <Card variant="elevated" padding="md">
              <div className="space-y-3">
                <Text variant="h4">Plan Detayları</Text>
                <div className="flex justify-between">
                  <Text variant="bodySmall" className="text-text-secondary">
                    Plan
                  </Text>
                  <Text variant="bodySmall" weight="bold">
                    NovaLingo Plus
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text variant="bodySmall" className="text-text-secondary">
                    Durum
                  </Text>
                  <Text variant="bodySmall" weight="bold" className="text-success">
                    Aktif
                  </Text>
                </div>
                {child && (
                  <div className="flex justify-between">
                    <Text variant="bodySmall" className="text-text-secondary">
                      Aktif Profil
                    </Text>
                    <Text variant="bodySmall" weight="bold">
                      {child.name}
                    </Text>
                  </div>
                )}
              </div>
            </Card>

            <Card variant="outlined" padding="md">
              <div className="space-y-3 text-center">
                <Text variant="bodySmall" className="text-text-secondary">
                  Aboneliğinizi{' '}
                  {platform === 'ios'
                    ? 'App Store'
                    : platform === 'android'
                      ? 'Google Play'
                      : 'mağaza'}{' '}
                  üzerinden yönetebilirsiniz.
                </Text>
                {platform === 'ios' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(IOS_MANAGE_SUBSCRIPTIONS_URL, '_system')}
                  >
                    App Store Aboneliklerini Yönet
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Legal links */}
        <div className="flex justify-center gap-4 pt-2">
          <button
            className="text-text-secondary text-xs underline"
            onClick={() => window.open(PRIVACY_POLICY_URL, '_blank', 'noopener,noreferrer')}
          >
            Gizlilik Politikası
          </button>
          <button
            className="text-text-secondary text-xs underline"
            onClick={() => window.open(TERMS_OF_SERVICE_URL, '_blank', 'noopener,noreferrer')}
          >
            Kullanım Koşulları
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
