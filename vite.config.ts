import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: {
        'index': 'src/index.ts',
        'react': 'src/react.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^lit(\/|$)/,
        /^lit-html(\/|$)/,
        /^lit-element(\/|$)/,
        /^@lit\//,
        'react',
        'react-dom',
        'react-dom/client',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
  },
});
