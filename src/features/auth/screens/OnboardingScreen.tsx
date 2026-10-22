import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { useChildStore } from '@stores/childStore';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

/** One welcome screen; profile setup owns the parental gate and consent. */
export default function OnboardingScreen() {
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);
  const children = useChildStore((s) => s.children);
  const { t } = useTranslation('auth');
  if (child || children.length > 0) return <Navigate to="/home" replace />;

  return (
    <main className="safe-area-top safe-area-bottom nova-page flex min-h-screen items-center justify-center px-6 py-6">
      <div className="mx-auto w-full max-w-md space-y-5 text-center">
        <div className="flex justify-center">
          <NovaCharacter size="lg" className="sm:h-44 sm:w-44" decorative />
        </div>
        <Text variant="h2">{t('onboarding.page1Title')}</Text>
        <Text variant="body" className="text-text-secondary">
          {t('onboarding.page1Desc')}
        </Text>
        <ul className="bg-surface border-border space-y-4 rounded-3xl border p-5 text-left">
          <li>
            <Text variant="h4">{t('onboarding.page2Title')}</Text>
            <Text className="text-text-secondary">{t('onboarding.page2Desc')}</Text>
          </li>
          <li>
            <Text variant="h4">{t('onboarding.page3Title')}</Text>
            <Text className="text-text-secondary">{t('onboarding.page3Desc')}</Text>
          </li>
        </ul>
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={() => void navigate('/create-profile', { replace: true })}
        >
          {t('onboarding.start')}
        </Button>
      </div>
    </main>
  );
}
