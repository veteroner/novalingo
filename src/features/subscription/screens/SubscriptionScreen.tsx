/**
 * SubscriptionScreen
 *
 * Premium abonelik sayfası — plan karşılaştırma, RevenueCat entegrasyonu.
 * Aylık ₺149.99, Yıllık ₺899.99 (%50 tasarruf).
 */

import { Badge } from '@components/atoms/Badge';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { MainLayout } from '@components/templates/MainLayout';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@config/constants';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@services/revenuecat/revenuecatService';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type PlanType = 'monthly' | 'yearly';

interface PlanFeature {
  label: string;
  free: boolean | string;
  premium: boolean | string;
}

const features: PlanFeature[] = [
  { label: 'Temel dersler', free: true, premium: true },
  { label: 'Günlük 3 ders', free: true, premium: '♾️ Sınırsız' },
  { label: 'Reklamsız deneyim', free: false, premium: true },
  { label: 'Tüm dünyalar', free: false, premium: true },
  { label: 'Nova AI desteği', free: false, premium: true },
  { label: 'Özel koleksiyon', free: false, premium: true },
  { label: 'Aile profili (5 çocuk)', free: '1 çocuk', premium: true },
  { label: 'Çevrimdışı erişim', free: false, premium: true },
  { label: 'Gelişmiş raporlar', free: false, premium: true },
];

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState('₺149,99');
  const [yearlyPrice, setYearlyPrice] = useState('₺899,99');

  // Fetch real prices from RevenueCat
  useEffect(() => {
    getOfferings()
      .then((offering) => {
        if (!offering) return;
        for (const pkg of offering.availablePackages) {
          if (pkg.identifier === '$rc_monthly') {
            setMonthlyPrice(pkg.product.priceString);
          } else if (pkg.identifier === '$rc_annual') {
            setYearlyPrice(pkg.product.priceString);
          }
        }
      })
      .catch(() => {
        /* use defaults */
      });
  }, []);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const packageId = selectedPlan === 'yearly' ? '$rc_annual' : '$rc_monthly';
      const success = await purchasePackage(packageId);
      if (success) {
        void navigate('/home');
      }
    } catch {
      // handle error silently
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        void navigate('/home');
      }
    } catch {
      // handle error silently
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <MainLayout showNavigation={false}>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            ←
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            Daha Sonra
          </Button>
        </div>

        {/* Hero */}
        <motion.div
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="mb-4 text-6xl">🚀</div>
          <Text variant="h2" align="center">
            NovaLingo
          </Text>
          <Text
            variant="h3"
            align="center"
            className="from-nova-blue to-nova-purple bg-linear-to-r bg-clip-text text-transparent!"
          >
            Premium
          </Text>
          <Text variant="bodySmall" className="text-text-secondary mt-2">
            Sınırsız öğrenme, reklamsız eğlence
          </Text>
        </motion.div>

        {/* Plan Toggle */}
        <div className="flex gap-3">
          <motion.button
            className={`relative flex-1 rounded-2xl border-3 p-4 transition-all ${
              selectedPlan === 'monthly' ? 'border-nova-blue bg-nova-blue/5' : 'border-gray-200'
            }`}
            onClick={() => {
              setSelectedPlan('monthly');
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Text variant="label" className="text-text-secondary">
              Aylık
            </Text>
            <Text variant="h3">{monthlyPrice}</Text>
            <Text variant="caption" className="text-text-secondary">
              /ay
            </Text>
          </motion.button>

          <motion.button
            className={`relative flex-1 rounded-2xl border-3 p-4 transition-all ${
              selectedPlan === 'yearly' ? 'border-nova-blue bg-nova-blue/5' : 'border-gray-200'
            }`}
            onClick={() => {
              setSelectedPlan('yearly');
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Badge variant="success" className="absolute -top-2 right-3 text-xs">
              %50 Tasarruf
            </Badge>
            <Text variant="label" className="text-text-secondary">
              Yıllık
            </Text>
            <Text variant="h3">{yearlyPrice}</Text>
            <Text variant="caption" className="text-text-secondary">
              /yıl
            </Text>
          </motion.button>
        </div>

        {/* Features Comparison */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-4">
            Neler Dahil?
          </Text>
          <div className="space-y-3">
            {/* Column headers */}
            <div className="mb-3 flex items-center gap-3 border-b pb-3">
              <div className="flex-1" />
              <div className="w-16 text-center">
                <Text variant="caption" className="text-text-secondary font-bold">
                  Ücretsiz
                </Text>
              </div>
              <div className="w-16 text-center">
                <Text variant="caption" className="text-nova-blue font-bold">
                  Premium
                </Text>
              </div>
            </div>
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <Text variant="bodySmall">{feature.label}</Text>
                </div>
                <div className="w-16 text-center">
                  {feature.free === true ? (
                    <span className="text-success text-lg">✓</span>
                  ) : feature.free === false ? (
                    <span className="text-lg text-gray-300">✗</span>
                  ) : (
                    <Text variant="caption" className="text-text-secondary">
                      {feature.free}
                    </Text>
                  )}
                </div>
                <div className="w-16 text-center">
                  {feature.premium === true ? (
                    <span className="text-nova-blue text-lg">✓</span>
                  ) : (
                    <Text variant="caption" className="text-nova-blue font-bold">
                      {feature.premium}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="space-y-3 pb-6">
          <Button fullWidth onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing
              ? 'İşleniyor...'
              : selectedPlan === 'yearly'
                ? `7 Gün Ücretsiz Dene — Yıllık ${yearlyPrice}`
                : `7 Gün Ücretsiz Dene — Aylık ${monthlyPrice}`}
          </Button>

          <Text variant="caption" align="center" className="text-text-secondary">
            7 günlük ücretsiz deneme. İstediğiniz zaman iptal edin. Deneme süresi dolmadan 24 saat
            önce bilgilendirilirsiniz.
          </Text>

          <div className="text-text-secondary flex justify-center gap-4">
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
            >
              Gizlilik Politikası
            </a>
            <a
              href={TERMS_OF_SERVICE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
            >
              Kullanım Koşulları
            </a>
            <button
              className="text-xs underline"
              onClick={() => void handleRestore()}
              disabled={isRestoring}
            >
              {isRestoring ? 'Geri yükleniyor...' : 'Satın Almayı Geri Yükle'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
