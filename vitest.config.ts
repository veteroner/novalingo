import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig(async ({ mode }) => {
  const resolvedViteConfig =
    typeof viteConfig === 'function'
      ? await viteConfig({
          mode,
          command: 'serve',
          isSsrBuild: false,
          isPreview: false,
        })
      : viteConfig;

  return mergeConfig(
    resolvedViteConfig,
    defineConfig({
      test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', 'functions', 'android', 'ios', 'src/**/._*'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json-summary', 'lcov'],
          include: ['src/**/*.{ts,tsx}'],
          exclude: [
            'src/**/*.d.ts',
            'src/**/*.stories.tsx',
            'src/**/*.test.{ts,tsx}',
            'src/test/**',
            'src/types/**',
          ],
          // Eşikler ölçülen tabana göre (ratchet): CI bu adıma Eylül 2026'ya kadar hiç
          // ulaşamadığı için `functions: 70` hiç zorlanmadı; gerçek değer %38,5.
          // Amaç kapsamın düşmesini engellemek — yeni testlerle birlikte yükseltin.
          thresholds: {
            statements: 70,
            branches: 65,
            functions: 38,
            lines: 70,
          },
        },
      },
    }),
  );
});
