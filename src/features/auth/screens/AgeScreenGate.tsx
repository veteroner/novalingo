import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { Button } from '@components/atoms/Button';
import { SplashScreen } from '@capacitor/splash-screen';
import { assessBirthDate, getAgeBand, rememberAgeBand } from '@services/ageScreen/ageScreenPolicy';
import { isNative } from '@utils/platform';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Firebase/auth ağacı yaş doğrulaması tamamlanmadan yüklenmez. */
export function AgeScreenGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation('auth');
  const [band, setBand] = useState(getAgeBand);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (isNative()) void SplashScreen.hide().catch(() => undefined);
  }, []);

  // Web'deki yasal sayfalar (gizlilik, koşullar, hesap silme talebi) herkese
  // açık olmalı: mağaza kayıtları ve gizlilik politikası bu adreslere bağlanır.
  const isPublicLegalPage = !isNative() && window.location.pathname.startsWith('/legal');

  if (band || isPublicLegalPage) return <>{children}</>;

  return (
    <main className="safe-area-top safe-area-bottom nova-page flex min-h-screen items-center justify-center px-6 py-8">
      <form
        className="w-full max-w-sm space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const result = assessBirthDate(day, month, year);
          if (!result) {
            setInvalid(true);
            return;
          }
          rememberAgeBand(result.band, result.learnerAgeGroup);
          setDay('');
          setMonth('');
          setYear('');
          setBand(result.band);
        }}
      >
        <div className="flex justify-center">
          <NovaCharacter size="lg" />
        </div>
        <h1 className="text-text-primary text-center text-2xl font-bold">{t('ageScreen.title')}</h1>
        <p className="text-text-secondary text-center">{t('ageScreen.subtitle')}</p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { id: 'day', value: day, setValue: setDay, length: 2 },
              { id: 'month', value: month, setValue: setMonth, length: 2 },
              { id: 'year', value: year, setValue: setYear, length: 4 },
            ] as const
          ).map((field) => (
            <label key={field.id} className="text-text-primary space-y-2 text-sm font-semibold">
              <span>{t(`ageScreen.${field.id}`)}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={field.length}
                value={field.value}
                aria-invalid={invalid}
                aria-describedby={invalid ? 'birth-date-error' : undefined}
                onChange={(event) => {
                  field.setValue(event.target.value);
                  setInvalid(false);
                }}
                className="focus:border-nova-blue border-border bg-surface h-14 w-full rounded-2xl border-2 px-3 text-center text-xl focus:outline-none"
              />
            </label>
          ))}
        </div>
        {invalid && (
          <p id="birth-date-error" role="alert" className="text-error-ink text-sm">
            {t('ageScreen.invalid')}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="xl"
          fullWidth
          disabled={!day || !month || !year}
        >
          {t('ageScreen.continue')}
        </Button>
        <p className="text-text-secondary text-center text-xs">{t('ageScreen.privacy')}</p>
      </form>
    </main>
  );
}
