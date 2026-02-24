import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['lit', 'lit/decorators.js', 'lit/directives/class-map.js'],
    },
    outDir: 'dist',
  },
});
