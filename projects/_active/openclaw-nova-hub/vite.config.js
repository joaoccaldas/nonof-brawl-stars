import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5177,
    strictPort: false,
    open: false,
    allowedHosts: true,
    proxy: {
      '/api/voice': {
        target: 'http://127.0.0.1:5179',
        changeOrigin: true
      },
      '/api/archive': {
        target: 'http://127.0.0.1:5179',
        changeOrigin: true
      },
      '/api/events': {
        target: 'http://127.0.0.1:5179',
        changeOrigin: true
      },
      '/api/chat': {
        target: 'http://127.0.0.1:5179',
        changeOrigin: true
      },
      '/api': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/health': {
        target: 'http://127.0.0.1:18789',
        changeOrigin: true
      },
      '/brawl': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace('/brawl', '')
      }
    }
  },
  build: {
    target: 'es2020',
    sourcemap: true
  }
});