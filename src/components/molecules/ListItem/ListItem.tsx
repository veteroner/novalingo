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
        'flex items-center gap-3 w-full px-4 py-3',
        onClick && 'active:bg-gray-50 transition-colors cursor-pointer',
        divider && 'border-b border-gray-100',
        className,
      )}
      onClick={onClick}
    >
      {leading && <div className="shrink-0">{leading}</div>}

      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-text-primary truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-text-secondary truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </Component>
  );
}
