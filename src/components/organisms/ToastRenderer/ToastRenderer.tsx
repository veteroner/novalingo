/**
 * ToastRenderer Organism
 *
 * uiStore'daki toasts dizisini ekranda gösterir.
 * Her toast otomatik olarak kaybolur (store tarafında setTimeout).
 */

import { Text } from '@components/atoms/Text';
import { useUIStore } from '@stores/uiStore';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const defaultStyle = { bg: 'bg-nova-blue/10', border: 'border-nova-blue/30', iconFallback: 'ℹ️' };

const typeStyles: Record<string, { bg: string; border: string; iconFallback: string }> = {
  success: { bg: 'bg-success/10', border: 'border-success/30', iconFallback: '✅' },
  error: { bg: 'bg-error/10', border: 'border-error/30', iconFallback: '❌' },
  info: defaultStyle,
  achievement: { bg: 'bg-nova-yellow/10', border: 'border-nova-yellow/30', iconFallback: '🏆' },
  levelUp: { bg: 'bg-nova-purple/10', border: 'border-nova-purple/30', iconFallback: '⬆️' },
};

export function ToastRenderer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="pointer-events-none fixed top-4 right-0 left-0 z-100 flex flex-col items-center gap-2 px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = typeStyles[toast.type] ?? defaultStyle;
          return (
            <motion.div
              key={toast.id}
              layout
              className={clsx(
                'pointer-events-auto w-full max-w-sm cursor-pointer rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md',
                style.bg,
                style.border,
              )}
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => removeToast(toast.id)}
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-2xl">{toast.icon ?? style.iconFallback}</span>
                <div className="min-w-0 flex-1">
                  <Text variant="bodySmall" weight="bold">
                    {toast.title}
                  </Text>
                  {toast.message && (
                    <Text variant="caption" className="text-text-secondary">
                      {toast.message}
                    </Text>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
