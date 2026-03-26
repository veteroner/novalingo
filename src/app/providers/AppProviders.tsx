import { LoadingScreen } from '@components/atoms/Spinner/LoadingScreen';
import { GlobalModalRenderer } from '@components/organisms/GlobalModalRenderer';
import { ToastRenderer } from '@components/organisms/ToastRenderer';
import { useChildren } from '@hooks/queries';
import { useAppInit } from '@hooks/useAppInit';
import { useAudioUnlock } from '@hooks/useAudioUnlock';
import { useAuth } from '@hooks/useAuth';
import { useCapacitorLifecycle } from '@hooks/useCapacitorLifecycle';
import { useAuthStore } from '@stores/authStore';
import { type ReactNode, useEffect, useRef } from 'react';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

const AUTH_TIMEOUT_MS = 10_000;

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
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChildDataProvider>
          {children}
          <GlobalModalRenderer />
          <ToastRenderer />
        </ChildDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
