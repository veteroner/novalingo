/**
 * Spinner Atom
 *
 * Dönen yükleme göstergesi.
 */

import { clsx } from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

export function Spinner({ size = 'md', color, className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-nova-blue/30 border-t-nova-blue',
        sizeStyles[size],
        className,
      )}
      style={
        color
          ? {
              borderColor: `${color}33`,
              borderTopColor: color,
            }
          : undefined
      }
      role="status"
      aria-label="Yükleniyor"
    >
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
}
