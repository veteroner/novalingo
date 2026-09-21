/**
 * SubscriptionScreen
 *
 * Abonelik yönetimi — mevcut plan, premium özellikleri, plan seçimi ve satın alma.
 * Ebeveyn panelinden erişilir.
 *
 * Satın alma akışı:
 *  1. Kullanıcı plan seçer (aylık / yıllık).
 *  2. CTA'ya basar (deneme süresi mağazada tanımlıysa "N Gün Ücretsiz Dene").
 *  3. subscriptionService.purchaseSubscription() çağrılır.
 *  4. Native: App Store / Google Play abonelik sayfası açılır.
 *  5. Backend doğrulaması verified entitlement kaydını günceller.
 *  6. Firestore projection premium erişimi açar; gecikirse "Geri Yükle" kullanılabilir.
 */

import {
  ANDROID_MANAGE_SUBSCRIPTIONS_URL,
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
import {
  trackSubscriptionPaywallViewed,
  trackSubscriptionRestoreCompleted,
  trackSubscriptionRestoreFailed,
  trackSubscriptionTrialStarted,
} from '@services/analytics';
import {
  getProductPricing,
  onProductsUpdated,
  purchaseSubscription,
  restorePurchases,
  type ProductPricing,
} from '@services/subscription/subscriptionService';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Metinler i18n'den gelir (parent.subscription.*); burada emoji/anahtar.
// ÖNEMLİ: Bu liste yalnızca uygulamada GERÇEKTEN zorlanan faydaları içerir
// (docs/MONETIZATION.md). Uygulanmayan bir fayda buraya eklenmemelidir —
// mağaza metni ile davranış birebir eşleşmek zorundadır.
const PREMIUM_FEATURES = [
  { emoji: '🌍', key: 'allWorlds' },
  { emoji: '♾️', key: 'unlimited' },
  { emoji: '🚫', key: 'noAds' },
  { emoji: '📊', key: 'report' },
  { emoji: '👨‍👩‍👧‍👦', key: 'profiles' },
] as const;

// Fiyatlar mağazadan (App Store Connect / Play Console) okunur.
// `fallbackPrice` yalnızca ürün bilgisi henüz yüklenmediğinde gösterilir.
const PLANS = [
  {
    id: IAP_PRODUCTS.MONTHLY,
    key: 'monthly',
    labelKey: 'planMonthly',
    fallbackPrice: '₺149,99',
    periodKey: 'perMonth',
    highlighted: false,
  },
  {
    id: IAP_PRODUCTS.YEARLY,
    key: 'yearly',
    labelKey: 'planYearly',
    fallbackPrice: '₺899,99',
    periodKey: 'perYear',
    highlighted: true,
  },
] as const;

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('parent');
  const user = useAuthStore((s) => s.user);
  const child = useChildStore((s) => s.activeChild);
  const showToast = useUIStore((s) => s.showToast);
  const isPremium = user?.isPremium ?? false;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(IAP_PRODUCTS.YEARLY);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pricing, setPricing] = useState<Record<string, ProductPricing | null>>({});

  const platform = Capacitor.getPlatform();
  const isNativePlatform = platform === 'ios' || platform === 'android';

  useEffect(() => {
    trackSubscriptionPaywallViewed({ source: 'subscription_screen', isPremium });
  }, [isPremium]);

  // Fiyatlar mağazadan asenkron yüklenir; ürün bilgisi güncellendikçe tazele.
  useEffect(() => {
    let mounted = true;
    const readPricing = () => {
      if (!mounted) return;
      setPricing({
        [IAP_PRODUCTS.MONTHLY]: getProductPricing(IAP_PRODUCTS.MONTHLY),
        [IAP_PRODUCTS.YEARLY]: getProductPricing(IAP_PRODUCTS.YEARLY),
      });
    };
    readPricing();
    onProductsUpdated(readPricing);
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[1];
  const selectedPricing = pricing[selectedPlanId] ?? null;
  const trialDays = selectedPricing?.trialDays ?? null;

  /** Mağaza fiyatı varsa onu, yoksa yedek fiyatı göster. */
  const priceFor = useCallback(
    (planId: string, fallbackPrice: string) => pricing[planId]?.price ?? fallbackPrice,
    [pricing],
  );

  /**
   * Yıllık planın aylık karşılığı ve tasarruf oranı — mağazadan gelen gerçek
   * fiyatlardan hesaplanır. Fiyatlar yüklenmediyse hiçbir iddia gösterilmez.
   */
  const yearlyValue = useMemo(() => {
    const monthly = pricing[IAP_PRODUCTS.MONTHLY];
    const yearly = pricing[IAP_PRODUCTS.YEARLY];
    if (!monthly?.priceMicros || !yearly?.priceMicros || !yearly.currency) return null;

    const perMonthMicros = yearly.priceMicros / 12;
    const savingsPercent = Math.round((1 - perMonthMicros / monthly.priceMicros) * 100);
    const formatted = new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: yearly.currency,
    }).format(perMonthMicros / 1_000_000);

    return {
      perMonth: formatted,
      savingsPercent: savingsPercent > 0 ? savingsPercent : null,
    };
  }, [pricing, i18n.language]);

  async function handlePurchase() {
    if (purchasing) return;
    setPurchasing(true);
    try {
      // Deneme olayı yalnızca mağazada gerçekten deneme tanımlıysa gönderilir.
      if (trialDays != null) {
        trackSubscriptionTrialStarted(selectedPlanId, platform);
      }
      const result = await purchaseSubscription(
        selectedPlanId as (typeof IAP_PRODUCTS)[keyof typeof IAP_PRODUCTS],
      );
      if (result.status === 'success') {
        showToast({
          type: 'success',
          title: t('subscription.successTitle'),
          message: t('subscription.successMessage'),
        });
      } else if (result.status === 'store_redirect') {
        showToast({
          type: 'info',
          title: t('subscription.storeOpenedTitle'),
          message: isNativePlatform
            ? t('subscription.storeOpenedNative')
            : t('subscription.storeOpenedWeb'),
        });
      } else if (result.status === 'cancelled') {
        // User cancelled — no toast needed
      } else {
        showToast({ type: 'error', title: t('subscription.errorTitle'), message: result.message });
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
        trackSubscriptionRestoreCompleted(platform);
        showToast({
          type: 'success',
          title: t('subscription.restoreSuccessTitle'),
          message: t('subscription.restoreSuccessMessage'),
        });
        void navigate(-1);
      } else {
        trackSubscriptionRestoreFailed(
          platform,
          result.status === 'error' ? result.message : 'not_found',
        );
        showToast({
          type: 'error',
          title: t('subscription.noSubTitle'),
          message: result.status === 'error' ? result.message : t('subscription.noSubMessage'),
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
            <Text variant="h3">{t('subscription.title')}</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {isPremium ? t('subscription.premiumMember') : t('subscription.freePlan')}
            </Text>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            {t('subscription.back')}
          </Button>
        </div>

        {/* Current Plan */}
        <Card variant={isPremium ? 'elevated' : 'outlined'} padding="md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isPremium ? '⭐' : '🆓'}</span>
            <div className="flex-1">
              <Text variant="body" weight="bold">
                {isPremium ? t('subscription.plusName') : t('subscription.freePlan')}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {isPremium ? t('subscription.premiumDesc') : t('subscription.freeDesc')}
              </Text>
            </div>
            {isPremium && (
              <span className="bg-success/20 text-success rounded-full px-3 py-1 text-xs font-bold">
                {t('subscription.active')}
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
              {t('subscription.upsellTitle')}
            </Text>

            {/* Feature list */}
            <Card variant="glass" padding="md">
              <div className="space-y-3">
                {PREMIUM_FEATURES.map((feat) => (
                  <div key={feat.key} className="flex items-center gap-3">
                    <span className="text-lg">{feat.emoji}</span>
                    <Text variant="bodySmall">{t(`subscription.features.${feat.key}`)}</Text>
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
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                    }}
                    className="text-left"
                  >
                    <Card
                      variant={isSelected ? 'elevated' : 'outlined'}
                      padding="md"
                      className={isSelected ? 'ring-nova-blue ring-2' : ''}
                    >
                      <div className="space-y-2 text-center">
                        {plan.highlighted && yearlyValue?.savingsPercent != null && (
                          <span className="bg-nova-orange inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white">
                            {t('subscription.saveBadge', { percent: yearlyValue.savingsPercent })}
                          </span>
                        )}
                        <Text variant="body" weight="bold">
                          {t(`subscription.${plan.labelKey}`)}
                        </Text>
                        <Text variant="h3" className="text-nova-blue">
                          {priceFor(plan.id, plan.fallbackPrice)}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t(`subscription.${plan.periodKey}`)}
                        </Text>
                        {plan.highlighted && yearlyValue && (
                          <Text variant="caption" className="text-success font-semibold">
                            {t('subscription.perMonthEquivalent', {
                              price: yearlyValue.perMonth,
                            })}
                          </Text>
                        )}
                        {isSelected && (
                          <span className="text-nova-blue block text-xs font-semibold">
                            {t('subscription.selected')}
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
              {purchasing
                ? t('subscription.processing')
                : trialDays != null
                  ? t('subscription.trialCta', { days: trialDays })
                  : t('subscription.subscribeCta')}
            </Button>

            {/* Otomatik yenilenen abonelik açıklaması — App Store 3.1.2 / Play politikası */}
            <Text variant="caption" align="center" className="text-text-secondary">
              {t(
                trialDays != null
                  ? 'subscription.renewalNoticeTrial'
                  : 'subscription.renewalNotice',
                {
                  days: trialDays,
                  price: priceFor(selectedPlan.id, selectedPlan.fallbackPrice),
                  period: t(
                    selectedPlan.id === IAP_PRODUCTS.YEARLY
                      ? 'subscription.periodYear'
                      : 'subscription.periodMonth',
                  ),
                },
              )}
            </Text>

            {/* Restore */}
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={handleRestore}
              disabled={restoring}
            >
              {restoring ? t('subscription.checking') : t('subscription.restoreCta')}
            </Button>
          </motion.div>
        )}

        {/* Premium user: subscription management */}
        {isPremium && (
          <div className="space-y-4">
            <Card variant="elevated" padding="md">
              <div className="space-y-3">
                <Text variant="h4">{t('subscription.planDetails')}</Text>
                <div className="flex justify-between">
                  <Text variant="bodySmall" className="text-text-secondary">
                    {t('subscription.planLabel')}
                  </Text>
                  <Text variant="bodySmall" weight="bold">
                    {t('subscription.plusName')}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text variant="bodySmall" className="text-text-secondary">
                    {t('subscription.statusLabel')}
                  </Text>
                  <Text variant="bodySmall" weight="bold" className="text-success">
                    {t('subscription.active')}
                  </Text>
                </div>
                {child && (
                  <div className="flex justify-between">
                    <Text variant="bodySmall" className="text-text-secondary">
                      {t('subscription.activeProfile')}
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
                  {t('subscription.manageText', {
                    store:
                      platform === 'ios'
                        ? t('subscription.storeAppStore')
                        : platform === 'android'
                          ? t('subscription.storeGooglePlay')
                          : t('subscription.storeGeneric'),
                  })}
                </Text>
                {platform === 'ios' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(IOS_MANAGE_SUBSCRIPTIONS_URL, '_system')}
                  >
                    {t('subscription.manageAppStore')}
                  </Button>
                )}
                {platform === 'android' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(ANDROID_MANAGE_SUBSCRIPTIONS_URL, '_blank')}
                  >
                    {t('subscription.manageGooglePlay')}
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
            {t('subscription.privacy')}
          </button>
          <button
            className="text-text-secondary text-xs underline"
            onClick={() => window.open(TERMS_OF_SERVICE_URL, '_blank', 'noopener,noreferrer')}
          >
            {t('subscription.terms')}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
