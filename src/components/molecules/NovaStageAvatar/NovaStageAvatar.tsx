/**
 * NovaStageAvatar Molecule
 *
 * Nova maskotunun evrim aşamasına göre farklı görsel temsili.
 * 6 aşama: egg, baby, child, teen, adult, legendary.
 * Her aşamada farklı renkler, aksesuarlar ve parıltı efektleri.
 */

import type { NovaStage } from '@/types/user';
import { clsx } from 'clsx';
import { NovaCharacter } from '@components/molecules/NovaCharacter';

interface NovaStageAvatarProps {
  stage: NovaStage;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const STAGE_CONFIG: Record<
  NovaStage,
  {
    emoji: string;
    label: string;
    bodyColor: string;
    bodyLight: string;
    accentColor: string;
    glowColor: string;
    bgGradient: string;
  }
> = {
  egg: {
    emoji: '🥚',
    label: 'Yumurta',
    bodyColor: '#B0BEC5',
    bodyLight: '#CFD8DC',
    accentColor: '#90A4AE',
    glowColor: 'rgba(176,190,197,0.4)',
    bgGradient: 'from-gray-100 to-gray-200',
  },
  baby: {
    emoji: '🐣',
    label: 'Bebek',
    bodyColor: '#64B5F6',
    bodyLight: '#90CAF9',
    accentColor: '#42A5F5',
    glowColor: 'rgba(100,181,246,0.4)',
    bgGradient: 'from-blue-100 to-blue-200',
  },
  child: {
    emoji: '🦉',
    label: 'Çocuk',
    bodyColor: '#1E90FF',
    bodyLight: '#4DA6FF',
    accentColor: '#1565C0',
    glowColor: 'rgba(30,144,255,0.4)',
    bgGradient: 'from-blue-200 to-indigo-200',
  },
  teen: {
    emoji: '🦉',
    label: 'Genç',
    bodyColor: '#7C4DFF',
    bodyLight: '#B388FF',
    accentColor: '#651FFF',
    glowColor: 'rgba(124,77,255,0.4)',
    bgGradient: 'from-purple-200 to-violet-200',
  },
  adult: {
    emoji: '🦉',
    label: 'Yetişkin',
    bodyColor: '#FF6D00',
    bodyLight: '#FF9E40',
    accentColor: '#E65100',
    glowColor: 'rgba(255,109,0,0.4)',
    bgGradient: 'from-orange-200 to-amber-200',
  },
  legendary: {
    emoji: '🦉',
    label: 'Efsanevi',
    bodyColor: '#FFD700',
    bodyLight: '#FFE57F',
    accentColor: '#FFC107',
    glowColor: 'rgba(255,215,0,0.5)',
    bgGradient: 'from-yellow-200 to-amber-200',
  },
};

const sizeMap = {
  sm: { container: 'h-16 w-16', svg: 80, ring: 'ring-2', glow: 'shadow-md' },
  md: { container: 'h-24 w-24', svg: 120, ring: 'ring-3', glow: 'shadow-lg' },
  lg: { container: 'h-32 w-32', svg: 160, ring: 'ring-4', glow: 'shadow-xl' },
  xl: { container: 'h-44 w-44', svg: 220, ring: 'ring-4', glow: 'shadow-2xl' },
};

function EggStage({ bodyColor, bodyLight }: { bodyColor: string; bodyLight: string }) {
  return (
    <g>
      {/* Egg shell */}
      <ellipse cx="100" cy="110" rx="42" ry="52" fill={bodyLight} />
      <ellipse cx="100" cy="110" rx="38" ry="48" fill="white" opacity="0.3" />
      {/* Crack pattern */}
      <path
        d="M78 95 L85 80 L92 95 L99 78 L106 95 L113 82 L120 95"
        fill="none"
        stroke={bodyColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Glow dots on egg */}
      <circle cx="88" cy="120" r="3" fill={bodyColor} opacity="0.3" />
      <circle cx="112" cy="115" r="2.5" fill={bodyColor} opacity="0.3" />
      <circle cx="95" cy="135" r="2" fill={bodyColor} opacity="0.2" />
    </g>
  );
}

export function NovaStageAvatar({
  stage,
  size = 'md',
  animate = true,
  className,
}: NovaStageAvatarProps) {
  const config = STAGE_CONFIG[stage];
  const sizeConfig = sizeMap[size];

  if (stage !== 'egg') {
    return (
      <NovaCharacter stage={stage} size={size} motionEnabled={animate} className={className} />
    );
  }

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center',
        sizeConfig.container,
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        width={sizeConfig.svg * 0.8}
        height={sizeConfig.svg * 0.8}
        role="img"
        aria-label="Nova"
      >
        <EggStage bodyColor={config.bodyColor} bodyLight={config.bodyLight} />
      </svg>
    </div>
  );
}

export { STAGE_CONFIG };
