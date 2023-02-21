import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tsconfigPaths()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://airepair-test.celestialstudio.net/',
        changeOrigin: true,
        secure: false
      }
    }
  },
});
