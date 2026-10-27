import { MotionPolicyContext } from '@hooks/useMotionPolicy';
import { isNative } from '@/utils/platform';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { MotionConfig } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Cosmetic motion only: never remount children or pause lesson/audio timers. */
export function AppMotionProvider({ children }: { children: ReactNode }) {
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden);
  const [nativeActive, setNativeActive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    const update = () => {
      setDocumentVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => {
      setReducedMotion(media.matches);
    };
    media.addEventListener('change', update);
    update();
    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!isNative()) return;
    let disposed = false;
    let receivedEvent = false;
    let listener: PluginListenerHandle | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      receivedEvent = true;
      if (!disposed) setNativeActive(isActive);
    })
      .then((handle) => {
        if (disposed) void handle.remove().catch(() => {});
        else listener = handle;
      })
      .catch(() => {});
    // A delayed initial query must not overwrite a more recent lifecycle event.
    void App.getState()
      .then(({ isActive }) => {
        if (!disposed && !receivedEvent) setNativeActive(isActive);
      })
      .catch(() => {});
    return () => {
      disposed = true;
      void listener?.remove().catch(() => {});
    };
  }, []);

  const isActive = documentVisible && nativeActive;
  const canAnimate = isActive && !reducedMotion;
  return (
    <MotionPolicyContext.Provider value={{ isActive, reducedMotion, canAnimate }}>
      <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
        <div className="contents" data-motion-active={isActive} data-motion-reduced={reducedMotion}>
          {children}
        </div>
      </MotionConfig>
    </MotionPolicyContext.Provider>
  );
}
