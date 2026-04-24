/**
 * ratingService
 *
 * App Store / Google Play rating prompt.
 * Uses @capacitor-community/in-app-review when available (iOS + Android native).
 * Triggers only after meaningful positive engagement, once per install.
 *
 * Trigger conditions:
 *  - After 3rd completed lesson
 *  - After 5th completed SRS review session
 *  - After completing a conversation with perfect score
 *
 * Guards:
 *  - localStorage flag so it fires at most once per install
 *  - Minimum 3 days since first launch
 *  - Only on native (Capacitor) platform
 */

import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = 'novalingo_rating_prompt_shown';
const SESSIONS_KEY = 'novalingo_completed_sessions';
const FIRST_LAUNCH_KEY = 'novalingo_first_launch_date';
const MIN_DAYS_BEFORE_PROMPT = 3;
const MIN_SESSIONS_BEFORE_PROMPT = 3;

function getFirstLaunchDate(): Date {
  const stored = localStorage.getItem(FIRST_LAUNCH_KEY);
  if (stored) return new Date(stored);
  const now = new Date().toISOString();
  localStorage.setItem(FIRST_LAUNCH_KEY, now);
  return new Date(now);
}

function getCompletedSessions(): number {
  return parseInt(localStorage.getItem(SESSIONS_KEY) ?? '0', 10);
}

function incrementCompletedSessions(): number {
  const current = getCompletedSessions();
  const next = current + 1;
  localStorage.setItem(SESSIONS_KEY, String(next));
  return next;
}

function hasAlreadyPrompted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function markPrompted(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

async function triggerNativeReview(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    // Dynamic import so web bundle doesn't break if plugin not linked
    const { InAppReview } = await import('@capacitor-community/in-app-review');
    await InAppReview.requestReview();
    markPrompted();
  } catch {
    // Plugin not available or OS denied — silently ignore
  }
}

/**
 * Call after each completed learning session (lesson, SRS review, conversation).
 * Internally tracks count and fires the native prompt when eligibility is met.
 */
export async function recordSessionAndMaybePromptRating(): Promise<void> {
  if (hasAlreadyPrompted()) return;
  if (!Capacitor.isNativePlatform()) return;

  const sessions = incrementCompletedSessions();
  const firstLaunch = getFirstLaunchDate();

  const meetsSessionThreshold = sessions >= MIN_SESSIONS_BEFORE_PROMPT;
  const meetsTimeThreshold = daysSince(firstLaunch) >= MIN_DAYS_BEFORE_PROMPT;

  if (meetsSessionThreshold && meetsTimeThreshold) {
    await triggerNativeReview();
  }
}

/**
 * Force-trigger the rating prompt (e.g. after a perfect-score milestone).
 * Still respects the "already shown" guard.
 */
export async function requestRatingIfEligible(): Promise<void> {
  if (hasAlreadyPrompted()) return;
  await triggerNativeReview();
}
