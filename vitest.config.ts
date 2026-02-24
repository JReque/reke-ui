import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    include: ['src/**/*.test.ts'],
  },
});
