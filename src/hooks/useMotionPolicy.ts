import { createContext, useContext } from 'react';

export interface MotionPolicy {
  isActive: boolean;
  reducedMotion: boolean;
  canAnimate: boolean;
}

// Isolated component previews/tests can render without the application shell.
export const MotionPolicyContext = createContext<MotionPolicy>({
  isActive: true,
  reducedMotion: false,
  canAnimate: true,
});

export function useMotionPolicy(): MotionPolicy {
  return useContext(MotionPolicyContext);
}
