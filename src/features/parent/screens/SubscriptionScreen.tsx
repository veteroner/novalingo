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
import { purchaseSubscription, restorePurchases } from '@services/subscription/subscriptionService';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Metinler i18n'den gelir (parent.subscription.*); burada emoji/fiyat/anahtar.
const PREMIUM_FEATURES = [
  { emoji: '🌍', key: 'allWorlds' },
  { emoji: '♾️', key: 'unlimited' },
  { emoji: '🚫', key: 'noAds' },
  { emoji: '📶', key: 'offline' },
  { emoji: '📊', key: 'report' },
  { emoji: '🦉', key: 'evolutions' },
  { emoji: '👨‍👩‍👧‍👦', key: 'profiles' },
  { emoji: '⚡', key: 'boost' },
] as const;

const PLANS = [
  {
    id: IAP_PRODUCTS.MONTHLY,
    key: 'monthly',
    labelKey: 'planMonthly',
    priceTRY: '₺149.99',
    periodKey: 'perMonth',
    highlighted: false,
  },
  {
    id: IAP_PRODUCTS.YEARLY,
    key: 'yearly',
    labelKey: 'planYearly',
    priceTRY: '₺899.99',
    periodKey: 'perYear',
    highlighted: true,
    badgeKey: 'saveBadge',
    monthlyEquiv: '₺74.99/ay',
  },
] as const;

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('parent');
  const user = useAuthStore((s) => s.user);
  const child = useChildStore((s) => s.activeChild);
  const showToast = useUIStore((s) => s.showToast);
  const isPremium = user?.isPremium ?? false;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(IAP_PRODUCTS.YEARLY);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const platform = Capacitor.getPlatform();
  const isNativePlatform = platform === 'ios' || platform === 'android';

  useEffect(() => {
    trackSubscriptionPaywallViewed({ source: 'subscription_screen', isPremium });
  }, [isPremium]);

  async function handlePurchase() {
    if (purchasing) return;
    setPurchasing(true);
    try {
      trackSubscriptionTrialStarted(selectedPlanId, platform);
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
                        {'badgeKey' in plan && (
                          <span className="bg-nova-orange inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white">
                            {t(`subscription.${plan.badgeKey}`)}
                          </span>
                        )}
                        <Text variant="body" weight="bold">
                          {t(`subscription.${plan.labelKey}`)}
                        </Text>
                        <Text variant="h3" className="text-nova-blue">
                          {plan.priceTRY}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t(`subscription.${plan.periodKey}`)}
                        </Text>
                        {'monthlyEquiv' in plan && (
                          <Text variant="caption" className="text-success font-semibold">
                            {plan.monthlyEquiv}
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
              {purchasing ? t('subscription.processing') : t('subscription.trial')}
            </Button>
            <Text variant="caption" align="center" className="text-text-secondary">
              {t('subscription.trialNote1')} {t('subscription.trialNote2')}
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
