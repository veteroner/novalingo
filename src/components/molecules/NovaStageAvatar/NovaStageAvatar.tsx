/**
 * NovaStageAvatar Molecule
 *
 * Nova maskotunun evrim aşamasına göre farklı görsel temsili.
 * 6 aşama: egg, baby, child, teen, adult, legendary.
 * Her aşamada farklı renkler, aksesuarlar ve parıltı efektleri.
 */

import type { NovaStage } from '@/types/user';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

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

function BabyStage({
  bodyColor,
  bodyLight,
  accentColor,
}: {
  bodyColor: string;
  bodyLight: string;
  accentColor: string;
}) {
  return (
    <g>
      {/* Tiny body */}
      <ellipse cx="100" cy="140" rx="32" ry="28" fill={bodyColor} />
      <ellipse cx="100" cy="140" rx="28" ry="24" fill={bodyLight} />
      {/* Belly */}
      <ellipse cx="100" cy="148" rx="18" ry="14" fill="#E8F4FD" />
      {/* Head - bigger relative to body (baby proportions) */}
      <circle cx="100" cy="95" r="32" fill={bodyColor} />
      <circle cx="100" cy="95" r="28" fill={bodyLight} />
      {/* Big baby eyes */}
      <circle cx="88" cy="92" r="12" fill="white" />
      <circle cx="112" cy="92" r="12" fill="white" />
      <circle cx="90" cy="90" r="7" fill="#1A1A2E" />
      <circle cx="114" cy="90" r="7" fill="#1A1A2E" />
      {/* Eye shine (big sparkly) */}
      <circle cx="93" cy="87" r="3" fill="white" />
      <circle cx="117" cy="87" r="3" fill="white" />
      {/* Tiny beak */}
      <path d="M96 100 L100 108 L104 100 Z" fill="#FFA726" />
      {/* Baby tuft */}
      <path d="M95 65 Q100 50 105 65" fill={accentColor} />
      {/* Tiny wings */}
      <ellipse cx="70" cy="130" rx="10" ry="18" fill={accentColor} transform="rotate(-10 70 130)" />
      <ellipse
        cx="130"
        cy="130"
        rx="10"
        ry="18"
        fill={accentColor}
        transform="rotate(10 130 130)"
      />
      {/* Tiny feet */}
      <ellipse cx="90" cy="166" rx="10" ry="5" fill="#FFA726" />
      <ellipse cx="110" cy="166" rx="10" ry="5" fill="#FFA726" />
    </g>
  );
}

function ChildStage({
  bodyColor,
  bodyLight,
  accentColor,
}: {
  bodyColor: string;
  bodyLight: string;
  accentColor: string;
}) {
  return (
    <g>
      {/* Body */}
      <ellipse cx="100" cy="130" rx="48" ry="44" fill={bodyColor} />
      <ellipse cx="100" cy="130" rx="44" ry="40" fill={bodyLight} />
      {/* Belly */}
      <ellipse cx="100" cy="142" rx="28" ry="24" fill="#E8F4FD" />
      {/* Head */}
      <circle cx="100" cy="75" r="38" fill={bodyColor} />
      <circle cx="100" cy="75" r="34" fill={bodyLight} />
      {/* Eyes */}
      <circle cx="85" cy="72" r="14" fill="white" />
      <circle cx="115" cy="72" r="14" fill="white" />
      <circle cx="87" cy="70" r="8" fill="#1A1A2E" />
      <circle cx="117" cy="70" r="8" fill="#1A1A2E" />
      <circle cx="90" cy="67" r="3" fill="white" />
      <circle cx="120" cy="67" r="3" fill="white" />
      {/* Beak */}
      <path d="M93 82 L100 93 L107 82 Z" fill="#FFA726" />
      {/* Ear tufts */}
      <path d="M70 48 L76 34 L83 50" fill={accentColor} />
      <path d="M130 48 L124 34 L117 50" fill={accentColor} />
      {/* Wings */}
      <ellipse cx="55" cy="120" rx="14" ry="28" fill={accentColor} transform="rotate(-12 55 120)" />
      <ellipse
        cx="145"
        cy="120"
        rx="14"
        ry="28"
        fill={accentColor}
        transform="rotate(12 145 120)"
      />
      {/* Feet */}
      <ellipse cx="84" cy="172" rx="12" ry="6" fill="#FFA726" />
      <ellipse cx="116" cy="172" rx="12" ry="6" fill="#FFA726" />
      {/* Backpack strap hint */}
      <line
        x1="78"
        y1="100"
        x2="78"
        y2="140"
        stroke={accentColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  );
}

function TeenStage({
  bodyColor,
  bodyLight,
  accentColor,
}: {
  bodyColor: string;
  bodyLight: string;
  accentColor: string;
}) {
  return (
    <g>
      {/* Body (taller) */}
      <ellipse cx="100" cy="132" rx="52" ry="48" fill={bodyColor} />
      <ellipse cx="100" cy="132" rx="48" ry="44" fill={bodyLight} />
      {/* Belly */}
      <ellipse cx="100" cy="145" rx="30" ry="26" fill="#EDE7F6" />
      {/* Head */}
      <circle cx="100" cy="72" r="40" fill={bodyColor} />
      <circle cx="100" cy="72" r="36" fill={bodyLight} />
      {/* Cool eyes (slightly narrower) */}
      <ellipse cx="83" cy="68" rx="14" ry="12" fill="white" />
      <ellipse cx="117" cy="68" rx="14" ry="12" fill="white" />
      <circle cx="85" cy="67" r="8" fill="#1A1A2E" />
      <circle cx="119" cy="67" r="8" fill="#1A1A2E" />
      <circle cx="88" cy="64" r="2.5" fill="white" />
      <circle cx="122" cy="64" r="2.5" fill="white" />
      {/* Beak */}
      <path d="M93 80 L100 92 L107 80 Z" fill="#FFA726" />
      {/* Ear tufts (spikier) */}
      <path d="M66 42 L72 24 L82 46" fill={accentColor} />
      <path d="M134 42 L128 24 L118 46" fill={accentColor} />
      {/* Wings (larger) */}
      <ellipse cx="50" cy="118" rx="16" ry="32" fill={accentColor} transform="rotate(-14 50 118)" />
      <ellipse
        cx="150"
        cy="118"
        rx="16"
        ry="32"
        fill={accentColor}
        transform="rotate(14 150 118)"
      />
      {/* Feet */}
      <ellipse cx="82" cy="178" rx="14" ry="7" fill="#FFA726" />
      <ellipse cx="118" cy="178" rx="14" ry="7" fill="#FFA726" />
      {/* Headphones */}
      <path
        d="M62 58 Q60 40 76 36"
        fill="none"
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M138 58 Q140 40 124 36"
        fill="none"
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="62" cy="62" r="8" fill={accentColor} />
      <circle cx="138" cy="62" r="8" fill={accentColor} />
    </g>
  );
}

function AdultStage({
  bodyColor,
  bodyLight,
  accentColor,
}: {
  bodyColor: string;
  bodyLight: string;
  accentColor: string;
}) {
  return (
    <g>
      {/* Body (full size) */}
      <ellipse cx="100" cy="130" rx="56" ry="52" fill={bodyColor} />
      <ellipse cx="100" cy="130" rx="52" ry="48" fill={bodyLight} />
      {/* Belly */}
      <ellipse cx="100" cy="143" rx="32" ry="28" fill="#FFF3E0" />
      {/* Head */}
      <circle cx="100" cy="70" r="42" fill={bodyColor} />
      <circle cx="100" cy="70" r="38" fill={bodyLight} />
      {/* Wise eyes */}
      <circle cx="82" cy="66" r="15" fill="white" />
      <circle cx="118" cy="66" r="15" fill="white" />
      <circle cx="84" cy="64" r="9" fill="#1A1A2E" />
      <circle cx="120" cy="64" r="9" fill="#1A1A2E" />
      <circle cx="87" cy="61" r="3" fill="white" />
      <circle cx="123" cy="61" r="3" fill="white" />
      {/* Beak */}
      <path d="M93 80 L100 94 L107 80 Z" fill="#FFA726" />
      {/* Ear tufts (majestic) */}
      <path d="M64 40 L70 20 L80 44" fill={accentColor} />
      <path d="M136 40 L130 20 L120 44" fill={accentColor} />
      {/* Wings (powerful) */}
      <ellipse cx="46" cy="116" rx="18" ry="34" fill={accentColor} transform="rotate(-15 46 116)" />
      <ellipse
        cx="154"
        cy="116"
        rx="18"
        ry="34"
        fill={accentColor}
        transform="rotate(15 154 116)"
      />
      {/* Feet */}
      <ellipse cx="80" cy="180" rx="15" ry="8" fill="#FFA726" />
      <ellipse cx="120" cy="180" rx="15" ry="8" fill="#FFA726" />
      {/* Graduation cap */}
      <rect x="72" y="34" width="56" height="5" rx="2" fill="#1A1A2E" />
      <polygon points="100,22 72,36 128,36" fill="#1A1A2E" />
      <line x1="100" y1="22" x2="100" y2="14" stroke="#FFA726" strokeWidth="2" />
      <circle cx="100" cy="12" r="4" fill="#FFA726" />
    </g>
  );
}

function LegendaryStage({
  bodyColor,
  bodyLight,
  accentColor,
}: {
  bodyColor: string;
  bodyLight: string;
  accentColor: string;
}) {
  return (
    <g>
      {/* Aura rings */}
      <circle
        cx="100"
        cy="110"
        r="90"
        fill="none"
        stroke={bodyColor}
        strokeWidth="1"
        opacity="0.2"
      />
      <circle
        cx="100"
        cy="110"
        r="80"
        fill="none"
        stroke={bodyColor}
        strokeWidth="1.5"
        opacity="0.3"
      />
      {/* Body (majestic) */}
      <ellipse cx="100" cy="130" rx="58" ry="54" fill={bodyColor} />
      <ellipse cx="100" cy="130" rx="54" ry="50" fill={bodyLight} />
      {/* Belly - golden */}
      <ellipse cx="100" cy="143" rx="34" ry="30" fill="#FFF8E1" />
      {/* Head */}
      <circle cx="100" cy="68" r="44" fill={bodyColor} />
      <circle cx="100" cy="68" r="40" fill={bodyLight} />
      {/* Legendary wise eyes */}
      <circle cx="80" cy="64" r="16" fill="white" />
      <circle cx="120" cy="64" r="16" fill="white" />
      <circle cx="82" cy="62" r="10" fill="#1A1A2E" />
      <circle cx="122" cy="62" r="10" fill="#1A1A2E" />
      {/* Golden eye sparkle */}
      <circle cx="86" cy="58" r="4" fill={bodyColor} />
      <circle cx="126" cy="58" r="4" fill={bodyColor} />
      <circle cx="78" cy="56" r="2" fill="white" />
      <circle cx="118" cy="56" r="2" fill="white" />
      {/* Golden beak */}
      <path d="M92 78 L100 93 L108 78 Z" fill="#FFB300" />
      {/* Crown */}
      <polygon points="78,30 84,14 92,26 100,8 108,26 116,14 122,30" fill={bodyColor} />
      <circle cx="100" cy="12" r="5" fill="#FF6D00" />
      <circle cx="88" cy="20" r="3" fill="#FF6D00" />
      <circle cx="112" cy="20" r="3" fill="#FF6D00" />
      {/* Ear tufts (flame-like) */}
      <path d="M60 38 L64 16 L72 22 L76 4 L82 40" fill={accentColor} />
      <path d="M140 38 L136 16 L128 22 L124 4 L118 40" fill={accentColor} />
      {/* Wings (massive, flame-tipped) */}
      <ellipse cx="42" cy="114" rx="20" ry="38" fill={accentColor} transform="rotate(-16 42 114)" />
      <ellipse
        cx="158"
        cy="114"
        rx="20"
        ry="38"
        fill={accentColor}
        transform="rotate(16 158 114)"
      />
      {/* Wing flame tips */}
      <circle cx="30" cy="90" r="6" fill="#FF6D00" opacity="0.7" />
      <circle cx="170" cy="90" r="6" fill="#FF6D00" opacity="0.7" />
      {/* Feet */}
      <ellipse cx="80" cy="182" rx="15" ry="8" fill="#FFB300" />
      <ellipse cx="120" cy="182" rx="15" ry="8" fill="#FFB300" />
      {/* Sparkles around */}
      <text x="35" y="60" fontSize="12" opacity="0.6">
        ✦
      </text>
      <text x="158" y="50" fontSize="10" opacity="0.5">
        ✦
      </text>
      <text x="45" y="170" fontSize="8" opacity="0.4">
        ✦
      </text>
      <text x="150" y="165" fontSize="9" opacity="0.4">
        ✦
      </text>
    </g>
  );
}

const STAGE_RENDERERS: Record<
  NovaStage,
  (colors: { bodyColor: string; bodyLight: string; accentColor: string }) => React.ReactNode
> = {
  egg: ({ bodyColor, bodyLight }) => <EggStage bodyColor={bodyColor} bodyLight={bodyLight} />,
  baby: (c) => <BabyStage {...c} />,
  child: (c) => <ChildStage {...c} />,
  teen: (c) => <TeenStage {...c} />,
  adult: (c) => <AdultStage {...c} />,
  legendary: (c) => <LegendaryStage {...c} />,
};

export function NovaStageAvatar({
  stage,
  size = 'md',
  animate = true,
  className,
}: NovaStageAvatarProps) {
  const config = STAGE_CONFIG[stage];
  const sizeConfig = sizeMap[size];

  const idleAnimation = animate
    ? {
        y: [0, -4, 0],
        rotate: stage === 'egg' ? [0, 2, -2, 0] : [0, 3, -3, 0],
      }
    : undefined;

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      {/* Glow ring */}
      <div
        className={clsx(
          'absolute inset-0 rounded-full blur-md',
          stage === 'legendary' && 'animate-pulse',
        )}
        style={{ backgroundColor: config.glowColor }}
      />

      {/* Container */}
      <motion.div
        className={clsx(
          'relative rounded-full',
          `bg-linear-to-b ${config.bgGradient}`,
          sizeConfig.container,
          sizeConfig.ring,
          sizeConfig.glow,
          'flex items-center justify-center overflow-hidden',
        )}
        style={{ borderColor: config.bodyColor }}
        animate={idleAnimation}
        transition={animate ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <svg
          viewBox="0 0 200 200"
          width={sizeConfig.svg * 0.65}
          height={sizeConfig.svg * 0.65}
          className="relative z-10"
        >
          {STAGE_RENDERERS[stage]({
            bodyColor: config.bodyColor,
            bodyLight: config.bodyLight,
            accentColor: config.accentColor,
          })}
        </svg>
      </motion.div>
    </div>
  );
}

export { STAGE_CONFIG };
