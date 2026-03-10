// vitest.config.ts
import { defineConfig as defineConfig2, mergeConfig } from "file:///Volumes/LaCie/novalingo/node_modules/vitest/dist/config.js";

// vite.config.ts
import tailwindcss from "file:///Volumes/LaCie/novalingo/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///Volumes/LaCie/novalingo/node_modules/@vitejs/plugin-react-swc/index.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "file:///Volumes/LaCie/novalingo/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///Volumes/LaCie/novalingo/vite.config.ts";
var __dirname = dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
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
    sourcemap: true,
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
          "vendor-sentry": ["@sentry/react"],
          "vendor-i18n": ["i18next", "react-i18next"]
        }
      }
    },
    chunkSizeWarningLimit: 300
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Wb2x1bWVzL0xhQ2llL25vdmFsaW5nb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgdml0ZUNvbmZpZyBmcm9tICcuL3ZpdGUuY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgbWVyZ2VDb25maWcoXG4gIHZpdGVDb25maWcsXG4gIGRlZmluZUNvbmZpZyh7XG4gICAgdGVzdDoge1xuICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgIGVudmlyb25tZW50OiAnaGFwcHktZG9tJyxcbiAgICAgIHNldHVwRmlsZXM6IFsnLi9zcmMvdGVzdC9zZXR1cC50cyddLFxuICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57dHMsdHN4fSddLFxuICAgICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMnLCAnZGlzdCcsICdmdW5jdGlvbnMnLCAnYW5kcm9pZCcsICdpb3MnLCAnc3JjLyoqLy5fKiddLFxuICAgICAgY292ZXJhZ2U6IHtcbiAgICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbi1zdW1tYXJ5JywgJ2xjb3YnXSxcbiAgICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dHMsdHN4fSddLFxuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ3NyYy8qKi8qLmQudHMnLFxuICAgICAgICAgICdzcmMvKiovKi5zdG9yaWVzLnRzeCcsXG4gICAgICAgICAgJ3NyYy8qKi8qLnRlc3Que3RzLHRzeH0nLFxuICAgICAgICAgICdzcmMvdGVzdC8qKicsXG4gICAgICAgICAgJ3NyYy90eXBlcy8qKicsXG4gICAgICAgIF0sXG4gICAgICAgIHRocmVzaG9sZHM6IHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiA3MCxcbiAgICAgICAgICBicmFuY2hlczogNjUsXG4gICAgICAgICAgZnVuY3Rpb25zOiA3MCxcbiAgICAgICAgICBsaW5lczogNzAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pLFxuKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVm9sdW1lcy9MYUNpZS9ub3ZhbGluZ28vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IHsgZGlybmFtZSwgcmVzb2x2ZSB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKTtcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXG5cbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICdAY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29tcG9uZW50cycpLFxuICAgICAgJ0BmZWF0dXJlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvZmVhdHVyZXMnKSxcbiAgICAgICdAc2VydmljZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3NlcnZpY2VzJyksXG4gICAgICAnQHN0b3Jlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc3RvcmVzJyksXG4gICAgICAnQGhvb2tzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9ob29rcycpLFxuICAgICAgJ0B1dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMnKSxcbiAgICAgICdAdHlwZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3R5cGVzJyksXG4gICAgICAnQGFzc2V0cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvYXNzZXRzJyksXG4gICAgICAnQGNvbmZpZyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29uZmlnJyksXG4gICAgICAnQGkxOG4nOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2kxOG4nKSxcbiAgICB9LFxuICB9LFxuXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIyJyxcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgJ3ZlbmRvci1maXJlYmFzZS1jb3JlJzogWydmaXJlYmFzZS9hcHAnLCAnZmlyZWJhc2UvYXV0aCddLFxuICAgICAgICAgICd2ZW5kb3ItZmlyZWJhc2UtZGInOiBbJ2ZpcmViYXNlL2ZpcmVzdG9yZSddLFxuICAgICAgICAgICd2ZW5kb3ItZmlyZWJhc2UtZXh0cmFzJzogWydmaXJlYmFzZS9zdG9yYWdlJywgJ2ZpcmViYXNlL2FuYWx5dGljcyddLFxuICAgICAgICAgICd2ZW5kb3ItYW5pbWF0aW9uJzogWydmcmFtZXItbW90aW9uJywgJ2xvdHRpZS1yZWFjdCddLFxuICAgICAgICAgICd2ZW5kb3ItYXVkaW8nOiBbJ2hvd2xlciddLFxuICAgICAgICAgICd2ZW5kb3Itc3RhdGUnOiBbJ3p1c3RhbmQnLCAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXG4gICAgICAgICAgJ3ZlbmRvci1zZW50cnknOiBbJ0BzZW50cnkvcmVhY3QnXSxcbiAgICAgICAgICAndmVuZG9yLWkxOG4nOiBbJ2kxOG5leHQnLCAncmVhY3QtaTE4bmV4dCddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMzAwLFxuICB9LFxuXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBvcGVuOiB0cnVlLFxuICB9LFxuXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThQLFNBQVMsZ0JBQUFBLGVBQWMsbUJBQW1COzs7QUNBOUMsT0FBTyxpQkFBaUI7QUFDbFIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsU0FBUyxlQUFlO0FBQ2pDLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBSjJILElBQU0sMkNBQTJDO0FBTXpNLElBQU0sWUFBWSxRQUFRLGNBQWMsd0NB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
