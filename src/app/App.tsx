import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './Router';

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

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <p className="mb-2 text-xl font-bold">Bir şeyler ters gitti</p>
          <p className="text-text-secondary mb-4">Lütfen sayfayı yenileyin.</p>
          <button
            className="bg-nova-blue rounded-xl px-6 py-3 font-bold text-white"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
