import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  root: 'build',
  publicDir: '../public', // Static assets that get copied to dist/
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 8765,
    host: true
  }
})
