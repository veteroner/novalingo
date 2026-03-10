// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { daysBetween, formatDuration, formatTime, getTodayString, timeAgo } from '../time';

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(130)).toBe('2:10');
  });

  it('pads seconds with leading zero', () => {
    expect(formatTime(61)).toBe('1:01');
  });
});

describe('formatDuration', () => {
  it('seconds only when < 60', () => {
    expect(formatDuration(30)).toBe('30sn');
  });

  it('minutes only when no remainder', () => {
    expect(formatDuration(120)).toBe('2dk');
  });

  it('minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1dk 30sn');
    expect(formatDuration(125)).toBe('2dk 5sn');
  });

  it('0 seconds → "0sn"', () => {
    expect(formatDuration(0)).toBe('0sn');
  });
});

describe('getTodayString', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYY-MM-DD format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T12:00:00Z'));
    expect(getTodayString()).toBe('2026-03-05');
  });
});

describe('daysBetween', () => {
  it('same date → 0', () => {
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
  });

  it('one day apart', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
  });

  it('order does not matter (absolute)', () => {
    expect(daysBetween('2026-01-10', '2026-01-01')).toBe(9);
  });

  it('across months', () => {
    expect(daysBetween('2026-01-31', '2026-02-02')).toBe(2);
  });
});

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('just now (<60s)', () => {
    vi.useFakeTimers();
    const now = new Date('2026-03-05T12:00:00Z');
    vi.setSystemTime(now);
    const date = new Date('2026-03-05T11:59:30Z');
    expect(timeAgo(date)).toBe('az önce');
  });

  it('minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T12:00:00Z'));
    expect(timeAgo(new Date('2026-03-05T11:55:00Z'))).toBe('5 dakika önce');
  });

  it('hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T12:00:00Z'));
    expect(timeAgo(new Date('2026-03-05T09:00:00Z'))).toBe('3 saat önce');
  });

  it('days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
    expect(timeAgo(new Date('2026-03-07T12:00:00Z'))).toBe('3 gün önce');
  });

  it('weeks ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'));
    expect(timeAgo(new Date('2026-03-05T12:00:00Z'))).toBe('2 hafta önce');
  });

  it('months ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-05T12:00:00Z'));
    expect(timeAgo(new Date('2026-03-05T12:00:00Z'))).toBe('3 ay önce');
  });
});
