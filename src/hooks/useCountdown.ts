/**
 * useCountdown Hook
 *
 * Ders ve aktivite zamanlayıcıları için.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  initialSeconds: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  seconds: number;
  isRunning: boolean;
  progress: number; // 0-1 (kalan/toplam)
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newSeconds?: number) => void;
}

export function useCountdown({
  initialSeconds,
  autoStart = false,
  onComplete,
}: UseCountdownOptions): UseCountdownReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const onCompleteRef = useRef(onComplete);
  const totalRef = useRef(initialSeconds);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);
  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);
  const reset = useCallback(
    (newSeconds?: number) => {
      const s = newSeconds ?? initialSeconds;
      totalRef.current = s;
      setSeconds(s);
      setIsRunning(false);
    },
    [initialSeconds],
  );

  const progress = totalRef.current > 0 ? seconds / totalRef.current : 0;

  return { seconds, isRunning, progress, start, pause, resume, reset };
}
