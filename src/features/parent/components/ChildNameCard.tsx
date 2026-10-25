/**
 * ChildNameCard — çocuk profilinin adını ebeveyn ayarlarından değiştirme.
 *
 * Apple/Google ile giriş yapanlara profil oluştururken ad sorulmaz (App Store
 * Yönerge 4); çocuk "Kâşif" olarak başlar ve ebeveyn adı buradan verir.
 */

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { useUpdateChild } from '@hooks/queries';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NAME_PATTERN = /^[\p{L}\p{Extended_Pictographic}\s]+$/u;

interface ChildNameCardProps {
  childId: string;
  currentName: string;
}

export function ChildNameCard({ childId, currentName }: ChildNameCardProps) {
  const { t } = useTranslation('parent');
  const updateChild = useUpdateChild();
  const [name, setName] = useState(currentName);
  const [saved, setSaved] = useState(false);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 2 && trimmed.length <= 20 && NAME_PATTERN.test(trimmed);
  const isDirty = trimmed !== currentName;

  return (
    <Card variant="elevated" padding="md">
      <Text variant="h4" className="mb-1">
        {t('settings.childNameTitle')}
      </Text>
      <Text variant="bodySmall" className="text-text-secondary mb-3">
        {t('settings.childNameDesc')}
      </Text>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          maxLength={20}
          aria-label={t('settings.childNameTitle')}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className="border-border bg-surface text-text focus:border-primary h-12 min-w-0 flex-1 rounded-xl border-2 px-3 font-semibold focus:outline-none"
        />
        <Button
          variant="primary"
          size="md"
          disabled={!isValid || !isDirty || updateChild.isPending}
          onClick={() => {
            updateChild.mutate(
              { childId, name: trimmed },
              {
                onSuccess: () => {
                  setSaved(true);
                },
              },
            );
          }}
        >
          {t('settings.childNameSave')}
        </Button>
      </div>
      {!isValid && trimmed.length > 0 && (
        <Text variant="caption" className="text-error mt-1">
          {t('settings.childNameInvalid')}
        </Text>
      )}
      {saved && (
        <Text variant="caption" className="text-success mt-1">
          {t('settings.childNameSaved')}
        </Text>
      )}
      {updateChild.isError && (
        <Text variant="caption" className="text-error mt-1">
          {t('settings.childNameError')}
        </Text>
      )}
    </Card>
  );
}
