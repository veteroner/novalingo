/**
 * StarRating Molecule
 *
 * Ders sonuç ekranı için 0-3 yıldız gösterimi.
 * Her yıldız sırayla animasyonla belirir.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StarRatingProps {
  /** 0 to 3 */
  stars: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'text-2xl gap-1',
  md: 'text-4xl gap-2',
  lg: 'text-6xl gap-3',
};

export function StarRating({ stars, size = 'md', animate = true, className }: StarRatingProps) {
  const clampedStars = Math.min(3, Math.max(0, Math.round(stars)));

  return (
    <div className={clsx('flex items-center', sizeStyles[size], className)}>
      {[1, 2, 3].map((i) => {
        const filled = i <= clampedStars;
        return (
          <motion.span
            key={i}
            initial={animate ? { scale: 0, rotate: -30, opacity: 0 } : false}
            animate={
              animate
                ? {
                    scale: filled ? 1 : 0.8,
                    rotate: 0,
                    opacity: 1,
                  }
                : undefined
            }
            transition={{
              delay: animate ? i * 0.25 : 0,
              type: 'spring',
              stiffness: 400,
              damping: 12,
            }}
            className={clsx(
              'select-none',
              filled ? 'drop-shadow-[0_2px_4px_rgba(255,193,7,0.5)]' : 'grayscale opacity-40',
            )}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}
