/**
 * Parent TanStack Query Hooks
 *
 * Ebeveyn ayarları okuma/kaydetme.
 */

import { docs, getDocument, updateDocument } from '@services/firebase/firestore';
import { useAuthStore } from '@stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ParentSettings {
  dailyLimit: number;
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    achievementAlert: boolean;
    inactivityAlert: boolean;
  };
  contentFilter: {
    socialFeatures: boolean;
    leaderboard: boolean;
    chatEnabled: boolean;
  };
}

const defaultSettings: ParentSettings = {
  dailyLimit: 30,
  notifications: {
    dailyReminder: true,
    weeklyReport: true,
    achievementAlert: true,
    inactivityAlert: false,
  },
  contentFilter: {
    socialFeatures: true,
    leaderboard: true,
    chatEnabled: false,
  },
};

export const parentKeys = {
  settings: (uid: string) => ['parentSettings', uid] as const,
};

export function useParentSettings() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);

  return useQuery({
    queryKey: parentKeys.settings(uid ?? ''),
    queryFn: async (): Promise<ParentSettings> => {
      if (!uid) return defaultSettings;
      const userData = await getDocument<{ settings?: Record<string, unknown> }>(docs.user(uid));
      if (!userData?.settings) return defaultSettings;
      const s = userData.settings;
      return {
        dailyLimit: typeof s.dailyLimit === 'number' ? s.dailyLimit : defaultSettings.dailyLimit,
        notifications: {
          ...defaultSettings.notifications,
          ...(s.notifications && typeof s.notifications === 'object' ? s.notifications : {}),
        },
        contentFilter: {
          ...defaultSettings.contentFilter,
          ...(s.contentFilter && typeof s.contentFilter === 'object' ? s.contentFilter : {}),
        },
      };
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveParentSettings() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ParentSettings) => {
      if (!uid) throw new Error('Not authenticated');
      await updateDocument(docs.user(uid), { settings });
    },
    onSuccess: () => {
      if (uid) {
        void queryClient.invalidateQueries({ queryKey: parentKeys.settings(uid) });
      }
    },
  });
}
