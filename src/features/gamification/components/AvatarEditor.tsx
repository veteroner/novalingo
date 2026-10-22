import { AVATAR_IDS, resolveAvatarId } from '@/config/avatars';
import { Avatar } from '@components/atoms/Avatar';
import { Button } from '@components/atoms/Button';
import { useUpdateChild } from '@hooks/queries';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AvatarEditor({
  childId,
  avatarId,
  name,
  onClose,
}: {
  childId: string;
  avatarId: string;
  name: string;
  onClose: (saved: boolean) => void;
}) {
  const { t } = useTranslation(['gamification', 'auth']);
  const [selected, setSelected] = useState(resolveAvatarId(avatarId));
  const selectedInput = useRef<HTMLInputElement>(null);
  const mutation = useUpdateChild();
  const saving = mutation.isPending;
  useEffect(() => {
    selectedInput.current?.focus();
  }, []);

  return (
    <form
      id="profile-avatar-editor"
      className="border-border bg-surface space-y-4 rounded-3xl border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (saving || selected === resolveAvatarId(avatarId)) return;
        mutation.mutate(
          { childId, avatarId: selected },
          {
            onSuccess: () => {
              onClose(true);
            },
          },
        );
      }}
    >
      <fieldset disabled={saving} className="space-y-4">
        <legend className="text-lg font-bold">{t('profile.avatar.title')}</legend>
        <p className="text-text-secondary text-sm">{t('profile.avatar.description')}</p>
        <div className="grid grid-cols-3 gap-2">
          {AVATAR_IDS.map((id) => (
            <label
              key={id}
              className={`has-focus-visible:ring-primary flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 px-1 py-3 has-focus-visible:ring-2 has-focus-visible:ring-offset-2 ${selected === id ? 'border-primary bg-primary-soft' : 'border-border bg-surface'} ${saving ? 'opacity-60' : ''}`}
            >
              <input
                ref={selected === id ? selectedInput : undefined}
                type="radio"
                name="profile-avatar"
                value={id}
                checked={selected === id}
                onChange={() => {
                  setSelected(id);
                  mutation.reset();
                }}
                className="sr-only"
              />
              <span aria-hidden="true">
                <Avatar avatarId={id} name={name} size="md" />
              </span>
              <span className="text-text-primary text-center text-xs font-semibold">
                {t(`auth:createProfile.avatar.${id}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {mutation.isError && (
        <p role="alert" className="text-error-ink text-sm">
          {t('profile.avatar.error')}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          fullWidth
          disabled={saving}
          onClick={() => {
            onClose(false);
          }}
        >
          {t('profile.avatar.cancel')}
        </Button>
        <Button
          type="submit"
          fullWidth
          isLoading={saving}
          disabled={saving || selected === resolveAvatarId(avatarId)}
        >
          {t('profile.avatar.save')}
        </Button>
      </div>
      {saving && (
        <p role="status" className="text-text-secondary text-sm">
          {t('profile.avatar.saving')}
        </p>
      )}
    </form>
  );
}
