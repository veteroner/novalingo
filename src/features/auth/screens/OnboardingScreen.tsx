/**
 * OnboardingScreen
 *
 * 4 sayfalık onboarding akışı — Nova karakteri rehberlik eder.
 * Yaş grubu seçimi, günlük hedef, izin tercihleri.
 */

import { Button } from '@components/atoms/Button';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { ParentalGate } from '@components/organisms/ParentalGate';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Sayfa görselleri sabit; başlık/açıklama metinleri i18n'den gelir (auth.onboarding.pageN*).
const pageEmojis = ['👋', '🎮', '⏰', '🚀'];
const PAGE_COUNT = pageEmojis.length;

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [currentPage, setCurrentPage] = useState(0);
  const [showParentalGate, setShowParentalGate] = useState(false);

  const handleNext = useCallback(() => {
    if (currentPage < PAGE_COUNT - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      // Son sayfada ebeveyn kapısını göster
      setShowParentalGate(true);
    }
  }, [currentPage]);

  const handleSkip = useCallback(() => {
    setShowParentalGate(true);
  }, []);

  const handleParentalGatePass = useCallback(() => {
    void navigate('/create-profile');
  }, [navigate]);

  const handleParentalGateCancel = useCallback(() => {
    setShowParentalGate(false);
  }, []);

  const emoji = pageEmojis[currentPage];
  if (!emoji) return null;
  const pageNum = currentPage + 1;

  return (
    <div className="from-nova-sky safe-area-top safe-area-bottom flex min-h-screen flex-col bg-linear-to-b to-white">
      {/* Progress */}
      <div className="px-6 pt-4">
        <ProgressBar value={(currentPage + 1) / PAGE_COUNT} variant="lesson" size="xs" />
      </div>

      {/* Skip */}
      <div className="flex justify-end px-6 pt-2">
        <button onClick={handleSkip} className="text-text-secondary text-sm font-semibold">
          {t('onboarding.skip')}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="mb-6 text-8xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {emoji}
            </motion.div>

            <Text variant="h2" align="center" className="mb-3">
              {t(`onboarding.page${pageNum}Title`)}
            </Text>

            <Text variant="body" align="center" className="text-text-secondary mx-auto max-w-xs">
              {t(`onboarding.page${pageNum}Desc`)}
            </Text>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="space-y-3 px-6 pb-8">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {pageEmojis.map((_, i) => (
            <motion.div
              key={i}
              className="h-2 rounded-full"
              animate={{
                width: i === currentPage ? 24 : 8,
                backgroundColor: i === currentPage ? '#0d8ecf' : '#d1d5db',
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          ))}
        </div>

        <Button variant="primary" size="xl" fullWidth onClick={handleNext}>
          {currentPage < PAGE_COUNT - 1 ? t('onboarding.next') : t('onboarding.start')}
        </Button>
      </div>

      {/* Ebeveyn Kapısı */}
      {showParentalGate && (
        <ParentalGate
          requireConsent
          onPass={handleParentalGatePass}
          onCancel={handleParentalGateCancel}
        />
      )}
    </div>
  );
}
