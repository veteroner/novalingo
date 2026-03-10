// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { eventBus } from '../eventBus';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  describe('on / emit', () => {
    it('calls handler when event is emitted', () => {
      const handler = vi.fn();
      eventBus.on('xp:gained', handler);
      eventBus.emit('xp:gained', 'hello');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'xp:gained', payload: 'hello' }),
      );
    });

    it('supports multiple handlers for same event', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      eventBus.on('level:up', h1);
      eventBus.on('level:up', h2);
      eventBus.emit('level:up', 42);
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it('does not call handlers for different events', () => {
      const handler = vi.fn();
      eventBus.on('xp:gained', handler);
      eventBus.emit('level:up', 'nope');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('stops receiving events after unsubscribe', () => {
      const handler = vi.fn();
      const unsub = eventBus.on('xp:gained', handler);
      eventBus.emit('xp:gained', 1);
      expect(handler).toHaveBeenCalledTimes(1);

      unsub();
      eventBus.emit('xp:gained', 2);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('once', () => {
    it('fires handler only once', () => {
      const handler = vi.fn();
      eventBus.once('achievement:unlocked', handler);
      eventBus.emit('achievement:unlocked', 'first');
      eventBus.emit('achievement:unlocked', 'second');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ payload: 'first' }));
    });
  });

  describe('clear', () => {
    it('removes all handlers', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      eventBus.on('xp:gained', h1);
      eventBus.on('level:up', h2);
      eventBus.clear();
      eventBus.emit('xp:gained', 1);
      eventBus.emit('level:up', 2);
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('does not throw when emitting event with no listeners', () => {
      expect(() => {
        eventBus.emit('quest:completed', null);
      }).not.toThrow();
    });
  });

  describe('singleton export', () => {
    it('eventBus has expected methods', () => {
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.once).toBe('function');
      expect(typeof eventBus.clear).toBe('function');
    });
  });
});
