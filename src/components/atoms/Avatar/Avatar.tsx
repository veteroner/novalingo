/**
 * Avatar Atom
 *
 * Çocuk profil fotoğrafı / avatarı.
 * Nova companion küçük overlay desteği ile.
 */

import { clsx } from 'clsx';
import { type ImgHTMLAttributes, useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className' | 'src'> {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  borderColor?: string;
  showLevel?: number;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-28 w-28 text-2xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Deterministic color from name
function getColor(name: string): string {
  const colors = [
    'bg-nova-blue',
    'bg-nova-orange',
    'bg-nova-purple',
    'bg-success',
    'bg-nova-pink',
    'bg-nova-teal',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? 'bg-nova-blue';
}

export function Avatar({
  src,
  name = '?',
  size = 'md',
  borderColor,
  showLevel,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className={clsx(
            'rounded-full border-3 border-white object-cover shadow-md',
            sizeStyles[size],
          )}
          style={borderColor ? { borderColor } : undefined}
          onError={() => {
            setImgError(true);
          }}
          {...props}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full border-3 border-white shadow-md',
            'flex items-center justify-center font-bold text-white',
            sizeStyles[size],
            getColor(name),
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {showLevel != null && (
        <span
          className={clsx(
            'absolute -bottom-1 left-1/2 -translate-x-1/2',
            'bg-nova-purple text-[0.5rem] font-bold text-white',
            'rounded-full border-2 border-white px-1.5 py-0.5 shadow',
          )}
        >
          {showLevel}
        </span>
      )}
    </div>
  );
}
