// vitest.config.ts
import { defineConfig as defineConfig2, mergeConfig } from "file:///Volumes/LaCie/novalingo/node_modules/vitest/dist/config.js";

// vite.config.ts
import tailwindcss from "file:///Volumes/LaCie/novalingo/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///Volumes/LaCie/novalingo/node_modules/@vitejs/plugin-react-swc/index.js";
import { readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "file:///Volumes/LaCie/novalingo/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///Volumes/LaCie/novalingo/vite.config.ts";
var __dirname = dirname(fileURLToPath(__vite_injected_original_import_meta_url));
function cleanAppleDoublePlugin() {
  function removeDotUnderscore(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        removeDotUnderscore(full);
      } else if (entry.name.startsWith("._")) {
        rmSync(full, { force: true });
      }
    }
  }
  return {
    name: "clean-apple-double",
    enforce: "pre",
    buildStart() {
      const outDir = resolve(__dirname, "dist");
      try {
        statSync(outDir);
        removeDotUnderscore(outDir);
        for (const entry of readdirSync(outDir)) {
          rmSync(join(outDir, entry), { recursive: true, force: true });
        }
      } catch {
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [cleanAppleDoublePlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@features": resolve(__dirname, "./src/features"),
      "@services": resolve(__dirname, "./src/services"),
      "@stores": resolve(__dirname, "./src/stores"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@types": resolve(__dirname, "./src/types"),
      "@assets": resolve(__dirname, "./src/assets"),
      "@config": resolve(__dirname, "./src/config"),
      "@i18n": resolve(__dirname, "./src/i18n")
    }
  },
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: false,
    // Handled by cleanAppleDoublePlugin (macOS external drive ._* workaround)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-firebase-core": ["firebase/app", "firebase/auth"],
          "vendor-firebase-db": ["firebase/firestore"],
          "vendor-firebase-extras": ["firebase/storage", "firebase/analytics"],
          "vendor-animation": ["framer-motion", "lottie-react"],
          "vendor-audio": ["howler"],
          "vendor-state": ["zustand", "@tanstack/react-query"],
          "vendor-i18n": ["i18next", "react-i18next"]
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3e3,
    host: true,
    open: true
  },
  preview: {
    port: 4173
  }
});

// vitest.config.ts
var vitest_config_default = mergeConfig(
  vite_config_default,
  defineConfig2({
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["node_modules", "dist", "functions", "android", "ios", "src/**/._*"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json-summary", "lcov"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.d.ts",
          "src/**/*.stories.tsx",
          "src/**/*.test.{ts,tsx}",
          "src/test/**",
          "src/types/**"
        ],
        thresholds: {
          statements: 70,
          branches: 65,
          functions: 70,
          lines: 70
        }
      }
    }
  })
);
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Wb2x1bWVzL0xhQ2llL25vdmFsaW5nb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgdml0ZUNvbmZpZyBmcm9tICcuL3ZpdGUuY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgbWVyZ2VDb25maWcoXG4gIHZpdGVDb25maWcsXG4gIGRlZmluZUNvbmZpZyh7XG4gICAgdGVzdDoge1xuICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgIGVudmlyb25tZW50OiAnaGFwcHktZG9tJyxcbiAgICAgIHNldHVwRmlsZXM6IFsnLi9zcmMvdGVzdC9zZXR1cC50cyddLFxuICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57dHMsdHN4fSddLFxuICAgICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMnLCAnZGlzdCcsICdmdW5jdGlvbnMnLCAnYW5kcm9pZCcsICdpb3MnLCAnc3JjLyoqLy5fKiddLFxuICAgICAgY292ZXJhZ2U6IHtcbiAgICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbi1zdW1tYXJ5JywgJ2xjb3YnXSxcbiAgICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dHMsdHN4fSddLFxuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ3NyYy8qKi8qLmQudHMnLFxuICAgICAgICAgICdzcmMvKiovKi5zdG9yaWVzLnRzeCcsXG4gICAgICAgICAgJ3NyYy8qKi8qLnRlc3Que3RzLHRzeH0nLFxuICAgICAgICAgICdzcmMvdGVzdC8qKicsXG4gICAgICAgICAgJ3NyYy90eXBlcy8qKicsXG4gICAgICAgIF0sXG4gICAgICAgIHRocmVzaG9sZHM6IHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiA3MCxcbiAgICAgICAgICBicmFuY2hlczogNjUsXG4gICAgICAgICAgZnVuY3Rpb25zOiA3MCxcbiAgICAgICAgICBsaW5lczogNzAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pLFxuKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVm9sdW1lcy9MYUNpZS9ub3ZhbGluZ28vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IHsgcmVhZGRpclN5bmMsIHJtU3luYywgc3RhdFN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IGRpcm5hbWUsIGpvaW4sIHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG4vKipcbiAqIG1hY09TIGNyZWF0ZXMgQXBwbGVEb3VibGUgYC5fKmAgc2lkZWNhciBmaWxlcyBvbiBleHRlcm5hbCBkcml2ZXMuXG4gKiBUaGVzZSBjYXVzZSBgcm1TeW5jYCBFTk9URU1QVFkgZXJyb3JzIHdoZW4gVml0ZSB0cmllcyB0byBjbGVhbiBgb3V0RGlyYC5cbiAqIFRoaXMgcGx1Z2luIHJlbW92ZXMgdGhlbSBhbmQgZW1wdGllcyBvdXREaXIgbWFudWFsbHkgKHdpdGggZW1wdHlPdXREaXI6IGZhbHNlKS5cbiAqL1xuZnVuY3Rpb24gY2xlYW5BcHBsZURvdWJsZVBsdWdpbigpOiBQbHVnaW4ge1xuICBmdW5jdGlvbiByZW1vdmVEb3RVbmRlcnNjb3JlKGRpcjogc3RyaW5nKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWFkZGlyU3luYyhkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KSkge1xuICAgICAgY29uc3QgZnVsbCA9IGpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcbiAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIHJlbW92ZURvdFVuZGVyc2NvcmUoZnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCgnLl8nKSkge1xuICAgICAgICBybVN5bmMoZnVsbCwgeyBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2xlYW4tYXBwbGUtZG91YmxlJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgY29uc3Qgb3V0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XG4gICAgICB0cnkge1xuICAgICAgICBzdGF0U3luYyhvdXREaXIpO1xuICAgICAgICAvLyBGaXJzdCBwYXNzOiByZW1vdmUgLl8qIHNpZGVjYXIgZmlsZXNcbiAgICAgICAgcmVtb3ZlRG90VW5kZXJzY29yZShvdXREaXIpO1xuICAgICAgICAvLyBTZWNvbmQgcGFzczogcmVtb3ZlIGV2ZXJ5dGhpbmcgbm93IHRoYXQgc2lkZWNhcnMgYXJlIGdvbmVcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWFkZGlyU3luYyhvdXREaXIpKSB7XG4gICAgICAgICAgcm1TeW5jKGpvaW4ob3V0RGlyLCBlbnRyeSksIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIGRpc3QgZG9lc24ndCBleGlzdCB5ZXQgXHUyMDE0IG5vdGhpbmcgdG8gY2xlYW5cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtjbGVhbkFwcGxlRG91YmxlUGx1Z2luKCksIHJlYWN0KCksIHRhaWx3aW5kY3NzKCldLFxuXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAnQGNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAZmVhdHVyZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2ZlYXR1cmVzJyksXG4gICAgICAnQHNlcnZpY2VzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zZXJ2aWNlcycpLFxuICAgICAgJ0BzdG9yZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3N0b3JlcycpLFxuICAgICAgJ0Bob29rcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvaG9va3MnKSxcbiAgICAgICdAdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzJyksXG4gICAgICAnQHR5cGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy90eXBlcycpLFxuICAgICAgJ0Bhc3NldHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2Fzc2V0cycpLFxuICAgICAgJ0Bjb25maWcnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2NvbmZpZycpLFxuICAgICAgJ0BpMThuJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9pMThuJyksXG4gICAgfSxcbiAgfSxcblxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzMjAyMicsXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgZW1wdHlPdXREaXI6IGZhbHNlLCAvLyBIYW5kbGVkIGJ5IGNsZWFuQXBwbGVEb3VibGVQbHVnaW4gKG1hY09TIGV4dGVybmFsIGRyaXZlIC5fKiB3b3JrYXJvdW5kKVxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgJ3ZlbmRvci1maXJlYmFzZS1jb3JlJzogWydmaXJlYmFzZS9hcHAnLCAnZmlyZWJhc2UvYXV0aCddLFxuICAgICAgICAgICd2ZW5kb3ItZmlyZWJhc2UtZGInOiBbJ2ZpcmViYXNlL2ZpcmVzdG9yZSddLFxuICAgICAgICAgICd2ZW5kb3ItZmlyZWJhc2UtZXh0cmFzJzogWydmaXJlYmFzZS9zdG9yYWdlJywgJ2ZpcmViYXNlL2FuYWx5dGljcyddLFxuICAgICAgICAgICd2ZW5kb3ItYW5pbWF0aW9uJzogWydmcmFtZXItbW90aW9uJywgJ2xvdHRpZS1yZWFjdCddLFxuICAgICAgICAgICd2ZW5kb3ItYXVkaW8nOiBbJ2hvd2xlciddLFxuICAgICAgICAgICd2ZW5kb3Itc3RhdGUnOiBbJ3p1c3RhbmQnLCAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXG4gICAgICAgICAgJ3ZlbmRvci1pMThuJzogWydpMThuZXh0JywgJ3JlYWN0LWkxOG5leHQnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcbiAgfSxcblxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3BlbjogdHJ1ZSxcbiAgfSxcblxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNDE3MyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4UCxTQUFTLGdCQUFBQSxlQUFjLG1CQUFtQjs7O0FDQTlDLE9BQU8saUJBQWlCO0FBQ2xSLE9BQU8sV0FBVztBQUNsQixTQUFTLGFBQWEsUUFBUSxnQkFBZ0I7QUFDOUMsU0FBUyxTQUFTLE1BQU0sZUFBZTtBQUN2QyxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLG9CQUFpQztBQUw4RyxJQUFNLDJDQUEyQztBQU96TSxJQUFNLFlBQVksUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFPeEQsU0FBUyx5QkFBaUM7QUFDeEMsV0FBUyxvQkFBb0IsS0FBbUI7QUFDOUMsZUFBVyxTQUFTLFlBQVksS0FBSyxFQUFFLGVBQWUsS0FBSyxDQUFDLEdBQUc7QUFDN0QsWUFBTSxPQUFPLEtBQUssS0FBSyxNQUFNLElBQUk7QUFDakMsVUFBSSxNQUFNLFlBQVksR0FBRztBQUN2Qiw0QkFBb0IsSUFBSTtBQUFBLE1BQzFCLFdBQVcsTUFBTSxLQUFLLFdBQVcsSUFBSSxHQUFHO0FBQ3RDLGVBQU8sTUFBTSxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQUEsTUFDOUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFDWCxZQUFNLFNBQVMsUUFBUSxXQUFXLE1BQU07QUFDeEMsVUFBSTtBQUNGLGlCQUFTLE1BQU07QUFF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
