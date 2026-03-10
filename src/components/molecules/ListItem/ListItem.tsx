/**
 * ListItem Molecule
 *
 * Ayarlar, liderlik tablosu satırı, vb. için genel liste elemanı.
 */

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface ListItemProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
  className?: string;
}

export function ListItem({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  divider = false,
  className,
}: ListItemProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={clsx(
        'flex w-full items-center gap-3 px-4 py-3',
        onClick && 'cursor-pointer transition-colors active:bg-gray-50',
        divider && 'border-b border-gray-100',
        className,
      )}
      onClick={onClick}
    >
      {leading && <div className="shrink-0">{leading}</div>}

      <div className="min-w-0 flex-1 text-left">
        <p className="text-text-primary truncate text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-text-secondary mt-0.5 truncate text-xs">{subtitle}</p>}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </Component>
  );
}
