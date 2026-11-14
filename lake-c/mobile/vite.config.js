import { defineConfig } from 'vite';
export default defineConfig({
  root: '.',
  build: {
    lib: { entry: 'src/live-sync.js', formats: ['iife'], name: 'LakecNearby', fileName: () => 'lakec-nearby.js' },
    outDir: 'www/assets',
    emptyOutDir: false,
    sourcemap: false,
    minify: true
  }
});
