/**
 * Text Atom
 *
 * Tipografi bileşeni — çocuk-dostu boyutlar.
 * Nunito (body) ve Baloo 2 (heading) font ailelerini kullanır.
 */

import { type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline';

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  variant?: TextVariant;
  as?: ElementType;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  truncate?: boolean;
  children: ReactNode;
  className?: string;
}

const variantTag: Record<TextVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  label: 'span',
  overline: 'span',
};

const variantStyles: Record<TextVariant, string> = {
  h1: 'font-heading text-4xl font-extrabold leading-tight',
  h2: 'font-heading text-3xl font-bold leading-tight',
  h3: 'font-heading text-2xl font-bold leading-snug',
  h4: 'font-heading text-xl font-bold leading-snug',
  body: 'font-body text-base leading-relaxed',
  bodySmall: 'font-body text-sm leading-relaxed',
  caption: 'font-body text-xs leading-normal',
  label: 'font-body text-sm font-semibold leading-normal uppercase tracking-wide',
  overline: 'font-body text-[0.625rem] font-bold uppercase tracking-widest',
};

const alignStyles: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const weightStyles: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export function Text({
  variant = 'body',
  as,
  color,
  align,
  weight,
  truncate = false,
  children,
  className,
  ...props
}: TextProps) {
  const Component = as ?? variantTag[variant];

  return (
    <Component
      className={clsx(
        variantStyles[variant],
        align && alignStyles[align],
        weight && weightStyles[weight],
        truncate && 'truncate',
        className,
      )}
      style={color ? { color } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}
