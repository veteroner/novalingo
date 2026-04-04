/**
 * Sentry Error Monitoring
 *
 * Production error tracking & performance monitoring.
 * Only active when VITE_SENTRY_DSN is set.
 */

import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;
const appEnv = (import.meta.env.VITE_APP_ENV as string | undefined) ?? 'development';

export function initSentry(): void {
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.warn('[Sentry] VITE_SENTRY_DSN not set — error monitoring disabled.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: appEnv,
    release: `novalingo@${__APP_VERSION__}`,

    // Performance monitoring — sample 20% in production, 100% in dev
    tracesSampleRate: appEnv === 'production' ? 0.2 : 1.0,

    // Session replay — capture 10% of sessions, 100% on error
    replaysSessionSampleRate: appEnv === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // COPPA compliance — mask PII
        blockAllMedia: true,
      }),
    ],

    // Don't send PII
    sendDefaultPii: false,

    // Filter noisy errors
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'Network request failed',
      'Load failed',
      'AbortError',
    ],

    beforeSend(event) {
      // Strip any child names/emails from breadcrumbs (COPPA)
      if (event.breadcrumbs) {
        for (const breadcrumb of event.breadcrumbs) {
          if (breadcrumb.data) {
            delete breadcrumb.data['email'];
            delete breadcrumb.data['username'];
            delete breadcrumb.data['name'];
          }
        }
      }
      return event;
    },
  });
}

// Re-export for use in error boundaries
export { Sentry };

// Global version constant — injected by Vite define
declare const __APP_VERSION__: string;
