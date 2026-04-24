import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { cpSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';

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
      const publicDir = resolve(__dirname, 'public');
      try {
        statSync(publicDir);
        removeDotUnderscore(publicDir);
      } catch {
        // public doesn't exist yet — nothing to clean
      }

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

function stripBundledTtsPlugin(bundleTtsAudio: boolean): Plugin {
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
    name: 'strip-bundled-tts',
    writeBundle() {
      if (bundleTtsAudio) return;

      const bundledTtsDir = resolve(__dirname, 'dist/audio/tts');
      try {
        removeDotUnderscore(bundledTtsDir);
      } catch {
        // Directory may already be absent.
      }
      rmSync(bundledTtsDir, { recursive: true, force: true });
    },
  };
}

function copyFilteredPublicAssetsPlugin(bundleTtsAudio: boolean): Plugin {
  return {
    name: 'copy-filtered-public-assets',
    apply: 'build',
    writeBundle() {
      if (bundleTtsAudio) return;

      const publicDir = resolve(__dirname, 'public');
      const outDir = resolve(__dirname, 'dist');

      try {
        statSync(publicDir);
      } catch {
        return;
      }

      cpSync(publicDir, outDir, {
        recursive: true,
        force: true,
        filter: (src) => {
          const normalized = src.replaceAll('\\', '/');
          const name = normalized.split('/').pop() ?? '';
          if (name.startsWith('._')) return false;
          if (normalized.includes('/public/audio/tts')) return false;
          return true;
        },
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const bundleTtsAudio = env.VITE_BUNDLE_TTS_AUDIO !== 'false';

  return {
    plugins: [
      cleanAppleDoublePlugin(),
      copyFilteredPublicAssetsPlugin(bundleTtsAudio),
      stripBundledTtsPlugin(bundleTtsAudio),
      react(),
      tailwindcss(),
    ],

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

    publicDir: bundleTtsAudio ? 'public' : false,

    server: {
      port: 3000,
      host: true,
      open: true,
    },

    preview: {
      port: 4173,
    },
  };
});
