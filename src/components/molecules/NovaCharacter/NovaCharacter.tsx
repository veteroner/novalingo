import { useMotionPolicy } from '@hooks/useMotionPolicy';
import type { NovaStage } from '@/types/user';
import { clsx } from 'clsx';
import { lazy, Suspense, useCallback, useRef, useState } from 'react';

import { useNova3DVisibility } from './useNova3DVisibility';
import fallbackNova from '@assets/images/nova-fallback-v2.png?inline';

const Nova3D = lazy(() => import('./three/Nova3D').catch(() => ({ default: () => <></> })));

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
  /** Prominent slots use the detailed local asset; compact lists keep lightweight artwork. */
  renderMode?: 'auto' | '3d' | 'image';
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
 * Detailed 3D in prominent scenes, with raster expressions and a bounded GPU budget.
 * Expressions are event-driven; no perpetual whole-body floating animation.
 */
export function NovaCharacter({
  mood = 'idle',
  stage = 'child',
  size = 'md',
  motionEnabled = true,
  decorative = false,
  className,
  renderMode = 'auto',
}: NovaCharacterProps) {
  const pose = poses[mood];
  const { canAnimate, isActive } = useMotionPolicy();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const unavailable = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  const host = useRef<HTMLSpanElement>(null);
  const prominent = size === 'lg' || size === 'xl' || size === 'hero';
  // Closed eyelids are not yet authored on the detailed rig; preserve the real sleeping expression.
  const requested =
    mood !== 'sleeping' && (renderMode === '3d' || (renderMode === 'auto' && prominent));
  const use3D = useNova3DVisibility(host, requested && !failed && isActive);
  const show3D = use3D && ready;

  return (
    <span
      ref={host}
      className={clsx(
        'nova-character relative inline-flex shrink-0 items-end justify-center',
        sizes[size],
        className,
      )}
      role={show3D && !decorative ? 'img' : undefined}
      aria-label={show3D && !decorative ? 'Nova' : undefined}
      data-renderer={show3D ? 'webgl' : 'image'}
      data-mood={mood}
      data-pose={pose}
      data-stage={stage}
      data-motion={motionEnabled && canAnimate ? 'on' : 'off'}
      aria-hidden={decorative || undefined}
    >
      <span className="nova-contact-shadow" aria-hidden="true" />
      <span
        className={clsx('h-full w-full', show3D && 'invisible')}
        aria-hidden={show3D || undefined}
      >
        <NovaPoseImage key={pose} pose={pose} decorative={decorative} />
      </span>
      {use3D && (
        <Suspense fallback={null}>
          <Nova3D
            mood={mood}
            stage={stage}
            canAnimate={motionEnabled && canAnimate}
            isActive={isActive}
            onReady={setReady}
            onUnavailable={unavailable}
          />
        </Suspense>
      )}
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
