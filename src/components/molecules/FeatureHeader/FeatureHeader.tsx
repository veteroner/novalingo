import type { ReactNode } from 'react';
import { Text } from '@components/atoms/Text';

interface FeatureHeaderProps {
  title: string;
  description?: string;
  icon: ReactNode;
  children?: ReactNode;
}

/** Shared heading for the child's discovery, goals and collection screens. */
export function FeatureHeader({ title, description, icon, children }: FeatureHeaderProps) {
  return (
    <header className="nova-feature-header">
      <span className="nova-feature-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <Text variant="h3">{title.replace(/^[^\p{L}\p{N}]+/u, '')}</Text>
        {description && (
          <Text variant="bodySmall" className="text-text-secondary mt-1">
            {description}
          </Text>
        )}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </header>
  );
}
