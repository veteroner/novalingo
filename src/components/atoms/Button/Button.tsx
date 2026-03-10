/**
 * Button Atom
 *
 * 3D press effect ile çocuk dostu buton.
 * Yaş grubuna göre boyut ve yuvarlama otomatik uyarlanır.
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-nova-blue text-white shadow-[0_4px_0_0_#0a6ba8] active:shadow-[0_2px_0_0_#0a6ba8] active:translate-y-[2px]',
  secondary:
    'bg-nova-orange text-white shadow-[0_4px_0_0_#cc7a00] active:shadow-[0_2px_0_0_#cc7a00] active:translate-y-[2px]',
  success:
    'bg-success text-white shadow-[0_4px_0_0_#2e7d32] active:shadow-[0_2px_0_0_#2e7d32] active:translate-y-[2px]',
  danger:
    'bg-error text-white shadow-[0_4px_0_0_#c62828] active:shadow-[0_2px_0_0_#c62828] active:translate-y-[2px]',
  ghost:
    'bg-transparent text-nova-blue border-2 border-nova-blue hover:bg-nova-blue/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm rounded-xl',
  md: 'h-12 px-6 text-base rounded-2xl',
  lg: 'h-14 px-8 text-lg rounded-2xl',
  xl: 'h-16 px-10 text-xl rounded-3xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold transition-all duration-150',
        'select-none touch-manipulation',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...(props as Record<string, unknown>)}
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
}
