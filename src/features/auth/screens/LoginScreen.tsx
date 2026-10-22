/**
 * LoginScreen
 *
 * Giriş ekranı — Google, Apple, anonim giriş.
 * Çocuk-dostu splash + Nova maskotu.
 */

import { isAdultSession } from '@services/ageScreen/ageScreenPolicy';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { AppleSignInButton } from '@components/atoms/AppleSignInButton';
import { GoogleSignInButton } from '@components/atoms/GoogleSignInButton';
import { Button } from '@components/atoms/Button';
import { Spinner } from '@components/atoms/Spinner';
import { Text } from '@components/atoms/Text';
import {
  isAppleSignInAvailable,
  isSignInCancelled,
  signInAnonymousUser,
  signInWithApple,
  signInWithGoogle,
} from '@services/firebase/auth';
import { useAuthStore } from '@stores/authStore';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginScreen() {
  const navigate = useNavigate();
  const allowSocialLogin = isAdultSession();
  const { t } = useTranslation('auth');
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [consentMissing, setConsentMissing] = useState(false);

  /**
   * Koşullar kabul edilmeden giriş başlatılmaz. Düğmeler devre dışı (gri)
   * gösterilmez: Apple HIG, Apple ile Giriş düğmesinin rengini değiştirmeyi
   * yasaklar. Onun yerine onay kutusunun altında uyarı gösterilir.
   */
  const requireConsent = useCallback(
    (action: () => Promise<void>) => () => {
      if (!kvkkAccepted) {
        setConsentMissing(true);
        return;
      }
      void action();
    },
    [kvkkAccepted],
  );

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      await signInWithGoogle();
      void navigate('/home', { replace: true });
    } catch (err) {
      // Kullanıcı hesap seçiciyi kapattıysa hata gösterme.
      if (isSignInCancelled(err)) return;
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [navigate, setLoading, setError, t]);

  const handleAppleLogin = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      await signInWithApple();
      void navigate('/home', { replace: true });
    } catch (err) {
      // Kullanıcı hesap seçiciyi kapattıysa hata gösterme.
      if (isSignInCancelled(err)) return;
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [navigate, setLoading, setError, t]);

  const handleAnonymousLogin = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      await signInAnonymousUser();
      void navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [navigate, setLoading, setError, t]);

  return (
    <div className="nova-page flex min-h-screen flex-col items-center justify-center px-6">
      {/* Logo & Mascot */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="mb-4 flex justify-center"
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          <NovaCharacter size="xl" />
        </motion.div>
        <Text variant="h1" align="center" className="text-nova-blue">
          NovaLingo
        </Text>
        <Text variant="body" align="center" className="text-text-secondary mt-2">
          {t('login.tagline')}
        </Text>
      </motion.div>

      {/* Login Buttons */}
      <motion.div
        className="w-full max-w-sm space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isLoggingIn ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Apple ile Giriş yalnızca iOS'ta (bkz. isAppleSignInAvailable). Düğme
                Apple HIG'e uyar ve diğer giriş düğmeleriyle aynı boyda, en üsttedir. */}
            {allowSocialLogin && isAppleSignInAvailable() && (
              <AppleSignInButton
                label={t('login.withApple')}
                onClick={requireConsent(handleAppleLogin)}
              />
            )}

            {allowSocialLogin && (
              <GoogleSignInButton
                label={t('login.withGoogle')}
                onClick={requireConsent(handleGoogleLogin)}
              />
            )}

            {allowSocialLogin && (
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="border-border w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <Text variant="caption" className="text-text-secondary bg-surface px-4">
                    {t('login.or')}
                  </Text>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={requireConsent(handleAnonymousLogin)}
            >
              {t('login.asGuest')}
            </Button>

            <label className="mt-4 flex cursor-pointer items-start gap-3 text-left">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => {
                  setKvkkAccepted(e.target.checked);
                  if (e.target.checked) setConsentMissing(false);
                }}
                className="accent-nova-blue mt-1 h-5 w-5 shrink-0 rounded"
              />
              <Text variant="caption" className="text-text-tertiary">
                <Trans
                  i18nKey="login.consent"
                  ns="auth"
                  components={{
                    terms: (
                      <Link
                        to="/legal/terms"
                        className="text-text-secondary font-medium underline"
                      />
                    ),
                    privacy: (
                      <Link
                        to="/legal/privacy"
                        className="text-text-secondary font-medium underline"
                      />
                    ),
                    kvkk: (
                      <Link
                        to="/legal/privacy"
                        className="text-text-secondary font-medium underline"
                      />
                    ),
                  }}
                />
              </Text>
            </label>
            {consentMissing && (
              <Text variant="caption" align="center" className="text-error" role="alert">
                {t('login.consentRequired')}
              </Text>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
