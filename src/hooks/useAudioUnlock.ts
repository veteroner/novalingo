/**
 * useAudioUnlock
 *
 * Mobil tarayıcı ve WebView'lerde autoplay policy
 * nedeniyle audio context'i ilk kullanıcı etkileşiminde açar.
 * Bu sayede ders içi TTS otomatik çalabilir.
 */

import { isAudioUnlocked, unlockAudioPlayback } from '@/services/speech/speechService';
import { useEffect } from 'react';

export function useAudioUnlock(): void {
  useEffect(() => {
    if (isAudioUnlocked()) return;

    const unlock = () => {
      void unlockAudioPlayback().then(() => {
        // Başarılı → listener'ları kaldır
        document.removeEventListener('touchstart', unlock, true);
        document.removeEventListener('click', unlock, true);
      });
    };

    document.addEventListener('touchstart', unlock, { capture: true, once: false, passive: true });
    document.addEventListener('click', unlock, { capture: true, once: false });

    return () => {
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('click', unlock, true);
    };
  }, []);
}
