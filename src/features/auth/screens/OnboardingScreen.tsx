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
import { useNavigate } from 'react-router-dom';

interface OnboardingPage {
  title: string;
  description: string;
  emoji: string;
}

const pages: OnboardingPage[] = [
  {
    title: 'Merhaba! Ben Nova 🦉',
    description: 'İngilizce öğrenme macerana hoş geldin! Seninle birlikte öğreneceğim.',
    emoji: '👋',
  },
  {
    title: 'Oyun Gibi Öğren',
    description: 'Her derste XP kazan, seviye atla ve harika ödüller topla!',
    emoji: '🎮',
  },
  {
    title: 'Her Gün Biraz',
    description: 'Günde sadece 10 dakika ile İngilizce konuşmaya başla!',
    emoji: '⏰',
  },
  {
    title: 'Hazır mısın?',
    description: 'Profilini oluşturalım ve maceraya başlayalım!',
    emoji: '🚀',
  },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [showParentalGate, setShowParentalGate] = useState(false);

  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
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

  const page = pages[currentPage];
  if (!page) return null;

  return (
    <div className="from-nova-sky safe-area-top safe-area-bottom flex min-h-screen flex-col bg-linear-to-b to-white">
      {/* Progress */}
      <div className="px-6 pt-4">
        <ProgressBar value={(currentPage + 1) / pages.length} variant="lesson" size="xs" />
      </div>

      {/* Skip */}
      <div className="flex justify-end px-6 pt-2">
        <button onClick={handleSkip} className="text-text-secondary text-sm font-semibold">
          Atla
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
              {page.emoji}
            </motion.div>

            <Text variant="h2" align="center" className="mb-3">
              {page.title}
            </Text>

            <Text variant="body" align="center" className="text-text-secondary mx-auto max-w-xs">
              {page.description}
            </Text>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="space-y-3 px-6 pb-8">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {pages.map((_, i) => (
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
          {currentPage < pages.length - 1 ? 'Devam Et' : 'Başlayalım! 🚀'}
        </Button>
      </div>

      {/* Ebeveyn Kapısı */}
      {showParentalGate && (
        <ParentalGate onPass={handleParentalGatePass} onCancel={handleParentalGateCancel} />
      )}
    </div>
  );
}
