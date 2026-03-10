/**
 * Badge Atom
 *
 * XP, seviye, streak vb. için küçük etiket.
 */

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'xp' | 'level' | 'streak' | 'star' | 'gem' | 'info' | 'success' | 'warning';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  xp: 'bg-nova-blue/15 text-nova-blue border-nova-blue/30',
  level: 'bg-nova-purple/15 text-nova-purple border-nova-purple/30',
  streak: 'bg-nova-orange/15 text-nova-orange border-nova-orange/30',
  star: 'bg-nova-yellow/15 text-nova-yellow-dark border-nova-yellow/30',
  gem: 'bg-nova-purple/15 text-nova-purple border-nova-purple/30',
  info: 'bg-info/15 text-info border-info/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-6 px-2 text-[0.625rem] gap-1',
  md: 'h-7 px-3 text-xs gap-1.5',
  lg: 'h-8 px-4 text-sm gap-2',
};

export function Badge({
  variant = 'info',
  size = 'md',
  icon,
  children,
  className,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full border font-bold',
        'whitespace-nowrap select-none',
        variantStyles[variant],
        sizeStyles[size],
        pulse && 'animate-pulse',
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
