/**
 * DailyLimitScreen — ücretsiz katmanda günlük ders hakkı dolduğunda çocuğa
 * gösterilen ekran.
 *
 * Çocuğu doğrudan ödeme ekranına (ebeveyn kapısına) atmak yerine günü olumlu
 * kapatır ve ücretsiz kalan etkinliklere (hikâye, Nova ile Konuş) yönlendirir.
 * Plus düğmesi ebeveyne yöneliktir; `/subscription` rotası ebeveyn kapısının
 * arkasındadır, bu yüzden çocuk satın alma akışına tek başına giremez.
 */

import { FREE_TIER } from '@/config/constants';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { MainLayout } from '@components/templates/MainLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function DailyLimitScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('lesson');

  return (
    <MainLayout>
      <div className="flex flex-col items-center gap-5 px-5 py-8 text-center">
        <NovaCharacter mood="sleeping" size="xl" />
        <div className="space-y-2">
          <Text variant="h3">{t('dailyLimit.title')}</Text>
          <Text variant="body" className="text-text-secondary">
            {t('dailyLimit.message', { count: FREE_TIER.DAILY_LESSONS })}
          </Text>
        </div>

        <div className="grid w-full max-w-sm gap-3">
          <Button variant="primary" size="lg" fullWidth onClick={() => void navigate('/stories')}>
            {t('dailyLimit.stories')}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => void navigate('/conversation/topics')}
          >
            {t('dailyLimit.conversation')}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => void navigate('/home')}>
            {t('dailyLimit.home')}
          </Button>
        </div>

        <Card variant="outlined" padding="md" className="w-full max-w-sm">
          <div className="space-y-3">
            <Text variant="bodySmall" weight="bold">
              {t('dailyLimit.parentTitle')}
            </Text>
            <Text variant="caption" className="text-text-secondary">
              {t('dailyLimit.parentMessage')}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => void navigate('/subscription')}
            >
              {t('dailyLimit.parentCta')}
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
