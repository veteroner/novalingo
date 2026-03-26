/**
 * LessonResultScreen
 *
 * Ders sonuç ekranı — yıldızlar, XP, doğruluk, süre, kelime özeti.
 * Kutlama animasyonu ve paylaşım.
 */

import { Badge } from '@components/atoms/Badge';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { StarRating } from '@components/molecules/StarRating';
import { NovaCompanion } from '@components/organisms/NovaCompanion';
import { getVocab } from '@features/learning/data/activityGenerator';
import { getLesson } from '@features/learning/data/curriculum';
import { getWordEmoji } from '@features/learning/data/wordEmojiMap';
import type { SubmitLessonResultRes } from '@services/firebase/functions';
import { unlockAudioPlayback } from '@services/speech/speechService';
import { formatTime } from '@utils/time';
import { calculateStars } from '@utils/xp';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

interface LessonSummary {
  lessonId: string;
  totalActivities: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  score: number;
  durationSeconds: number;
  hintsUsed: number;
  results: unknown[];
}

export default function LessonResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    summary?: LessonSummary;
    backendResult?: SubmitLessonResultRes;
    vocabulary?: string[];
    bossGameOver?: boolean;
    lessonType?: string;
  } | null;
  const summary = state?.summary;
  const backendResult = state?.backendResult;
  const vocabulary = state?.vocabulary ?? [];
  const bossGameOver = state?.bossGameOver ?? false;
  const isBossLesson = state?.lessonType === 'boss';

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button variant="primary" onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  // ===== BOSS DEFEAT SCREEN =====
  if (bossGameOver) {
    return (
      <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-red-950 to-red-900 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 160 }}
          className="text-8xl"
        >
          💀
        </motion.div>

        <motion.div
          className="mt-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Text variant="h2" align="center" className="text-white">
            Patron Seni Yendi!
          </Text>
          <Text variant="body" align="center" className="mt-2 text-red-200">
            Ama yenilmek söz konusu değil… henüz.
          </Text>
        </motion.div>

        <motion.div
          className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="rounded-2xl bg-white/10 p-4 text-center">
            <Text variant="h3" className="text-white">
              {summary.correctAnswers}
            </Text>
            <Text variant="caption" className="text-red-200">
              Doğru Cevap
            </Text>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center">
            <Text variant="h3" className="text-white">
              {formatTime(summary.durationSeconds)}
            </Text>
            <Text variant="caption" className="text-red-200">
              Süre
            </Text>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 w-full max-w-xs space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={() => {
              void unlockAudioPlayback();
              void navigate(`/lesson/${summary.lessonId}`);
            }}
          >
            🗡️ Tekrar Saldır!
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={() => navigate('/home')}>
            <span className="text-white">Sonra Dene</span>
          </Button>
        </motion.div>

        <NovaCompanion
          mood="encouraging"
          message="Sen bunu yapabilirsin! Her deneme seni daha güçlü yapıyor! 💪"
          position="center"
          size="lg"
          className="mt-6"
        />
      </div>
    );
  }

  const stars = backendResult?.starRating ?? calculateStars(summary.accuracy);
  const accuracy = backendResult?.accuracy ?? summary.accuracy;
  const xpEarned = backendResult?.xpEarned ?? 0;

  const getMoodMessage = () => {
    if (stars === 3) return { mood: 'celebrating' as const, msg: 'MÜKEMMEL! Sen bir dahisin! 🌟' };
    if (stars === 2)
      return { mood: 'happy' as const, msg: 'Harika iş! Biraz daha pratik ile mükemmel olursun!' };
    if (stars === 1)
      return { mood: 'encouraging' as const, msg: 'İyi başlangıç! Tekrar denemeye ne dersin?' };
    return { mood: 'encouraging' as const, msg: 'Vazgeçme! Her hata öğrenmenin parçası! 💪' };
  };

  const { mood, msg } = getMoodMessage();
  const lesson = getLesson(summary.lessonId);

  return (
    <div className="from-nova-sky safe-area-top safe-area-bottom flex min-h-screen flex-col items-center justify-center bg-linear-to-b to-white px-6">
      {/* Boss Victory Banner */}
      {isBossLesson && (
        <motion.div
          className="mb-4 w-full max-w-sm rounded-3xl bg-linear-to-r from-yellow-400 to-amber-500 px-6 py-4 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
        >
          <Text variant="h2" align="center" className="text-white drop-shadow">
            👑 PATRON YENİLDİ!
          </Text>
          <Text variant="bodySmall" align="center" className="mt-1 text-yellow-100">
            Mükemmel bir zafer! Harikaşsın!
          </Text>
        </motion.div>
      )}

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StarRating stars={stars} size="lg" />
      </motion.div>

      {/* Title */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Text variant="h2" align="center">
          {stars >= 2 ? 'Tebrikler! 🎉' : 'Ders Tamamlandı'}
        </Text>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-blue">
            +{xpEarned}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            XP Kazanıldı
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-success">
            %{Math.round(accuracy * 100)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Doğruluk
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-orange">
            {formatTime(summary.durationSeconds)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Süre
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-purple">
            {summary.correctAnswers}/{summary.totalActivities}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Doğru Cevap
          </Text>
        </div>
      </motion.div>

      {/* Streak badge */}
      <motion.div
        className="mt-4 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, type: 'spring' }}
      >
        {isBossLesson && (
          <Badge variant="xp" size="lg" icon={<span>👑</span>}>
            Boss Ödülü!
          </Badge>
        )}
        {backendResult && backendResult.streak > 0 && (
          <Badge variant="streak" size="lg" icon={<span>🔥</span>}>
            {backendResult.streak} gün seri!
          </Badge>
        )}
        {backendResult?.isPerfect && (
          <Badge variant="xp" size="lg" icon={<span>⭐</span>}>
            Mükemmel!
          </Badge>
        )}
      </motion.div>

      {/* Level Up */}
      {backendResult?.leveledUp && (
        <motion.div
          className="bg-nova-yellow/20 mt-3 rounded-2xl px-6 py-3 text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, type: 'spring', stiffness: 200 }}
        >
          <Text variant="h3" className="text-nova-orange">
            🎉 Seviye {backendResult.newLevel}!
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Yeni seviyeye ulaştın!
          </Text>
        </motion.div>
      )}

      {/* Can Do Achievement */}
      {lesson?.canDo && (
        <motion.div
          className="bg-success/10 mt-4 w-full max-w-sm rounded-2xl px-5 py-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.75, type: 'spring', stiffness: 180 }}
        >
          <Text variant="caption" className="text-success mb-1 font-bold tracking-wide uppercase">
            ✅ Artık şunu yapabilirsin
          </Text>
          <Text variant="body" className="text-surface-900 dark:text-surface-100 font-semibold">
            {lesson.canDo}
          </Text>
        </motion.div>
      )}

      {/* Vocabulary Recap */}
      {vocabulary.length > 0 && (
        <motion.div
          className="mt-6 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Text variant="h4" align="center" className="mb-3">
            📚 Öğrenilen Kelimeler
          </Text>
          <div className="flex flex-wrap justify-center gap-2">
            {vocabulary.map((word) => {
              const emoji = getWordEmoji(word);
              const tr = getVocab(word).tr;
              return (
                <div
                  key={word}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-lg">{emoji}</span>
                  <div className="text-left">
                    <Text variant="bodySmall" className="font-semibold capitalize">
                      {word}
                    </Text>
                    <Text variant="caption" className="text-text-secondary">
                      {tr}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="mt-8 w-full max-w-sm space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {/* Conversation Practice CTA — offer after every lesson */}
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={() => {
            void unlockAudioPlayback();
            void navigate('/conversation');
          }}
        >
          🎭 Konuşma Pratiği Yap
        </Button>

        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>

        {stars < 3 && (
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => {
              void unlockAudioPlayback();
              void navigate(`/lesson/${summary.lessonId}`);
            }}
          >
            Tekrar Dene
          </Button>
        )}
      </motion.div>

      {/* Nova */}
      <NovaCompanion mood={mood} message={msg} position="center" size="lg" className="mt-6" />
    </div>
  );
}
