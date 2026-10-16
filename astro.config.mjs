// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    // three.js lives in its own lazily-imported chunk (~140 kB gzip); it never blocks first paint.
    build: { chunkSizeWarningLimit: 700 },
  },
});
