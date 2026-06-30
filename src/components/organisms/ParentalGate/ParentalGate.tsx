/**
 * ParentalGate
 *
 * Ebeveyn kapısı — basit matematik sorusuyla çocuğun
 * yanlışlıkla profil oluşturmasını veya ayarlara erişmesini engeller.
 * COPPA uyumluluğu için gerekli.
 */

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ParentalGateProps {
  onPass: () => void;
  onCancel: () => void;
  /** When true, display COPPA + ToS consent checkboxes after math question. Use during account creation. */
  requireConsent?: boolean;
}

function generateQuestion(): { text: string; answer: number } {
  const a = Math.floor(Math.random() * 9) + 2; // 2-10
  const b = Math.floor(Math.random() * 9) + 2; // 2-10
  return { text: `${a} × ${b} = ?`, answer: a * b };
}

export function ParentalGate({ onPass, onCancel, requireConsent = false }: ParentalGateProps) {
  const { t } = useTranslation('common');
  const question = useMemo(() => generateQuestion(), []);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [mathPassed, setMathPassed] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentCoppa, setConsentCoppa] = useState(false);

  const canSubmitMath = input.length > 0;
  const canConfirmConsent = consentPrivacy && consentCoppa;

  const handleMathSubmit = useCallback(() => {
    const parsed = parseInt(input, 10);
    if (parsed === question.answer) {
      if (requireConsent) {
        setMathPassed(true);
      } else {
        onPass();
      }
    } else {
      setError(true);
      setInput('');
    }
  }, [input, question.answer, onPass, requireConsent]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {!mathPassed ? (
            <>
              <Text variant="h3" align="center" className="mb-2">
                {t('parentalGate.title')}
              </Text>
              <Text variant="body" align="center" className="text-text-secondary mb-6">
                {t('parentalGate.prompt')}
              </Text>

              <Text variant="h2" align="center" className="text-nova-blue mb-6">
                {question.text}
              </Text>

              <input
                type="number"
                inputMode="numeric"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMathSubmit();
                }}
                placeholder={t('parentalGate.answerPlaceholder')}
                className="focus:border-nova-blue mb-2 h-14 w-full rounded-2xl border-3 border-gray-200 bg-white px-4 text-center text-2xl font-bold transition-colors focus:outline-none"
                autoFocus
              />

              {error && (
                <Text variant="caption" align="center" className="text-error mb-2">
                  {t('parentalGate.wrong')}
                </Text>
              )}

              <div className="mt-4 space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleMathSubmit}
                  disabled={!canSubmitMath}
                >
                  {t('parentalGate.verify')}
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
                  {t('parentalGate.cancel')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Text variant="h3" align="center" className="mb-2">
                {t('parentalGate.consentTitle')}
              </Text>
              <Text variant="body" align="center" className="text-text-secondary mb-6">
                {t('parentalGate.consentPrompt')}
              </Text>

              <div className="mb-6 space-y-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consentPrivacy}
                    onChange={(e) => {
                      setConsentPrivacy(e.target.checked);
                    }}
                    className="mt-1 h-5 w-5 shrink-0 rounded accent-blue-500"
                    aria-label={t('parentalGate.consentAria')}
                  />
                  <span className="text-sm leading-snug text-gray-700">
                    <Trans
                      i18nKey="parentalGate.consentText"
                      ns="common"
                      components={{
                        privacy: (
                          <Link
                            to="/legal/privacy"
                            className="font-medium text-blue-600 underline"
                          />
                        ),
                        terms: (
                          <Link to="/legal/terms" className="font-medium text-blue-600 underline" />
                        ),
                      }}
                    />
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consentCoppa}
                    onChange={(e) => {
                      setConsentCoppa(e.target.checked);
                    }}
                    className="mt-1 h-5 w-5 shrink-0 rounded accent-blue-500"
                    aria-label={t('parentalGate.coppaAria')}
                  />
                  <span className="text-sm leading-snug text-gray-700">
                    <Trans
                      i18nKey="parentalGate.coppaText"
                      ns="common"
                      components={{
                        privacy: (
                          <Link
                            to="/legal/privacy"
                            className="font-medium text-blue-600 underline"
                          />
                        ),
                      }}
                    />
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={onPass}
                  disabled={!canConfirmConsent}
                >
                  {t('parentalGate.confirm')}
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
                  {t('parentalGate.cancel')}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
