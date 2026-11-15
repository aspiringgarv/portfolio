import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build output goes straight into Spring Boot's static folder so one jar serves everything.
export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  build: { outDir: '../backend/src/main/resources/static', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/live': { target: 'ws://localhost:8080', ws: true },
    },
  },
});
