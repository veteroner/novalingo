// @vitest-environment node
import { createActivity, createActivityResult } from '@/test/factories';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLessonStore } from '../lessonStore';

describe('lessonStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T12:00:00Z'));
    useLessonStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const activities = [
    createActivity({ id: 'a1' }),
    createActivity({ id: 'a2' }),
    createActivity({ id: 'a3' }),
  ];

  it('starts in idle state', () => {
    const s = useLessonStore.getState();
    expect(s.isActive).toBe(false);
    expect(s.lessonId).toBeNull();
    expect(s.activities).toEqual([]);
  });

  describe('startLesson', () => {
    it('initialises session', () => {
      useLessonStore.getState().startLesson('L1', activities);
      const s = useLessonStore.getState();
      expect(s.lessonId).toBe('L1');
      expect(s.isActive).toBe(true);
      expect(s.activities).toHaveLength(3);
      expect(s.currentActivityIndex).toBe(0);
      expect(s.currentActivity?.id).toBe('a1');
      expect(s.totalActivities).toBe(3);
      expect(s.startedAt).toBe(Date.now());
    });
  });

  describe('submitResult', () => {
    it('accumulates results and computes score', () => {
      useLessonStore.getState().startLesson('L1', activities);

      useLessonStore.getState().submitResult(createActivityResult({ isCorrect: true, score: 90 }));
      let s = useLessonStore.getState();
      expect(s.results).toHaveLength(1);
      expect(s.correctCount).toBe(1);
      expect(s.wrongCount).toBe(0);
      expect(s.score).toBe(90);

      useLessonStore.getState().submitResult(createActivityResult({ isCorrect: false, score: 30 }));
      s = useLessonStore.getState();
      expect(s.results).toHaveLength(2);
      expect(s.correctCount).toBe(1);
      expect(s.wrongCount).toBe(1);
      // avg: (90+30)/2 = 60
      expect(s.score).toBe(60);
    });
  });

  describe('nextActivity', () => {
    it('advances to next activity', () => {
      useLessonStore.getState().startLesson('L1', activities);
      useLessonStore.getState().nextActivity();
      const s = useLessonStore.getState();
      expect(s.currentActivityIndex).toBe(1);
      expect(s.currentActivity?.id).toBe('a2');
    });

    it('deactivates when past last activity', () => {
      useLessonStore.getState().startLesson('L1', activities);
      useLessonStore.getState().nextActivity(); // → index 1
      useLessonStore.getState().nextActivity(); // → index 2
      useLessonStore.getState().nextActivity(); // → beyond
      const s = useLessonStore.getState();
      expect(s.isActive).toBe(false);
      expect(s.currentActivity).toBeNull();
    });
  });

  describe('pauseLesson / resumeLesson', () => {
    it('toggles pause state', () => {
      useLessonStore.getState().startLesson('L1', activities);
      useLessonStore.getState().pauseLesson();
      expect(useLessonStore.getState().isPaused).toBe(true);

      useLessonStore.getState().resumeLesson();
      expect(useLessonStore.getState().isPaused).toBe(false);
    });
  });

  describe('endLesson', () => {
    it('returns correct summary', () => {
      useLessonStore.getState().startLesson('L1', activities);
      useLessonStore
        .getState()
        .submitResult(createActivityResult({ isCorrect: true, score: 100, hintsUsed: 0 }));
      useLessonStore
        .getState()
        .submitResult(createActivityResult({ isCorrect: false, score: 40, hintsUsed: 2 }));

      // Advance time by 30 seconds
      vi.advanceTimersByTime(30_000);

      const summary = useLessonStore.getState().endLesson();
      expect(summary.lessonId).toBe('L1');
      expect(summary.totalActivities).toBe(3);
      expect(summary.correctAnswers).toBe(1);
      expect(summary.wrongAnswers).toBe(1);
      expect(summary.accuracy).toBe(0.5);
      expect(summary.score).toBe(70); // (100+40)/2
      expect(summary.durationSeconds).toBe(30);
      expect(summary.hintsUsed).toBe(2);
    });
  });

  describe('reset', () => {
    it('returns to initial state', () => {
      useLessonStore.getState().startLesson('L1', activities);
      useLessonStore.getState().submitResult(createActivityResult());

      useLessonStore.getState().reset();

      const s = useLessonStore.getState();
      expect(s.lessonId).toBeNull();
      expect(s.activities).toEqual([]);
      expect(s.isActive).toBe(false);
      expect(s.results).toEqual([]);
      expect(s.score).toBe(0);
    });
  });
});
