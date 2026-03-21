/**
 * Learning Engine
 *
 * Ders akışını yöneten ana motor.
 * - SRS + adaptif zorluk ile aktivite seçimi
 * - Ders oturumu yönetimi
 * - İlerleme hesaplama
 * - Review ders oluşturma
 */

import { LESSON, SRS } from '@/config/constants';
import { getRandomSentence } from '@/features/learning/data/activityGenerator';
import type { Activity, ActivityType, Lesson } from '@/types/content';
import type { ActivityResult, VocabularyCard } from '@/types/progress';
import {
  calculateNextReview,
  getAdaptiveDifficulty,
  getReviewQueue,
  inferQuality,
  type DifficultyProfile,
} from '@services/srs';

// ===== LESSON SESSION =====

export interface LessonSession {
  lessonId: string;
  activities: Activity[];
  difficulty: DifficultyProfile;
  startedAt: number;
  /** Words being learned/reviewed in this lesson */
  vocabulary: string[];
}

export interface LessonOutcome {
  lessonId: string;
  score: number;
  accuracy: number;
  starsEarned: number;
  totalTime: number;
  perfectLesson: boolean;
  newWordsLearned: string[];
  wordsReviewed: string[];
  activityResults: ActivityResult[];
}

// ===== ACTIVITY SELECTION =====

/**
 * Pedagojik sıralama ile aktivite listesi oluştur.
 *
 * Sıralama prensibi:
 * 1. Flash card (kelime tanıtımı — yeni kelimeler)
 * 2. Listen & tap (duyarak pekiştirme)
 * 3. Match pairs (eşleştirme)
 * 4. Word builder (yazma pratiği)
 * 5. Fill blank (cümle içinde kullanım)
 * 6. Speak it (üretim — en zor, en sona)
 * 7. Quiz battle / memory game (karma tekrar)
 */
const ACTIVITY_PEDAGOGIC_ORDER: Record<ActivityType, number> = {
  'flash-card': 1,
  'listen-and-tap': 2,
  'match-pairs': 3,
  'word-builder': 4,
  'fill-blank': 5,
  'sentence-builder': 6,
  'grammar-transform': 7,
  'speak-it': 8,
  'conversation': 9,
  'story-time': 10,
  'story-comprehension': 11,
  'memory-game': 12,
  'word-search': 13,
  'quiz-battle': 14,
};

function getPedagogicOrder(type: string): number {
  if (Object.hasOwn(ACTIVITY_PEDAGOGIC_ORDER, type)) {
    return ACTIVITY_PEDAGOGIC_ORDER[type as ActivityType];
  }

  return 99;
}

/**
 * Sort activities by pedagogic order.
 */
export function sortActivitiesPedagogically(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => getPedagogicOrder(a.type) - getPedagogicOrder(b.type));
}

// ===== LESSON PREPARATION =====

interface PrepareLessonParams {
  lesson: Lesson;
  /** Recent lesson performances for adaptive difficulty */
  recentPerformance: Array<{
    accuracy: number;
    score: number;
    hintsUsed: number;
    durationSeconds: number;
    isPerfect: boolean;
  }>;
  childLevel: number;
  /** Vocabulary cards for SRS-based content selection */
  vocabularyCards?: VocabularyCard[];
}

/**
 * Prepare a lesson session: select activities based on difficulty and SRS.
 */
export function prepareLesson(params: PrepareLessonParams): LessonSession {
  const { lesson, recentPerformance, childLevel, vocabularyCards } = params;

  // Determine difficulty
  const difficulty = getAdaptiveDifficulty(recentPerformance, childLevel);

  // Select & sort activities — preserve type diversity
  let selectedActivities = lesson.activities.slice();

  if (selectedActivities.length > difficulty.activitiesPerLesson) {
    // Keep one of each activity type first (ensures all types appear)
    const seenTypes = new Set<string>();
    const unique: Activity[] = [];
    const extras: Activity[] = [];

    for (const act of selectedActivities) {
      if (!seenTypes.has(act.type)) {
        seenTypes.add(act.type);
        unique.push(act);
      } else {
        extras.push(act);
      }
    }

    const limit = difficulty.activitiesPerLesson;
    if (unique.length <= limit) {
      // All types fit — fill remaining slots with extras (e.g. extra flash-cards)
      selectedActivities = [...unique, ...extras.slice(0, limit - unique.length)];
    } else {
      // More types than slots — keep types by pedagogic priority
      selectedActivities = sortActivitiesPedagogically(unique).slice(0, limit);
    }
  }

  // Sort pedagogically
  selectedActivities = sortActivitiesPedagogically(selectedActivities);

  // Apply difficulty settings to time limits
  selectedActivities = selectedActivities.map((a) => ({
    ...a,
    timeLimit: a.timeLimit ? Math.round(a.timeLimit * difficulty.timeMultiplier) : null,
  }));

  // Determine vocabulary
  const newWords = lesson.vocabulary.slice();
  const reviewWords: string[] = [];

  if (vocabularyCards && vocabularyCards.length > 0) {
    const dueCards = getReviewQueue(vocabularyCards, new Date()).slice(0, 5);
    for (const card of dueCards) {
      if (!newWords.includes(card.word)) {
        reviewWords.push(card.word);
      }
    }
  }

  return {
    lessonId: lesson.id,
    activities: selectedActivities,
    difficulty,
    startedAt: Date.now(),
    vocabulary: [...newWords, ...reviewWords],
  };
}

// ===== REVIEW LESSON GENERATION =====

/**
 * Generate a review lesson from SRS due cards.
 * Uses diverse activity types for better retention — not just flash cards.
 */
export function generateReviewLesson(
  cards: VocabularyCard[],
  childLevel: number = 1,
): LessonSession | null {
  const due = getReviewQueue(cards, new Date(), SRS.DAILY_REVIEW_LIMIT);
  if (due.length === 0) return null;

  const activities: Activity[] = [];
  const activityCycle: ActivityType[] = [
    'flash-card',
    'listen-and-tap',
    'fill-blank',
    'match-pairs',
    'word-builder',
    'speak-it',
  ];

  due.forEach((card, i) => {
    const type = activityCycle[i % activityCycle.length] ?? 'flash-card';
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    switch (type) {
      case 'flash-card':
        activities.push({
          id: `review-fc-${card.id}`,
          type: 'flash-card',
          order: i,
          data: {
            type: 'flash-card' as const,
            word: card.word,
            translation: card.translation,
            imageUrl: card.imageUrl,
            audioUrl: card.audioUrl,
            exampleSentence: '',
            exampleTranslation: '',
          },
          timeLimit: null,
          maxAttempts: 3,
        });
        break;

      case 'listen-and-tap': {
        const distractors = due
          .filter((c) => c.id !== card.id)
          .slice(0, 3)
          .map((c) => capitalize(c.word));
        const options = [capitalize(card.word), ...distractors].sort(() => Math.random() - 0.5);
        activities.push({
          id: `review-lt-${card.id}`,
          type: 'listen-and-tap',
          order: i,
          data: {
            type: 'listen-and-tap' as const,
            audioUrl: card.audioUrl,
            correctAnswer: capitalize(card.word),
            options,
            imageHint: null,
          },
          timeLimit: 15,
          maxAttempts: 2,
        });
        break;
      }

      case 'fill-blank': {
        const sentencePair = getRandomSentence(card.word);
        const blankSentence = sentencePair.en.replace(new RegExp(`\\b${card.word}\\b`, 'i'), '___');
        const blankTranslation = sentencePair.tr.replace(
          new RegExp(`\\b${card.translation}\\b`, 'i'),
          '___',
        );
        activities.push({
          id: `review-fb-${card.id}`,
          type: 'fill-blank',
          order: i,
          data: {
            type: 'fill-blank' as const,
            sentence: blankSentence,
            translation: blankTranslation,
            correctAnswer: capitalize(card.word),
            options: [
              capitalize(card.word),
              ...due
                .filter((c) => c.id !== card.id)
                .slice(0, 3)
                .map((c) => capitalize(c.word)),
            ].sort(() => Math.random() - 0.5),
            audioUrl: '',
          },
          timeLimit: 15,
          maxAttempts: 2,
        });
        break;
      }

      case 'match-pairs': {
        const pairCards = due.slice(i, i + 4).length >= 2 ? due.slice(i, i + 4) : due.slice(0, 4);
        activities.push({
          id: `review-mp-${card.id}`,
          type: 'match-pairs',
          order: i,
          data: {
            type: 'match-pairs' as const,
            pairs: pairCards.slice(0, 4).map((c) => ({
              id: `rp_${c.id}`,
              left: capitalize(c.word),
              right: c.translation,
              leftType: 'text' as const,
              rightType: 'text' as const,
            })),
          },
          timeLimit: 30,
          maxAttempts: 2,
        });
        break;
      }

      case 'word-builder': {
        const singleWord = card.word.split(' ')[0] ?? card.word;
        const letters = singleWord.split('');
        const scrambled = [...letters].sort(() => Math.random() - 0.5);
        activities.push({
          id: `review-wb-${card.id}`,
          type: 'word-builder',
          order: i,
          data: {
            type: 'word-builder' as const,
            word: capitalize(singleWord),
            translation: card.translation,
            imageUrl: '',
            audioUrl: '',
            scrambledLetters: scrambled.map((l) => l.toUpperCase()),
            hintLetters: [0],
          },
          timeLimit: 20,
          maxAttempts: 3,
        });
        break;
      }

      case 'speak-it':
        activities.push({
          id: `review-si-${card.id}`,
          type: 'speak-it',
          order: i,
          data: {
            type: 'speak-it' as const,
            word: capitalize(card.word),
            translation: card.translation,
            audioUrl: '',
            imageUrl: '',
            acceptableVariations: [card.word.toLowerCase(), card.word.toUpperCase(), card.word],
          },
          timeLimit: 20,
          maxAttempts: 3,
        });
        break;
    }
  });

  return {
    lessonId: `review-${Date.now()}`,
    activities: activities.slice(0, LESSON.ACTIVITIES_PER_LESSON),
    difficulty: getAdaptiveDifficulty([], childLevel),
    startedAt: Date.now(),
    vocabulary: due.map((c) => c.word),
  };
}

// ===== LESSON SCORING =====

/**
 * Calculate lesson outcome from activity results.
 */
export function calculateLessonOutcome(
  lessonId: string,
  results: ActivityResult[],
  startedAt: number,
  newWords: string[],
  reviewWords: string[],
): LessonOutcome {
  if (results.length === 0) {
    return {
      lessonId,
      score: 0,
      accuracy: 0,
      starsEarned: 0,
      totalTime: 0,
      perfectLesson: false,
      newWordsLearned: [],
      wordsReviewed: [],
      activityResults: [],
    };
  }

  const correct = results.filter((r) => r.isCorrect).length;
  const accuracy = correct / results.length;
  const score = Math.round(accuracy * 100);

  // Star thresholds from constants
  let starsEarned = 0;
  for (const threshold of LESSON.STAR_THRESHOLDS) {
    if (accuracy >= threshold) starsEarned++;
  }

  const totalTime = Math.round((Date.now() - startedAt) / 1000);
  const perfectLesson = accuracy === 1.0 && results.every((r) => r.hintsUsed === 0);

  return {
    lessonId,
    score,
    accuracy,
    starsEarned,
    totalTime,
    perfectLesson,
    newWordsLearned: newWords,
    wordsReviewed: reviewWords,
    activityResults: results,
  };
}

// ===== SRS INTEGRATION =====

/**
 * Process activity result for SRS: update vocabulary card parameters.
 */
export function processActivityForSRS(
  result: ActivityResult,
  card: VocabularyCard,
): { repetitions: number; easeFactor: number; interval: number } {
  const quality = inferQuality({
    isCorrect: result.isCorrect,
    attempts: result.attempts,
    hintsUsed: result.hintsUsed,
    responseTimeMs: result.timeSpentSeconds * 1000,
  });

  const review = calculateNextReview({
    quality,
    repetitions: card.repetitions,
    easeFactor: card.easeFactor,
    interval: card.interval,
  });

  return {
    repetitions: review.repetitions,
    easeFactor: review.easeFactor,
    interval: review.interval,
  };
}
