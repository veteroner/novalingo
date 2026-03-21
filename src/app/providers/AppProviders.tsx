import { LoadingScreen } from '@components/atoms/Spinner/LoadingScreen';
import { GlobalModalRenderer } from '@components/organisms/GlobalModalRenderer';
import { ToastRenderer } from '@components/organisms/ToastRenderer';
import { useChildren } from '@hooks/queries';
import { useAppInit } from '@hooks/useAppInit';
import { useAudioUnlock } from '@hooks/useAudioUnlock';
import { useAuth } from '@hooks/useAuth';
import { useCapacitorLifecycle } from '@hooks/useCapacitorLifecycle';
import { useAuthStore } from '@stores/authStore';
import { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Firebase auth state'ini store'a bağlar VE user dokümanını Firestore'dan çeker.
 * useAuth hook'u: onAuthStateChanged → setFirebaseUser + getDocument → setUser
 */
function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();

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
  const { isLoading } = useChildren();

  // Initialize platform services after auth
  useAppInit();

  // Unlock audio playback on first user interaction (mobile autoplay policy)
  useAudioUnlock();

  // Native app lifecycle (back button, splash, statusbar, deep links)
  useCapacitorLifecycle();

  if (isAuthenticated && isLoading) return <LoadingScreen />;

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
