import { useMotionPolicy } from '@hooks/useMotionPolicy';
import type { NovaStage } from '@/types/user';
import { clsx } from 'clsx';
import { useState } from 'react';
import fallbackNova from '@assets/images/nova-fallback-v2.png?inline';

export type NovaMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sleeping'
  | 'encouraging'
  | 'celebrating'
  | 'listening'
  | 'speaking'
  | 'sad';

interface NovaCharacterProps {
  mood?: NovaMood;
  stage?: NovaStage;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  motionEnabled?: boolean;
  decorative?: boolean;
  className?: string;
}

const sizes = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-44 w-44',
  hero: 'h-56 w-52',
};

const poses: Record<NovaMood, string> = {
  idle: 'idle',
  happy: 'celebrate',
  excited: 'celebrate',
  thinking: 'thinking',
  sleeping: 'sleeping',
  encouraging: 'encouraging',
  celebrating: 'celebrate',
  listening: 'listen',
  speaking: 'speaking',
  sad: 'sad',
};

// A new pose gets a new image lifecycle; a previous error must not hide later moods.
function NovaPoseImage({ pose, decorative }: { pose: string; decorative: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? fallbackNova : `/nova/poses-v3/${pose}.webp`}
      onError={() => {
        if (!failed) setFailed(true);
      }}
      alt={decorative ? '' : 'Nova'}
      width={320}
      height={320}
      decoding="async"
      className="nova-character-art relative z-10 h-full w-full object-contain"
    />
  );
}

/** One visual source for Nova across home, lessons, conversation and rewards.
 * Raster poses keep the learning UI independent of WebGL/model loading.
 * Expressions are event-driven; no perpetual whole-body floating animation.
 */
export function NovaCharacter({
  mood = 'idle',
  stage = 'child',
  size = 'md',
  motionEnabled = true,
  decorative = false,
  className,
}: NovaCharacterProps) {
  const pose = poses[mood];
  const { canAnimate } = useMotionPolicy();

  return (
    <span
      className={clsx(
        'nova-character relative inline-flex shrink-0 items-end justify-center',
        sizes[size],
        className,
      )}
      data-mood={mood}
      data-pose={pose}
      data-stage={stage}
      data-motion={motionEnabled && canAnimate ? 'on' : 'off'}
      aria-hidden={decorative || undefined}
    >
      <span className="nova-contact-shadow" aria-hidden="true" />
      <NovaPoseImage key={pose} pose={pose} decorative={decorative} />
      {stage === 'legendary' && (
        <span className="nova-stage-star" aria-hidden="true">
          ✦
        </span>
      )}
      {stage === 'teen' && (
        <span className="nova-stage-mark" aria-hidden="true">
          ✦
        </span>
      )}
      {stage === 'adult' && (
        <span className="nova-stage-mark" aria-hidden="true">
          ✦✦
        </span>
      )}
    </span>
  );
}
