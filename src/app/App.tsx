import { Sentry } from '@/config/sentry';
import { createLogger, formatLogBuffer } from '@/utils/logger';
import { isNative } from '@/utils/platform';
import { SplashScreen } from '@capacitor/splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './Router';

const log = createLogger('app');

/** Teknik hata ayrıntıları yalnızca mağaza dışı derlemelerde gösterilir. */
const SHOW_ERROR_DETAILS = import.meta.env.VITE_APP_ENV !== 'production';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      gcTime: 30 * 60 * 1000, // 30 dakika
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function App() {
  useEffect(() => {
    log.step('App mount edildi');

    if (!isNative()) return;

    // React mount olur olmaz native splash'i gizle; auth/yükleme uygulama içinde sürer.
    SplashScreen.hide().catch((error: unknown) => {
      log.warn('splash gizlenemedi', { error });
    });
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProviders>
            <AppRouter />
          </AppProviders>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Uygulama geneli hata sınırı.
 *
 * "Tekrar Dene" ağacı yeniden mount eder; eski "Ana Sayfaya Dön" tam yeniden
 * yükleme yaptığı için açılışta tekrarlayan hatalarda aynı ekrana düşülüyordu.
 * Hata ayrıntısı ve log kopyalama yalnızca mağaza dışı derlemelerde görünür —
 * native kabukta konsola erişmek zor olduğu için test cihazındaki tek tanılama yüzeyi.
 */
class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error('React ağacı çöktü', {
      error,
      componentStack: info.componentStack?.split('\n').slice(0, 12).join(' | '),
    });
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } },
    });
  }

  /** Yeniden mount denemesi — geçici hatalarda sayfayı baştan yüklemeden toparlar. */
  handleRetry = () => {
    log.step('hata ekranından yeniden deneniyor');
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <AppErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

function AppErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const detail = error === null ? 'Bilinmeyen hata' : `${error.name}: ${error.message}`;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(`${detail}\n\n${formatLogBuffer()}`).then(
      () => {
        setCopyState('copied');
      },
      () => {
        setCopyState('failed');
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <p className="mb-2 text-xl font-bold">Bir şeyler ters gitti</p>
      <p className="text-text-secondary mb-4">Tekrar denemek için düğmeye dokun.</p>
      {SHOW_ERROR_DETAILS && (
        <p className="mb-4 max-w-sm rounded-lg bg-gray-100 p-3 text-left font-mono text-xs break-words">
          {detail}
        </p>
      )}
      <button
        className="bg-nova-blue mb-3 rounded-xl px-6 py-3 font-bold text-white"
        onClick={onRetry}
      >
        Tekrar Dene
      </button>
      {SHOW_ERROR_DETAILS && (
        <button className="text-text-secondary text-sm underline" onClick={handleCopyLogs}>
          {copyState === 'copied'
            ? 'Loglar kopyalandı'
            : copyState === 'failed'
              ? 'Kopyalanamadı'
              : 'Tanılama loglarını kopyala'}
        </button>
      )}
    </div>
  );
}
