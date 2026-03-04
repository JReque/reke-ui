import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: {
        'reke-ui': 'src/index.ts',
        'react': 'src/react.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'lit',
        'lit/decorators.js',
        'lit/directives/class-map.js',
        'react',
        '@lit/react',
      ],
    },
    outDir: 'dist',
  },
});
