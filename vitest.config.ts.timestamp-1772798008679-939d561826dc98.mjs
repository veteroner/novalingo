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
          "vendor-firebase": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
            "firebase/analytics"
          ],
          "vendor-animation": ["framer-motion", "lottie-react"],
          "vendor-audio": ["howler"],
          "vendor-state": ["zustand", "@tanstack/react-query"]
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
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["node_modules", "dist", "functions", "android", "ios"],
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Wb2x1bWVzL0xhQ2llL25vdmFsaW5nb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1ZvbHVtZXMvTGFDaWUvbm92YWxpbmdvL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgdml0ZUNvbmZpZyBmcm9tICcuL3ZpdGUuY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgbWVyZ2VDb25maWcoXG4gIHZpdGVDb25maWcsXG4gIGRlZmluZUNvbmZpZyh7XG4gICAgdGVzdDoge1xuICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgICAgc2V0dXBGaWxlczogWycuL3NyYy90ZXN0L3NldHVwLnRzJ10sXG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLnt0ZXN0LHNwZWN9Lnt0cyx0c3h9J10sXG4gICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcycsICdkaXN0JywgJ2Z1bmN0aW9ucycsICdhbmRyb2lkJywgJ2lvcyddLFxuICAgICAgY292ZXJhZ2U6IHtcbiAgICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbi1zdW1tYXJ5JywgJ2xjb3YnXSxcbiAgICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dHMsdHN4fSddLFxuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ3NyYy8qKi8qLmQudHMnLFxuICAgICAgICAgICdzcmMvKiovKi5zdG9yaWVzLnRzeCcsXG4gICAgICAgICAgJ3NyYy8qKi8qLnRlc3Que3RzLHRzeH0nLFxuICAgICAgICAgICdzcmMvdGVzdC8qKicsXG4gICAgICAgICAgJ3NyYy90eXBlcy8qKicsXG4gICAgICAgIF0sXG4gICAgICAgIHRocmVzaG9sZHM6IHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiA3MCxcbiAgICAgICAgICBicmFuY2hlczogNjUsXG4gICAgICAgICAgZnVuY3Rpb25zOiA3MCxcbiAgICAgICAgICBsaW5lczogNzAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9MYUNpZS9ub3ZhbGluZ29cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL0xhQ2llL25vdmFsaW5nby92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9MYUNpZS9ub3ZhbGluZ28vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcblxuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ0Bjb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGZlYXR1cmVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9mZWF0dXJlcycpLFxuICAgICAgJ0BzZXJ2aWNlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc2VydmljZXMnKSxcbiAgICAgICdAc3RvcmVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zdG9yZXMnKSxcbiAgICAgICdAaG9va3MnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2hvb2tzJyksXG4gICAgICAnQHV0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscycpLFxuICAgICAgJ0B0eXBlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdHlwZXMnKSxcbiAgICAgICdAYXNzZXRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9hc3NldHMnKSxcbiAgICAgICdAY29uZmlnJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb25maWcnKSxcbiAgICAgICdAaTE4bic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvaTE4bicpLFxuICAgIH0sXG4gIH0sXG5cbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjInLFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAndmVuZG9yLWZpcmViYXNlJzogW1xuICAgICAgICAgICAgJ2ZpcmViYXNlL2FwcCcsXG4gICAgICAgICAgICAnZmlyZWJhc2UvYXV0aCcsXG4gICAgICAgICAgICAnZmlyZWJhc2UvZmlyZXN0b3JlJyxcbiAgICAgICAgICAgICdmaXJlYmFzZS9zdG9yYWdlJyxcbiAgICAgICAgICAgICdmaXJlYmFzZS9hbmFseXRpY3MnLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgJ3ZlbmRvci1hbmltYXRpb24nOiBbJ2ZyYW1lci1tb3Rpb24nLCAnbG90dGllLXJlYWN0J10sXG4gICAgICAgICAgJ3ZlbmRvci1hdWRpbyc6IFsnaG93bGVyJ10sXG4gICAgICAgICAgJ3ZlbmRvci1zdGF0ZSc6IFsnenVzdGFuZCcsICdAdGFuc3RhY2svcmVhY3QtcXVlcnknXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDMwMCxcbiAgfSxcblxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3BlbjogdHJ1ZSxcbiAgfSxcblxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNDE3MyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4UCxTQUFTLGdCQUFBQSxlQUFjLG1CQUFtQjs7O0FDQTlDLE9BQU8saUJBQWlCO0FBQ2xSLE9BQU8sV0FBVztBQUNsQixTQUFTLFNBQVMsZUFBZTtBQUNqQyxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLG9CQUFvQjtBQUoySCxJQUFNLDJDQUEyQztBQU16TSxJQUFNLFlBQVksUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFHeEQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUVoQyxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsV0FBVyxPQUFPO0FBQUEsTUFDL0IsZUFBZSxRQUFRLFdBQVcsa0JBQWtCO0FBQUEsTUFDcEQsYUFBYSxRQUFRLFdBQVcsZ0JBQWdCO0FBQUEsTUFDaEQsYUFBYSxRQUFRLFdBQVcsZ0JBQWdCO0FBQUEsTUFDaEQsV0FBVyxRQUFRLFdBQVcsY0FBYztBQUFBLE1BQzVDLFVBQVUsUUFBUSxXQUFXLGFBQWE7QUFBQSxNQUMxQyxVQUFVLFFBQVEsV0FBVyxhQUFhO0FBQUEsTUFDMUMsVUFBVSxRQUFRLFdBQVcsYUFBYTtBQUFBLE1BQzFDLFdBQVcsUUFBUSxXQUFXLGNBQWM7QUFBQSxNQUM1QyxXQUFXLFFBQVEsV0FBVyxjQUFjO0FBQUEsTUFDNUMsU0FBUyxRQUFRLFdBQVcsWUFBWTtBQUFBLElBQzFDO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELG1CQUFtQjtBQUFBLFlBQ2pCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLG9CQUFvQixDQUFDLGlCQUFpQixjQUFjO0FBQUEsVUFDcEQsZ0JBQWdCLENBQUMsUUFBUTtBQUFBLFVBQ3pCLGdCQUFnQixDQUFDLFdBQVcsdUJBQXVCO0FBQUEsUUFDckQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7OztBRDFERCxJQUFPLHdCQUFRO0FBQUEsRUFDYjtBQUFBLEVBQ0FDLGNBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxNQUNKLFNBQVM7QUFBQSxNQUNULGFBQWE7QUFBQSxNQUNiLFlBQVksQ0FBQyxxQkFBcUI7QUFBQSxNQUNsQyxTQUFTLENBQUMsK0JBQStCO0FBQUEsTUFDekMsU0FBUyxDQUFDLGdCQUFnQixRQUFRLGFBQWEsV0FBVyxLQUFLO0FBQUEsTUFDL0QsVUFBVTtBQUFBLFFBQ1IsVUFBVTtBQUFBLFFBQ1YsVUFBVSxDQUFDLFFBQVEsZ0JBQWdCLE1BQU07QUFBQSxRQUN6QyxTQUFTLENBQUMsbUJBQW1CO0FBQUEsUUFDN0IsU0FBUztBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLFFBQ0EsWUFBWTtBQUFBLFVBQ1YsWUFBWTtBQUFBLFVBQ1osVUFBVTtBQUFBLFVBQ1YsV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogWyJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIl0KfQo=
