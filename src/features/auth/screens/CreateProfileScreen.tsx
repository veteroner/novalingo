/**
 * CreateProfileScreen
 *
 * Tek formda profil oluşturma; ilk yaş girişinin ders grubunu yeniden kullanır.
 */

import type { AgeGroup } from '@/types';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { ParentalGate } from '@components/organisms/ParentalGate';
import {
  getLearnerAgeGroup,
  clearLearnerAgeGroup,
  isAdultSession,
} from '@services/ageScreen/ageScreenPolicy';
import {
  isProfileConsentPassed,
  markProfileConsentPassed,
} from '@services/parentGate/parentGateSession';
import { useChildStore } from '@stores/childStore';
import { useCreateChild } from '@hooks/queries';
import { useAuthStore } from '@stores/authStore';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface AgeGroupOption {
  id: AgeGroup;
  emoji: string;
}

// Etiket ve yaş aralığı i18n'den gelir (auth.createProfile.age / ageRange, id'ye göre).
const ageGroups: AgeGroupOption[] = [
  { id: 'cubs', emoji: '🐻' },
  { id: 'stars', emoji: '⭐' },
  { id: 'legends', emoji: '🏆' },
];

interface AvatarOption {
  id: string;
  emoji: string;
}

// Etiket i18n'den gelir (auth.createProfile.avatar, id'ye göre).
const avatars: AvatarOption[] = [
  { id: 'fox', emoji: '🦊' },
  { id: 'panda', emoji: '🐼' },
  { id: 'unicorn', emoji: '🦄' },
  { id: 'lion', emoji: '🦁' },
  { id: 'owl', emoji: '🦉' },
  { id: 'rabbit', emoji: '🐰' },
  { id: 'cat', emoji: '🐱' },
  { id: 'dog', emoji: '🐶' },
  { id: 'dragon', emoji: '🐉' },
  { id: 'astronaut', emoji: '🧑‍🚀' },
  { id: 'robot', emoji: '🤖' },
  { id: 'star', emoji: '🌟' },
];

// Allow Unicode letters, spaces, and emoji only
const NAME_PATTERN = /^[\p{L}\p{Extended_Pictographic}\s]+$/u;

/** Sağlayıcıdan gelen adı ilk ada indirger; kurallara uymuyorsa boş döner. */
function sanitizeSuggestedName(value: string): string {
  const first = value.trim().split(/\s+/)[0] ?? '';
  if (first.length < 2 || first.length > 20 || !NAME_PATTERN.test(first)) return '';
  return first;
}

export default function CreateProfileScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const createChildMutation = useCreateChild();
  // Apple/Google girişinde sağlayıcı zaten adı veriyor; kullanıcıdan tekrar
  // istememek için ilk profil adını onunla dolduruyoruz (App Store Yönerge 4).
  // `||`: Firestore'daki boş displayName ('') Firebase profilindeki adı gölgelemesin.
  const accountName = useAuthStore((s) => s.user?.displayName || s.firebaseUser?.displayName || '');
  const [name, setName] = useState(() => sanitizeSuggestedName(accountName));
  const hasProfiles = useChildStore((s) => Boolean(s.activeChild) || s.children.length > 0);
  const [suggestedAge] = useState(() => (hasProfiles ? null : getLearnerAgeGroup()));
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(suggestedAge);
  const [chooseAge, setChooseAge] = useState(!suggestedAge);
  const [selectedAvatar, setSelectedAvatar] = useState('owl');
  const [consentPassed, setConsentPassed] = useState(isProfileConsentPassed);
  const [error, setError] = useState<string | null>(null);

  const isCreating = createChildMutation.isPending;

  const validateName = useCallback(
    (value: string): string | null => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return t('createProfile.nameTooShort');
      if (trimmed.length > 20) return t('createProfile.nameTooLong');
      if (!NAME_PATTERN.test(trimmed)) return t('createProfile.nameInvalid');
      return null;
    },
    [t],
  );

  // Takma ad isteğe bağlı: boş bırakılırsa varsayılan ad kullanılır. Apple ile
  // Giriş'te ad paylaşılmamışsa bile kullanıcı bir isim yazmak zorunda kalmaz.
  const nameError = name.trim().length > 0 ? validateName(name) : null;
  const isNameValid = !nameError;
  const profileName = name.trim() || t('createProfile.defaultName');

  function handleCreate() {
    if (!isNameValid || !selectedAge || isCreating || !isProfileConsentPassed()) {
      if (!isProfileConsentPassed()) setConsentPassed(false);
      return;
    }
    setError(null);
    createChildMutation.mutate(
      { name: profileName, ageGroup: selectedAge, avatarId: selectedAvatar },
      {
        onSuccess: () => {
          clearLearnerAgeGroup();
          void navigate('/home', { replace: true });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : t('createProfile.createError'));
        },
      },
    );
  }

  if (!consentPassed)
    return (
      <ParentalGate
        requireConsent
        onPass={() => {
          markProfileConsentPassed();
          setConsentPassed(true);
        }}
        onCancel={() => void navigate(hasProfiles ? '/home' : '/onboarding', { replace: true })}
      />
    );

  return (
    <main className="safe-area-top safe-area-bottom nova-page min-h-screen px-6 py-6">
      <form
        className="mx-auto w-full max-w-lg space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleCreate();
        }}
      >
        <button
          type="button"
          disabled={isCreating}
          onClick={() => void navigate(hasProfiles ? '/home' : '/onboarding', { replace: true })}
          className="text-primary text-sm font-semibold"
        >
          {t('createProfile.back')}
        </button>
        <div>
          <Text variant="h2">{t('createProfile.title')}</Text>
          <Text className="text-text-secondary">{t('createProfile.subtitle')}</Text>
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-name" className="block font-bold">
            {t('createProfile.nameTitle')}
          </label>
          <Text variant="bodySmall" className="text-text-secondary">
            {t('createProfile.nameSubtitle')}
          </Text>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            placeholder={t('createProfile.namePlaceholder')}
            maxLength={20}
            disabled={isCreating}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'profile-name-error' : undefined}
            className="focus:border-primary border-border bg-surface h-14 w-full rounded-2xl border-2 px-4 text-lg focus:outline-none"
          />
          {nameError && (
            <p id="profile-name-error" role="alert" className="text-error-ink text-sm">
              {nameError}
            </p>
          )}
        </div>
        {chooseAge ? (
          <fieldset className="space-y-3" disabled={isCreating}>
            <legend className="font-bold">
              {t(
                isAdultSession() || hasProfiles
                  ? 'createProfile.childAgeTitle'
                  : 'createProfile.ageTitle',
              )}
            </legend>
            <Text variant="bodySmall" className="text-text-secondary">
              {t('createProfile.ageSubtitle')}
            </Text>
            <div className="grid grid-cols-3 gap-2">
              {ageGroups.map((group) => (
                <label
                  key={group.id}
                  className={`has-focus-visible:ring-primary cursor-pointer rounded-2xl border-2 p-3 text-center has-focus-visible:ring-2 has-focus-visible:ring-offset-2 ${selectedAge === group.id ? 'border-primary bg-primary-soft' : 'border-border bg-surface'}`}
                >
                  <input
                    type="radio"
                    name="lesson-group"
                    value={group.id}
                    checked={selectedAge === group.id}
                    onChange={() => {
                      setSelectedAge(group.id);
                    }}
                    className="sr-only"
                  />
                  <span className="block text-2xl" aria-hidden="true">
                    {group.emoji}
                  </span>
                  <span className="block text-sm font-bold">
                    {t(`createProfile.age.${group.id}`)}
                  </span>
                  <span className="text-text-secondary block text-xs">
                    {t(`createProfile.ageRange.${group.id}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="border-border bg-primary-soft flex items-center justify-between gap-3 rounded-2xl border p-4">
            <div>
              <Text weight="bold">
                {t('createProfile.inferredGroup', {
                  group: t(`createProfile.age.${selectedAge ?? 'stars'}`),
                })}
              </Text>
              <Text variant="bodySmall" className="text-text-secondary">
                {t('createProfile.inferredDescription')}
              </Text>
            </div>
            <button
              type="button"
              disabled={isCreating}
              className="text-primary text-sm font-bold"
              onClick={() => {
                setChooseAge(true);
              }}
            >
              {t('createProfile.changeGroup')}
            </button>
          </div>
        )}
        <fieldset disabled={isCreating} className="space-y-3">
          <legend className="font-bold">{t('createProfile.avatarTitle')}</legend>
          <div className="grid grid-cols-4 gap-2">
            {avatars.map((avatar) => (
              <label
                key={avatar.id}
                className={`has-focus-visible:ring-primary cursor-pointer rounded-2xl border-2 p-2 text-center has-focus-visible:ring-2 has-focus-visible:ring-offset-2 ${selectedAvatar === avatar.id ? 'border-primary bg-primary-soft' : 'border-border bg-surface'}`}
              >
                <input
                  type="radio"
                  name="avatar"
                  value={avatar.id}
                  checked={selectedAvatar === avatar.id}
                  onChange={() => {
                    setSelectedAvatar(avatar.id);
                  }}
                  className="sr-only"
                />
                <span className="block text-3xl" aria-hidden="true">
                  {avatar.emoji}
                </span>
                <span className="text-text-secondary block text-xs">
                  {t(`createProfile.avatar.${avatar.id}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-error-ink text-center text-sm">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="xl"
          fullWidth
          isLoading={isCreating}
          disabled={isCreating || !isNameValid || !selectedAge}
        >
          {isCreating ? t('createProfile.creating') : t('createProfile.start')}
        </Button>
      </form>
    </main>
  );
}
