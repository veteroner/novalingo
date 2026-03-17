/**
 * useAuth Hook
 *
 * Firebase Auth durumunu dinler ve store'u günceller.
 * Yeni kullanıcılar için Firestore user dokümanı otomatik oluşturulur
 * (bu, onUserCreated trigger'ını tetikler → preferences + welcome quest).
 */

import { type User } from '@/types/user';
import { onAuthChanged } from '@services/firebase/auth';
import { docs, getDocument, serverTimestamp, setDocument } from '@services/firebase/firestore';
import { useAuthStore } from '@stores/authStore';
import { useEffect, useRef } from 'react';

/** Map Firebase providerId to our union type */
function mapProvider(providerId: string | undefined): 'google' | 'apple' | 'anonymous' {
  if (providerId === 'google.com') return 'google';
  if (providerId === 'apple.com') return 'apple';
  return 'anonymous';
}

export function useAuth() {
  const {
    firebaseUser,
    user,
    isAuthenticated,
    isLoading,
    error,
    setFirebaseUser,
    setUser,
    setError,
  } = useAuthStore();

  // Track latest uid to prevent stale async callbacks from overwriting sign-out
  const latestUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged((fbUser) => {
      latestUidRef.current = fbUser?.uid ?? null;
      setFirebaseUser(fbUser);

      if (fbUser) {
        const uid = fbUser.uid;
        void getDocument<User>(docs.user(fbUser.uid))
          .then(async (userData) => {
            // If user signed out while async was in-flight, discard result
            if (latestUidRef.current !== uid) return;

            if (userData) {
              setUser(userData);
            } else {
              // New user — create Firestore document (triggers onUserCreated)
              const newUser = {
                email: fbUser.email ?? '',
                displayName: fbUser.displayName ?? '',
                photoURL: fbUser.photoURL ?? null,
                provider: mapProvider(fbUser.providerData[0]?.providerId),
                isPremium: true,
                premiumExpiresAt: null,
                activeChildId: null,
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                settings: {
                  language: 'tr' as const,
                  soundEnabled: true,
                  musicEnabled: true,
                  sfxVolume: 0.8,
                  bgmVolume: 0.5,
                  hapticEnabled: true,
                  notificationsEnabled: true,
                  dailyGoalMinutes: 10,
                  parentPin: null,
                },
              };
              await setDocument(docs.user(fbUser.uid), newUser);
              if (latestUidRef.current !== uid) return;
              // Re-read the doc so createdAt/lastLoginAt are resolved Timestamps
              const created = await getDocument<User>(docs.user(fbUser.uid));
              if (latestUidRef.current !== uid) return;
              setUser(created ?? ({ id: fbUser.uid, ...newUser } as unknown as User));
            }
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : 'Failed to fetch user');
          });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setFirebaseUser, setUser, setError]);

  return { firebaseUser, user, isAuthenticated, isLoading, error };
}
