/**
 * Card Molecule
 *
 * Genel amaçlı kart bileşeni — dünya, ders, mağaza, koleksiyon vb.
 * 3D kaldırma efekti ve çocuk-dostu köşeler.
 */

import { type ReactNode } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { clsx } from 'clsx';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass';

interface CardProps {
  variant?: CardVariant;
  pressable?: boolean;
  disabled?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-white shadow-lg shadow-black/5 border border-gray-100',
  outlined: 'bg-white border-2 border-gray-200',
  filled: 'bg-gray-50 border border-gray-100',
  glass: 'bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const roundedStyles: Record<string, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

export function Card({
  variant = 'elevated',
  pressable = false,
  disabled = false,
  padding = 'md',
  rounded = '2xl',
  children,
  className,
  onClick,
}: CardProps) {
  const motionProps: MotionProps = pressable
    ? {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <motion.div
      className={clsx(
        'overflow-hidden transition-colors',
        variantStyles[variant],
        paddingStyles[padding],
        roundedStyles[rounded],
        pressable && !disabled && 'cursor-pointer',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      onClick={!disabled ? onClick : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
