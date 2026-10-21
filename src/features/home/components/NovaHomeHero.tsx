import type { NovaStage } from '@/types/user';
import { Button } from '@components/atoms/Button';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { ArrowRightIcon, SparkleIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface NovaHomeHeroProps {
  stage: NovaStage;
  worldName: string;
  onContinue: () => void;
  onVisitNova: () => void;
}

export function NovaHomeHero({ stage, worldName, onContinue, onVisitNova }: NovaHomeHeroProps) {
  const { t } = useTranslation('home');
  return (
    <section
      className="border-border bg-surface shadow-card overflow-hidden rounded-3xl border"
      aria-label={t('hero.label')}
    >
      <div className="relative isolate min-h-64 overflow-hidden bg-[#e6efe2]">
        <img
          src="/scenes/forest-clearing.webp"
          alt=""
          width={1536}
          height={1024}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="relative z-20 m-4 inline-flex max-w-[65%] items-center gap-1.5 rounded-full bg-[#fffaf0]/95 px-3 py-1.5 text-xs font-extrabold text-[#25314c]">
          <SparkleIcon
            size={16}
            weight="fill"
            className="shrink-0 text-[#7e580d]"
            aria-hidden="true"
          />
          {t('hero.eyebrow')}
        </div>
        <button
          type="button"
          onClick={onVisitNova}
          className="absolute right-2 bottom-1 rounded-3xl p-2 transition-transform active:scale-95"
          aria-label={t('hero.visitNova')}
        >
          <NovaCharacter stage={stage} size="hero" decorative />
        </button>
        <div className="absolute bottom-5 left-4 z-20 max-w-[45%] rounded-2xl bg-[#fffaf0]/95 px-3 py-2 text-[#25314c]">
          <p className="text-xs font-semibold text-[#586441]">{t('hero.currentWorld')}</p>
          <h2 className="font-heading mt-0.5 text-xl leading-tight font-bold">{worldName}</h2>
        </div>
      </div>
      <div className="p-4">
        <Button
          fullWidth
          size="lg"
          onClick={onContinue}
          icon={<ArrowRightIcon size={22} aria-hidden="true" />}
          iconPosition="right"
        >
          {t('hero.continue')}
        </Button>
      </div>
    </section>
  );
}
