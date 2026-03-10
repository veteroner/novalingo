/**
 * Audio Service
 *
 * Howler.js wrapper — ses efektleri ve müzik yönetimi.
 * Provider'dan bağımsız, doğrudan service olarak da kullanılabilir.
 */

import { Howl, Howler } from 'howler';

// Ses sprite haritası — tek dosyadan birden fazla ses
const SPRITE_MAP: Record<string, [number, number]> = {
  // [başlangıç ms, süre ms]
  tap: [0, 150],
  correct: [200, 800],
  wrong: [1100, 600],
  pop: [1800, 200],
  whoosh: [2100, 400],
  coin: [2600, 500],
};

let spriteSheet: Howl | null = null;
const audioCache = new Map<string, Howl>();

/**
 * Ses sprite sheet'ini yükle
 */
export function loadSpriteSheet(): void {
  if (spriteSheet) return;

  spriteSheet = new Howl({
    src: ['/assets/sounds/sfx/sprite.webm', '/assets/sounds/sfx/sprite.mp3'],
    sprite: SPRITE_MAP,
    volume: 0.7,
    preload: true,
  });
}

/**
 * Sprite'dan ses çal
 */
export function playSprite(name: string): void {
  if (!spriteSheet) loadSpriteSheet();
  spriteSheet?.play(name);
}

/**
 * Tek ses dosyası çal
 */
export function playSound(url: string, volume = 0.7): Howl {
  let howl = audioCache.get(url);

  if (!howl) {
    howl = new Howl({ src: [url], volume, preload: true });
    audioCache.set(url, howl);
  }

  howl.play();
  return howl;
}

/**
 * Kelime telaffuzunu çal
 */
export function playWord(audioUrl: string): Promise<void> {
  return new Promise((resolve) => {
    const howl = new Howl({
      src: [audioUrl],
      volume: 1.0,
      onend: () => {
        resolve();
      },
      onloaderror: () => {
        resolve();
      },
    });
    howl.play();
  });
}

/**
 * Tüm sesleri durdur
 */
export function stopAll(): void {
  Howler.stop();
}

/**
 * Global ses seviyesi
 */
export function setGlobalVolume(volume: number): void {
  Howler.volume(Math.max(0, Math.min(1, volume)));
}

/**
 * Sesleri sessize al / aç
 */
export function setMuted(muted: boolean): void {
  Howler.mute(muted);
}

/**
 * Audio cache'i temizle
 */
export function clearAudioCache(): void {
  audioCache.forEach((howl) => howl.unload());
  audioCache.clear();
}
