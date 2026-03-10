/**
 * Icon Atom
 *
 * Phosphor Icons wrapper. Tutarlı boyut ve renk API'si sağlar.
 */

import { type ComponentType, type CSSProperties } from 'react';
import { clsx } from 'clsx';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface IconProps {
  /** Phosphor icon component */
  icon: ComponentType<{ size?: number; weight?: string; className?: string; style?: CSSProperties }>;
  size?: IconSize;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
  label?: string; // accessibility label
}

const sizeValues: Record<IconSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 56,
};

export function Icon({
  icon: IconComponent,
  size = 'md',
  color,
  weight = 'bold',
  className,
  label,
}: IconProps) {
  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      className={clsx('inline-flex items-center justify-center shrink-0', className)}
      style={color ? { color } : undefined}
    >
      <IconComponent size={sizeValues[size]} weight={weight} />
    </span>
  );
}
