/**
 * useHaptic Hook
 *
 * Capacitor Haptics wrapper — dokunsal geri bildirim.
 */

import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export function useHaptic() {
  const light = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Web'de sessizce geç
    }
  }, []);

  const medium = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Web'de sessizce geç
    }
  }, []);

  const heavy = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // Web'de sessizce geç
    }
  }, []);

  const success = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Web'de sessizce geç
    }
  }, []);

  const error = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // Web'de sessizce geç
    }
  }, []);

  const warning = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      // Web'de sessizce geç
    }
  }, []);

  return { light, medium, heavy, success, error, warning };
}
