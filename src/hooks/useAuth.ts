/**
 * useAuth Hook
 *
 * Firebase Auth durumunu dinler ve store'u günceller.
 * Yeni kullanıcılar için Firestore user dokümanı otomatik oluşturulur
 * (bu, onUserCreated trigger'ını tetikler → preferences + welcome quest).
 */

import { type User } from '@/types/user';
import { onAuthChanged } from '@services/firebase/auth';
import {
  docs,
  serverTimestamp,
  setDocument,
  subscribeToDocument,
} from '@services/firebase/firestore';
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
    let unsubsDoc: (() => void) | null = null;

    const unsubscribe = onAuthChanged((fbUser) => {
      latestUidRef.current = fbUser?.uid ?? null;
      setFirebaseUser(fbUser);

      if (unsubsDoc) {
        unsubsDoc();
        unsubsDoc = null;
      }

      if (fbUser) {
        const uid = fbUser.uid;
        unsubsDoc = subscribeToDocument<User>(docs.user(uid), (userData) => {
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
              isPremium: false,
              premiumExpiresAt: null,
              subscriptionState: 'expired',
              subscriptionPlatform: null,
              subscriptionProductId: null,
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
            void setDocument(docs.user(uid), newUser).catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Failed to create user');
            });
          }
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      if (unsubsDoc) unsubsDoc();
      unsubscribe();
    };
  }, [setFirebaseUser, setUser, setError]);

  return { firebaseUser, user, isAuthenticated, isLoading, error };
}
