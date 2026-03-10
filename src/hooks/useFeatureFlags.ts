/**
 * useFeatureFlags
 *
 * Runtime feature flag hook — resolves flags based on environment.
 * In production, Firebase Remote Config overrides will be layered in.
 */

import { resolveFeatureFlags, type FeatureFlags } from '@/config/featureFlags';
import { useMemo } from 'react';

const env =
  import.meta.env.MODE === 'production'
    ? 'production'
    : import.meta.env.MODE === 'test'
      ? 'test'
      : 'development';

export function useFeatureFlags(): FeatureFlags {
  return useMemo(() => resolveFeatureFlags(env), []);
}
