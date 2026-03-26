/**
 * Activity Component Shared Types
 *
 * Her aktivite bileşeni bu arayüzü implemente eder.
 */

import type { ConversationEvidence } from '@/types/progress';

export interface ActivityCallbacks {
  /** Aktivite tamamlandığında çağrılır */
  onComplete: (result: ActivityOutcome) => void;
}

export interface ActivityOutcome {
  /** Doğru mu? */
  isCorrect: boolean;
  /** 0-100 arası puan */
  score: number;
  /** Harcanan süre (saniye) */
  timeSpentSeconds: number;
  /** Deneme sayısı */
  attempts: number;
  /** Kullanılan ipucu sayısı */
  hintsUsed: number;
  /** Konuşma aktiviteleri için kaydedilen üretim kanıtı */
  conversationEvidence?: ConversationEvidence;
}

/** Feedback durumu — doğru / yanlış / bekleniyor */
export type FeedbackState = 'idle' | 'correct' | 'wrong';
