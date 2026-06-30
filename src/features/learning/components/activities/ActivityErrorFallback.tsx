import { useTranslation } from 'react-i18next';

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';

/**
 * Hata düşüş ekranı — class ActivityErrorBoundary hook kullanamadığı için
 * ayrı fonksiyonel bileşen olarak tutulur (i18n erişimi için).
 */
export function ActivityErrorFallback({ onSkip }: { onSkip: () => void }) {
  const { t } = useTranslation('lesson');
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Text variant="body" className="text-error">
        {t('activityUI.errorBoundary.message')}
      </Text>
      <Button variant="primary" size="md" onClick={onSkip}>
        {t('activityUI.errorBoundary.continue')}
      </Button>
    </div>
  );
}
