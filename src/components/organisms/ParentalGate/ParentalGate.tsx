/**
 * ParentalGate
 *
 * Ebeveyn kapısı — basit matematik sorusuyla çocuğun
 * yanlışlıkla profil oluşturmasını veya ayarlara erişmesini engeller.
 * COPPA uyumluluğu için gerekli.
 */

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';

interface ParentalGateProps {
  onPass: () => void;
  onCancel: () => void;
}

function generateQuestion(): { text: string; answer: number } {
  const a = Math.floor(Math.random() * 9) + 2; // 2-10
  const b = Math.floor(Math.random() * 9) + 2; // 2-10
  return { text: `${a} × ${b} = ?`, answer: a * b };
}

export function ParentalGate({ onPass, onCancel }: ParentalGateProps) {
  const question = useMemo(() => generateQuestion(), []);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(() => {
    const parsed = parseInt(input, 10);
    if (parsed === question.answer) {
      onPass();
    } else {
      setError(true);
      setInput('');
    }
  }, [input, question.answer, onPass]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <Text variant="h3" align="center" className="mb-2">
            🔒 Ebeveyn Doğrulaması
          </Text>
          <Text variant="body" align="center" className="text-text-secondary mb-6">
            Devam etmek için aşağıdaki soruyu cevaplayın.
          </Text>

          <Text variant="h2" align="center" className="text-nova-blue mb-6">
            {question.text}
          </Text>

          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="Cevabı yazın"
            className="focus:border-nova-blue mb-2 h-14 w-full rounded-2xl border-3 border-gray-200 bg-white px-4 text-center text-2xl font-bold transition-colors focus:outline-none"
            autoFocus
          />

          {error && (
            <Text variant="caption" align="center" className="text-error mb-2">
              Yanlış cevap, tekrar deneyin.
            </Text>
          )}

          <div className="mt-4 space-y-2">
            <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={!input}>
              Doğrula
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
              İptal
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
