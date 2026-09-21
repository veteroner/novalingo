import { defineConfig } from 'vitest/config';

/**
 * Firestore güvenlik kuralları testleri.
 *
 * Emülatör gerektirir; `pnpm test:rules` komutu emülatörü otomatik başlatır.
 * Varsayılan `pnpm test` bu dosyaları kapsamaz (include yalnızca src/).
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    // exFAT sürücüde macOS `._*` AppleDouble ikizleri oluşturur — hariç tut.
    exclude: ['node_modules', 'tests/**/._*'],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
