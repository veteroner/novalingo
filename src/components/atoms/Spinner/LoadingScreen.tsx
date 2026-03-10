/**
 * LoadingScreen
 *
 * Tam ekran yükleme splash'ı — lazy route'lar için fallback.
 * Nova maskotu ve animasyon ile çocuk-dostu.
 */

import novaMascot from '@assets/images/nova-mascot.svg';
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';

export function LoadingScreen() {
  return (
    <div className="from-nova-sky fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-b to-white">
      {/* Nova mascot */}
      <motion.div
        className="mb-6"
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img src={novaMascot} alt="Nova" className="h-24 w-24" />
      </motion.div>

      {/* App name */}
      <motion.h1
        className="font-heading text-nova-blue mb-4 text-2xl font-extrabold"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        NovaLingo
      </motion.h1>

      <Spinner size="lg" />

      <motion.p
        className="text-text-secondary mt-4 text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Macera hazırlanıyor...
      </motion.p>
    </div>
  );
}
