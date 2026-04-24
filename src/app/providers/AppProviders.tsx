import { LoadingScreen } from '@components/atoms/Spinner/LoadingScreen';
import { GlobalModalRenderer } from '@components/organisms/GlobalModalRenderer';
import { ToastRenderer } from '@components/organisms/ToastRenderer';
import { useChildren } from '@hooks/queries';
import { useAppInit } from '@hooks/useAppInit';
import { useAudioUnlock } from '@hooks/useAudioUnlock';
import { useAuth } from '@hooks/useAuth';
import { useCapacitorLifecycle } from '@hooks/useCapacitorLifecycle';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { Timestamp } from 'firebase/firestore';
import { type ReactNode, useEffect, useRef } from 'react';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

const AUTH_TIMEOUT_MS = 10_000;
const E2E_SESSION_STORAGE_KEY = 'nova:e2e-session';
let hydratedE2ESessionKey: string | null = null;

interface E2ETestSession {
  uid?: string;
  child?: {
    id?: string;
    name?: string;
    avatarId?: string;
    ageGroup?: 'cubs' | 'stars' | 'legends';
    currentWorldId?: string;
    currentUnitId?: string;
  };
}

function getE2ETestSession(): E2ETestSession | null {
  if (import.meta.env.MODE !== 'test' || typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(E2E_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as E2ETestSession;
    if (!parsed?.uid || !parsed.child?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hydrateE2ETestSession(session: E2ETestSession): void {
  const sessionKey = JSON.stringify(session);
  if (hydratedE2ESessionKey === sessionKey) return;

  const now = Timestamp.now();
  const child = {
    id: session.child?.id ?? 'e2e-child',
    parentUid: session.uid ?? 'e2e-parent',
    name: session.child?.name ?? 'E2E Kid',
    avatarId: session.child?.avatarId ?? 'owl',
    ageGroup: session.child?.ageGroup ?? 'stars',
    createdAt: now,
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    stars: 0,
    gems: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    streakFreezes: 0,
    novaStage: 'egg' as const,
    novaHappiness: 100,
    novaOutfitId: null,
    leagueId: 'bronze_default',
    leagueTier: 'bronze' as const,
    weeklyXP: 0,
    currentWorldId: session.child?.currentWorldId ?? 'w3',
    currentUnitId: session.child?.currentUnitId ?? 'u1',
    completedLessons: 0,
    totalPlayTimeMinutes: 0,
    wordsLearned: 0,
  };

  useAuthStore.getState().setFirebaseUser({ uid: session.uid, isAnonymous: true } as never);
  useAuthStore.getState().setUser({
    id: session.uid ?? 'e2e-parent',
    email: '',
    displayName: 'E2E Parent',
    photoURL: null,
    provider: 'anonymous',
    isPremium: false,
    premiumExpiresAt: null,
    createdAt: now,
    lastLoginAt: now,
    settings: {
      language: 'tr',
      soundEnabled: true,
      musicEnabled: false,
      sfxVolume: 0,
      bgmVolume: 0,
      hapticEnabled: false,
      notificationsEnabled: false,
      dailyGoalMinutes: 10,
      parentPin: null,
    },
  });
  useChildStore.getState().setChildren([child]);
  useChildStore.getState().setActiveChild(child);
  hydratedE2ESessionKey = sessionKey;
}

function E2ETestSessionProvider({ children }: { children: ReactNode }) {
  useAppInit();
  useAudioUnlock();
  useCapacitorLifecycle();

  return <>{children}</>;
}

/**
 * Firebase auth state'ini store'a bağlar VE user dokümanını Firestore'dan çeker.
 * useAuth hook'u: onAuthStateChanged → setFirebaseUser + getDocument → setUser
 */
function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safety timeout — if auth state never resolves, force-clear loading
  useEffect(() => {
    if (!isLoading) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      console.warn('[Auth] Auth state timed out — forcing unauthenticated state');
      setFirebaseUser(null);
    }, AUTH_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, setFirebaseUser]);

  if (isLoading) return <LoadingScreen />;

  return <>{children}</>;
}

/**
 * Auth sonrası çocuk profillerini otomatik yükler.
 * useChildren hook'u TanStack Query ile Firestore'dan çeker ve store'a yazar.
 */
function ChildDataProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Only fetch children when authenticated
  const { isLoading, error, refetch } = useChildren();

  // Initialize platform services after auth
  useAppInit();

  // Unlock audio playback on first user interaction (mobile autoplay policy)
  useAudioUnlock();

  // Native app lifecycle (back button, splash, statusbar, deep links)
  useCapacitorLifecycle();

  if (isAuthenticated && isLoading) return <LoadingScreen />;

  if (isAuthenticated && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="mb-2 text-xl font-bold">Veriler yuklenemedi</p>
        <p className="text-text-secondary mb-4 max-w-sm text-sm">
          Firebase baglantisi kurulamadigi icin cocuk profilleri alinamadi.
        </p>
        <button
          className="bg-nova-blue rounded-xl px-6 py-3 font-bold text-white"
          onClick={() => {
            void refetch();
          }}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Uygulama genelindeki tüm context provider'ları sarar.
 * Sıralama önemli — bağımlılık sırasına göre yerleştirilmiştir.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const e2eSession = getE2ETestSession();
  if (e2eSession) hydrateE2ETestSession(e2eSession);

  return (
    <ThemeProvider>
      {e2eSession ? (
        <E2ETestSessionProvider>
          {children}
          <GlobalModalRenderer />
          <ToastRenderer />
        </E2ETestSessionProvider>
      ) : (
        <AuthProvider>
          <ChildDataProvider>
            {children}
            <GlobalModalRenderer />
            <ToastRenderer />
          </ChildDataProvider>
        </AuthProvider>
      )}
    </ThemeProvider>
  );
}
