import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * macOS creates AppleDouble `._*` sidecar files on external drives.
 * These cause `rmSync` ENOTEMPTY errors when Vite tries to clean `outDir`.
 * This plugin removes them and empties outDir manually (with emptyOutDir: false).
 */
function cleanAppleDoublePlugin(): Plugin {
  function removeDotUnderscore(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        removeDotUnderscore(full);
      } else if (entry.name.startsWith('._')) {
        rmSync(full, { force: true });
      }
    }
  }
  return {
    name: 'clean-apple-double',
    enforce: 'pre',
    buildStart() {
      const outDir = resolve(__dirname, 'dist');
      try {
        statSync(outDir);
        // First pass: remove ._* sidecar files
        removeDotUnderscore(outDir);
        // Second pass: remove everything now that sidecars are gone
        for (const entry of readdirSync(outDir)) {
          rmSync(join(outDir, entry), { recursive: true, force: true });
        }
      } catch {
        // dist doesn't exist yet — nothing to clean
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [cleanAppleDoublePlugin(), react(), tailwindcss()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@features': resolve(__dirname, './src/features'),
      '@services': resolve(__dirname, './src/services'),
      '@stores': resolve(__dirname, './src/stores'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@assets': resolve(__dirname, './src/assets'),
      '@config': resolve(__dirname, './src/config'),
      '@i18n': resolve(__dirname, './src/i18n'),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: false, // Handled by cleanAppleDoublePlugin (macOS external drive ._* workaround)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase-core': ['firebase/app', 'firebase/auth'],
          'vendor-firebase-db': ['firebase/firestore'],
          'vendor-firebase-extras': ['firebase/storage', 'firebase/analytics'],
          'vendor-animation': ['framer-motion', 'lottie-react'],
          'vendor-audio': ['howler'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  server: {
    port: 3000,
    host: true,
    open: true,
  },

  preview: {
    port: 4173,
  },
});
