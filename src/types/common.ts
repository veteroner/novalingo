/**
 * NovaLingo — Genel Yardımcı Tipler
 */

// ===== API RESPONSE =====
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ===== PAGINATION =====
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  lastDoc?: string;
}

// ===== COMMON =====
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// ===== PLATFORM =====
export type Platform = 'web' | 'ios' | 'android';

export function getPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  if (userAgent.includes('android')) return 'android';
  return 'web';
}

// ===== DATE HELPERS =====
export type DateString = string; // YYYY-MM-DD format

// ===== EVENT BUS =====
export type EventType =
  | 'lesson:complete'
  | 'xp:gained'
  | 'level:up'
  | 'streak:updated'
  | 'achievement:unlocked'
  | 'quest:completed'
  | 'collectible:obtained'
  | 'nova:evolved'
  | 'league:promoted'
  | 'league:relegated'
  | 'purchase:success'
  | 'purchase:restored';

export interface AppEvent<T = unknown> {
  type: EventType;
  payload: T;
  timestamp: number;
}
