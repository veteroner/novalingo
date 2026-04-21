/**
 * LoginScreen
 *
 * Giriş ekranı — Google, Apple, anonim giriş.
 * Çocuk-dostu splash + Nova maskotu.
 */

import novaMascot from '@assets/images/nova-mascot.svg';
import { Button } from '@components/atoms/Button';
import { Spinner } from '@components/atoms/Spinner';
import { Text } from '@components/atoms/Text';
import { signInAnonymousUser, signInWithApple, signInWithGoogle } from '@services/firebase/auth';
import { useAuthStore } from '@stores/authStore';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginScreen() {
  const navigate = useNavigate();
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      await signInWithGoogle();
      void navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [navigate, setLoading, setError]);

  const handleAppleLogin = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      await signInWithApple();
      void navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [navigate, setLoading, setError]);

  const handleAnonymousLogin = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      setLoading(true);
      await signInAnonymousUser();
      void navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  }, [navigate, setLoading, setError]);

  return (
    <div className="from-nova-sky flex min-h-screen flex-col items-center justify-center bg-linear-to-b to-white px-6">
      {/* Logo & Mascot */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={novaMascot} alt="Nova" className="mx-auto h-20 w-20" />
        </motion.div>
        <Text variant="h1" align="center" className="text-nova-blue">
          NovaLingo
        </Text>
        <Text variant="body" align="center" className="text-text-secondary mt-2">
          İngilizce öğrenmenin en eğlenceli yolu!
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
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={handleGoogleLogin}
              icon={<span>🔵</span>}
              disabled={!kvkkAccepted}
            >
              Google ile Giriş Yap
            </Button>

            <Button
              variant="ghost"
              size="xl"
              fullWidth
              onClick={handleAppleLogin}
              icon={<span>🍎</span>}
              disabled={!kvkkAccepted}
            >
              Apple ile Giriş Yap
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <Text variant="caption" className="text-text-secondary bg-white px-4">
                  veya
                </Text>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleAnonymousLogin}
              disabled={!kvkkAccepted}
            >
              Hemen Başla (Kayıtsız)
            </Button>

            <label className="mt-4 flex cursor-pointer items-start gap-3 text-left">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => {
                  setKvkkAccepted(e.target.checked);
                }}
                className="accent-nova-blue mt-1 h-5 w-5 shrink-0 rounded"
              />
              <Text variant="caption" className="text-text-tertiary">
                <Link
                  to="/legal/terms"
                  className="text-text-secondary font-medium underline"
                >
                  Kullanım Koşulları
                </Link>
                ,{' '}
                <Link
                  to="/legal/privacy"
                  className="text-text-secondary font-medium underline"
                >
                  Gizlilik Politikası
                </Link>{' '}
                ve{' '}
                <Link
                  to="/legal/privacy"
                  className="text-text-secondary font-medium underline"
                >
                  KVKK Aydınlatma Metni
                </Link>
                &#39;ni okudum ve kabul ediyorum.
              </Text>
            </label>
          </>
        )}
      </motion.div>
    </div>
  );
}
