/**
 * ConversationResultScreen — Konuşma Sonuç Ekranı
 *
 * Standalone "Nova ile Konuş" oturumu sonrasında gösterilen sonuç ekranı.
 * LessonResultScreen'den bağımsız — kendi sonuç/ödül semantiğini kullanır.
 */

import type { ConversationResult } from '@/features/conversation/types/conversationSession';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { NovaCompanion } from '@components/organisms/NovaCompanion';
import { getWordEmoji } from '@features/learning/data/wordEmojiMap';
import { formatTime } from '@utils/time';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

interface ScenarioSummary {
  id: string;
  title: string;
  titleTr: string;
  sceneEmoji: string;
  targetWords: string[];
}

export default function ConversationResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    result?: ConversationResult;
    scenario?: ScenarioSummary;
  } | null;

  const result = state?.result;
  const scenario = state?.scenario;

  if (!result || !scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button variant="primary" onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const getMoodMessage = () => {
    if (result.accuracy >= 0.8)
      return { mood: 'celebrating' as const, msg: 'Harika konuşma! Nova çok mutlu! 🌟' };
    if (result.accuracy >= 0.5)
      return { mood: 'happy' as const, msg: 'Güzel pratik oldu! Devam et! 💪' };
    return { mood: 'encouraging' as const, msg: 'Her konuşma seni daha iyi yapar! 🎯' };
  };

  const { mood, msg } = getMoodMessage();

  return (
    <div className="from-nova-sky safe-area-top safe-area-bottom flex min-h-screen flex-col items-center justify-center bg-linear-to-b to-white px-6">
      {/* Scene Emoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="mb-2 text-6xl"
      >
        {scenario.sceneEmoji}
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Text variant="h2" align="center">
          Konuşma Tamamlandı! 🎉
        </Text>
        <Text variant="bodySmall" className="text-text-secondary mt-1">
          {scenario.titleTr}
        </Text>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-success">
            %{Math.round(result.accuracy * 100)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Kelime Başarısı
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-blue">
            {result.targetWordsHit}/{result.targetWordsTotal}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Hedef Kelime
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-orange">
            {formatTime(result.durationSeconds)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Süre
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-purple">
            {result.score}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Puan
          </Text>
        </div>
      </motion.div>

      {/* Target Words Recap */}
      {scenario.targetWords.length > 0 && (
        <motion.div
          className="mt-6 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Text variant="h4" align="center" className="mb-3">
            🎯 Pratik Edilen Kelimeler
          </Text>
          <div className="flex flex-wrap justify-center gap-2">
            {scenario.targetWords.map((word) => {
              const emoji = getWordEmoji(word);
              return (
                <div
                  key={word}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-lg">{emoji}</span>
                  <Text variant="bodySmall" className="font-semibold capitalize">
                    {word}
                  </Text>
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
        transition={{ delay: 1.1 }}
      >
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={() => navigate('/conversation', { replace: true })}
        >
          Yeni Konuşma Başlat 🎭
        </Button>

        <Button variant="ghost" size="lg" fullWidth onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </motion.div>

      {/* Nova */}
      <NovaCompanion mood={mood} message={msg} position="center" size="lg" className="mt-6" />
    </div>
  );
}
