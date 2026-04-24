/**
 * Event Bus
 *
 * Uygulama genelinde loosely-coupled olay iletişimi.
 * Achievement, level-up, quest tamamlama gibi cross-cutting olaylar için.
 */

import { type AppEvent, type EventType } from '@/types/common';
import * as Sentry from '@sentry/react';

type EventHandler<T = unknown> = (event: AppEvent<T>) => void;

class EventBus {
  private handlers = new Map<EventType, Set<EventHandler>>();

  /**
   * Olaya abone ol
   */
  on<T = unknown>(type: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    const typedHandler = handler as EventHandler;
    this.handlers.get(type)?.add(typedHandler);

    // Unsubscribe fonksiyonu döndür
    return () => {
      this.handlers.get(type)?.delete(typedHandler);
    };
  }

  /**
   * Olay yayınla
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  emit<T = unknown>(type: EventType, payload: T): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as EventHandler<T>)(event);
        } catch (err) {
          if (import.meta.env.DEV) console.error(`Event handler error for ${type}:`, err);
          Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
            extra: { context: `Event handler error for ${type}` },
          });
        }
      });
    }
  }

  /**
   * Tek seferlik abone ol
   */
  once<T = unknown>(type: EventType, handler: EventHandler<T>): () => void {
    const unsubscribe = this.on<T>(type, (event) => {
      unsubscribe();
      handler(event);
    });
    return unsubscribe;
  }

  /**
   * Tüm dinleyicileri temizle
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton
export const eventBus = new EventBus();
