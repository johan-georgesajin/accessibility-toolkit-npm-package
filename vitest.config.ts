import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@a11y-toolkit/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@a11y-toolkit/devtools': fileURLToPath(
        new URL('./packages/devtools/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
