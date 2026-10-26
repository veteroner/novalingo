import { useEffect, useState, type RefObject } from 'react';
import {
  acquireNovaContext,
  onNovaContextAvailable,
  releaseNovaContext,
} from './three/novaRenderBudget';

/** Hidden/scrolling-out cards release their graphics resources, not just their frame loop. */
export function useNova3DVisibility(host: RefObject<HTMLSpanElement | null>, enabled: boolean) {
  const [hasContext, setHasContext] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element || !enabled) {
      setHasContext(false);
      return;
    }
    const owner = Symbol('Nova GPU');
    let visible = false;
    let disposed = false;
    const reserve = () => {
      if (disposed) return;
      if (visible) setHasContext(acquireNovaContext(owner));
      else {
        releaseNovaContext(owner);
        setHasContext(false);
      }
    };
    const unsubscribe = onNovaContextAvailable(reserve);
    const check = () => {
      const rect = element.getBoundingClientRect();
      visible =
        rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
      reserve();
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            visible =
              !!entry?.isIntersecting &&
              entry.boundingClientRect.width > 0 &&
              entry.boundingClientRect.height > 0;
            reserve();
          });
    if (observer) observer.observe(element);
    else {
      check();
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
    }
    return () => {
      disposed = true;
      observer?.disconnect();
      unsubscribe();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      releaseNovaContext(owner);
    };
  }, [enabled, host]);
  return enabled && hasContext;
}
