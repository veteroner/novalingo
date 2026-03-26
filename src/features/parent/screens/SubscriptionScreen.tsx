/**
 * SubscriptionScreen
 *
 * Abonelik yönetimi — mevcut plan, premium özellikleri, plan değişikliği.
 * Ebeveyn panelinden erişilir.
 */

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { MainLayout } from '@components/templates/MainLayout';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
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
    id: 'monthly',
    label: 'Aylık',
    priceTRY: '₺149.99',
    priceUSD: '$4.99',
    period: '/ay',
    highlighted: false,
  },
  {
    id: 'yearly',
    label: 'Yıllık',
    priceTRY: '₺899.99',
    priceUSD: '$29.99',
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

        {/* Premium Features */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Text variant="h4" align="center">
              ⭐ NovaLingo Plus
            </Text>
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

            {/* Plans */}
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  variant={plan.highlighted ? 'elevated' : 'outlined'}
                  padding="md"
                  className={plan.highlighted ? 'ring-nova-blue ring-2' : ''}
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
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Yakında Aktif',
                  message:
                    'Abonelik sistemi çok yakında devreye girecek. Şimdilik tüm içerikler ücretsiz!',
                });
              }}
            >
              7 Gün Ücretsiz Dene
            </Button>
            <Text variant="caption" align="center" className="text-text-secondary">
              İstediğin zaman iptal et. Deneme süresi sonunda ücretlendirilir.
            </Text>
          </motion.div>
        )}

        {/* Premium user: management */}
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
                      Profiller
                    </Text>
                    <Text variant="bodySmall" weight="bold">
                      {child.name}
                    </Text>
                  </div>
                )}
              </div>
            </Card>

            <Card variant="outlined" padding="md">
              <div className="space-y-2 text-center">
                <Text variant="bodySmall" className="text-text-secondary">
                  Aboneliğinizi App Store veya Google Play üzerinden yönetebilirsiniz.
                </Text>
              </div>
            </Card>
          </div>
        )}

        {/* Legal links */}
        <div className="flex justify-center gap-4 pt-2">
          <Text variant="caption" className="text-text-secondary underline">
            Gizlilik Politikası
          </Text>
          <Text variant="caption" className="text-text-secondary underline">
            Kullanım Koşulları
          </Text>
        </div>
      </div>
    </MainLayout>
  );
}
