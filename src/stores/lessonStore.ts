/**
 * Lesson Store
 *
 * Aktif ders oturumu ve aktivite durumu.
 */

import { type Activity, type ActivityResult } from '@/types';
import { create } from 'zustand';

interface LessonState {
  // Session State
  lessonId: string | null;
  activities: Activity[];
  currentActivityIndex: number;
  results: ActivityResult[];
  isActive: boolean;
  isPaused: boolean;
  startedAt: number | null;

  // Computed-like
  currentActivity: Activity | null;
  totalActivities: number;
  correctCount: number;
  wrongCount: number;
  score: number;

  // Actions
  startLesson: (lessonId: string, activities: Activity[]) => void;
  submitResult: (result: ActivityResult) => void;
  nextActivity: () => void;
  pauseLesson: () => void;
  resumeLesson: () => void;
  endLesson: () => LessonSummary;
  reset: () => void;
}

export interface LessonSummary {
  lessonId: string;
  results: ActivityResult[];
  totalActivities: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  score: number;
  durationSeconds: number;
  hintsUsed: number;
}

const initialState = {
  lessonId: null,
  activities: [],
  currentActivityIndex: 0,
  results: [],
  isActive: false,
  isPaused: false,
  startedAt: null,
  currentActivity: null,
  totalActivities: 0,
  correctCount: 0,
  wrongCount: 0,
  score: 0,
};

export const useLessonStore = create<LessonState>((set, get) => ({
  ...initialState,

  startLesson: (lessonId, activities) => {
    set({
      lessonId,
      activities,
      currentActivityIndex: 0,
      results: [],
      isActive: true,
      isPaused: false,
      startedAt: Date.now(),
      currentActivity: activities[0] ?? null,
      totalActivities: activities.length,
      correctCount: 0,
      wrongCount: 0,
      score: 0,
    });
  },

  submitResult: (result) => {
    const state = get();
    const newResults = [...state.results, result];
    const correct = newResults.filter((r) => r.isCorrect).length;
    const wrong = newResults.filter((r) => !r.isCorrect).length;
    const score =
      newResults.length > 0
        ? Math.round(newResults.reduce((sum, r) => sum + r.score, 0) / newResults.length)
        : 0;

    set({
      results: newResults,
      correctCount: correct,
      wrongCount: wrong,
      score,
    });
  },

  nextActivity: () => {
    const state = get();
    const nextIndex = state.currentActivityIndex + 1;

    if (nextIndex >= state.activities.length) {
      set({ isActive: false, currentActivity: null });
      return;
    }

    set({
      currentActivityIndex: nextIndex,
      currentActivity: state.activities[nextIndex] ?? null,
    });
  },

  pauseLesson: () => {
    set({ isPaused: true });
  },

  resumeLesson: () => {
    set({ isPaused: false });
  },

  endLesson: () => {
    const state = get();
    const durationSeconds = state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : 0;

    const accuracy = state.results.length > 0 ? state.correctCount / state.results.length : 0;

    const hintsUsed = state.results.reduce((sum, r) => sum + r.hintsUsed, 0);

    const summary: LessonSummary = {
      lessonId: state.lessonId ?? '',
      results: state.results,
      totalActivities: state.totalActivities,
      correctAnswers: state.correctCount,
      wrongAnswers: state.wrongCount,
      accuracy,
      score: state.score,
      durationSeconds,
      hintsUsed,
    };

    set({ isActive: false });

    return summary;
  },

  reset: () => {
    set(initialState);
  },
}));
