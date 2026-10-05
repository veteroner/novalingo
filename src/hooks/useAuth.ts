/**
 * useAuth Hook
 *
 * Firebase Auth durumunu dinler ve store'u günceller.
 * Yeni kullanıcılar için Firestore user dokümanı otomatik oluşturulur
 * (bu, onUserCreated trigger'ını tetikler → preferences + welcome quest).
 */

import { DEFAULT_USER_SETTINGS, normalizeStoredUser, type StoredUser } from '@/types/user';
import { createLogger } from '@/utils/logger';
import { isAccountDeletionInProgress, onAuthChanged } from '@services/firebase/auth';
import {
  docs,
  serverTimestamp,
  setDocument,
  subscribeToDocument,
} from '@services/firebase/firestore';
import { useAuthStore } from '@stores/authStore';
import { useEffect, useRef } from 'react';

const log = createLogger('auth');

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
        unsubsDoc = subscribeToDocument<StoredUser>(docs.user(uid), (userData) => {
          if (latestUidRef.current !== uid) {
            log.debug('bayat kullanıcı anlık görüntüsü yok sayıldı', { uid });
            return;
          }

          if (userData) {
            log.debug('kullanıcı dokümanı yüklendi', {
              uid,
              isPremium: userData.isPremium,
              provider: userData.provider,
              hasSettings: Boolean(userData.settings),
            });
            // Eksik alanları varsayılanlarla doldur — `settings`'i olmayan eski dokümanlar
            // aksi halde `user.settings[key]` erişiminde uygulamayı çökertir.
            setUser(normalizeStoredUser(userData));
          } else if (isAccountDeletionInProgress()) {
            log.debug('hesap siliniyor; kullanıcı dokümanı yeniden oluşturulmadı', { uid });
          } else {
            // New user — create Firestore document (triggers onUserCreated)
            const newUser = {
              email: fbUser.email ?? '',
              displayName: fbUser.displayName ?? '',
              photoURL: fbUser.photoURL ?? null,
              provider: mapProvider(fbUser.providerData[0]?.providerId),
              // Yalnızca isPremium=false yazılabilir. premiumExpiresAt / subscription*
              // alanları sunucuya aittir ve oluştururken HİÇ bulunmamalıdır —
              // firestore.rules (isCleanUserCreate) aksi halde oluşturmayı reddeder.
              isPremium: false,
              activeChildId: null,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
              settings: { ...DEFAULT_USER_SETTINGS },
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
